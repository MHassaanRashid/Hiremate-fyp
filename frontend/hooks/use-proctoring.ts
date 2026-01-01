import { useEffect, useRef, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import {
    getGlobalModelInstance,
    setGlobalModelInstance,
    getGlobalObjectDetector,
    setGlobalObjectDetector,
    isGloballyInitializingModels,
    setGloballyInitializing
} from './proctoring-models-singleton';

export type ViolationType = 'phone' | 'focus' | 'multi-face' | 'no-face' | 'tab-blur' | 'head-pose';

interface UseProctoringProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    isActive: boolean;
    onWarning: (count: number, reason: string, type: ViolationType) => void;
    onTerminate: (reason: string, proof: string) => void;
}

export function useProctoring({ videoRef, isActive, onWarning, onTerminate }: UseProctoringProps) {
    const [warningCount, setWarningCount] = useState(0);
    const [status, setStatus] = useState<'active' | 'warning' | 'terminated'>('active');
    const [irisMetrics, setIrisMetrics] = useState<{ x: number, y: number } | null>(null);
    const [rawMetrics, setRawMetrics] = useState<{ x: number, y: number, blink: number } | null>(null);
    const [isModelReady, setIsModelReady] = useState(false);
    const [isCalibrated, setIsCalibrated] = useState(false);
    const [diagnostics, setDiagnostics] = useState<string[]>([]);
    const [detectedObjects, setDetectedObjects] = useState<string[]>([]);
    const [violationLogs, setViolationLogs] = useState<{ type: ViolationType, time: string, reason: string }[]>([]);

    // Internal refs
    const warningCountRef = useRef(0);
    const lastWarningTimeRef = useRef<number>(0);
    const noFaceStartTimeRef = useRef<number>(0);
    const lookAwayStartTimeRef = useRef<number>(0);
    const phoneStartTimeRef = useRef<number>(0);
    const multipleFaceStartTimeRef = useRef<number>(0);
    const logsRef = useRef<{ type: ViolationType, time: string, reason: string }[]>([]);

    // Baseline Calibration
    const baselineMetricsRef = useRef<{ x: number, y: number } | null>(null);
    const calibrationStartTimeRef = useRef<number>(0);
    const calibrationSamplesRef = useRef<{ x: number, y: number }[]>([]);

    // Model refs
    const objectDetectorRef = useRef<cocoSsd.ObjectDetection | null>(null);
    const lastObjectCheckTimeRef = useRef<number>(0);
    const isMountedRef = useRef(true);
    const lastIrisMetricsRef = useRef<{ x: number, y: number } | null>(null);
    const isInitializingRef = useRef(false);
    const modelInstanceRef = useRef<{ faceMesh: any, camera: any } | null>(null);
    const isClosingRef = useRef(false);
    const blinkStartTimeRef = useRef<number>(0);
    const detectionHistoryRef = useRef<string[][]>([]);

    const captureProof = useCallback(() => {
        if (!videoRef.current) return '';
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0);
            return canvas.toDataURL('image/jpeg', 0.8);
        }
        return '';
    }, [videoRef]);

    const onWarningRef = useRef(onWarning);
    const onTerminateRef = useRef(onTerminate);

    useEffect(() => {
        onWarningRef.current = onWarning;
        onTerminateRef.current = onTerminate;
    }, [onWarning, onTerminate]);

    const handleViolation = useCallback((reason: string, type: ViolationType) => {
        const now = Date.now();
        if (!isActive) return;
        if (now - lastWarningTimeRef.current < 4000) return;

        lastWarningTimeRef.current = now;
        warningCountRef.current += 1;

        const logEntry = { type, time: new Date().toISOString(), reason };
        logsRef.current.push(logEntry);

        if (isMountedRef.current) {
            setWarningCount(warningCountRef.current);
            setStatus('warning');
            setViolationLogs([...logsRef.current]);
            if (onWarningRef.current) onWarningRef.current(warningCountRef.current, reason, type);
        }

        if (warningCountRef.current >= 15) {
            if (isMountedRef.current) setStatus('terminated');
            const proof = captureProof();
            if (onTerminateRef.current) onTerminateRef.current("Excessive violations across all categories.", proof);
        } else {
            setTimeout(() => {
                if (isMountedRef.current && status !== 'terminated') setStatus('active');
            }, 3000);
        }
    }, [captureProof, isActive, status]);

    const calculateIrisPosition = (irisCenter: any, innerCorner: any, outerCorner: any, isRightEye: boolean) => {
        let ratio;
        if (isRightEye) {
            ratio = (irisCenter.x - innerCorner.x) / (outerCorner.x - innerCorner.x);
        } else {
            ratio = (irisCenter.x - outerCorner.x) / (innerCorner.x - outerCorner.x);
        }
        return Math.max(0, Math.min(1, ratio));
    }

    const onResults = useCallback(async (results: any) => {
        if (!isMountedRef.current || isClosingRef.current) return;
        const now = Date.now();
        const faces = results.multiFaceLandmarks;

        // --- 1. Face Presence ---
        if (!faces || faces.length === 0) {
            if (isMountedRef.current) setIrisMetrics(null);
            if (isActive) {
                if (noFaceStartTimeRef.current === 0) {
                    noFaceStartTimeRef.current = now;
                } else if (now - noFaceStartTimeRef.current > 2000) {
                    handleViolation("No face detected. Please stay in frame.", 'no-face');
                    noFaceStartTimeRef.current = 0;
                }
            }
            return;
        } else {
            noFaceStartTimeRef.current = 0;
        }

        // --- 2. Multiple Face Detection ---
        if (isActive && faces.length > 1) {
            if (multipleFaceStartTimeRef.current === 0) {
                multipleFaceStartTimeRef.current = now;
            } else if (now - multipleFaceStartTimeRef.current > 1000) {
                handleViolation("Multiple faces detected in frame.", 'multi-face');
                multipleFaceStartTimeRef.current = 0;
            }
        } else {
            multipleFaceStartTimeRef.current = 0;
        }

        const face = faces[0];
        const rRatio = calculateIrisPosition(face[468], face[133], face[33], true);
        const lRatio = calculateIrisPosition(face[473], face[362], face[263], false);
        const avgX = (rRatio + lRatio) / 2;
        const rY = (face[468].y - face[386].y) / (face[374].y - face[386].y);
        const lY = (face[473].y - face[159].y) / (face[145].y - face[159].y);
        const avgY = (rY + lY) / 2;

        // Calibration
        if (calibrationStartTimeRef.current === 0) {
            calibrationStartTimeRef.current = now;
        } else if (baselineMetricsRef.current === null) {
            if (now - calibrationStartTimeRef.current < 4000) {
                calibrationSamplesRef.current.push({ x: avgX, y: avgY });
            } else if (calibrationSamplesRef.current.length > 0) {
                const samples = calibrationSamplesRef.current;
                const medianX = samples.sort((a, b) => a.x - b.x)[Math.floor(samples.length / 2)].x;
                const medianY = samples.sort((a, b) => a.y - b.y)[Math.floor(samples.length / 2)].y;
                baselineMetricsRef.current = { x: medianX, y: medianY };
                setIsCalibrated(true);
                setDiagnostics(prev => [...prev, "Calibration Complete"]);
            }
        }

        // Smoothing
        if (isMountedRef.current) {
            const alpha = 0.3;
            let smoothedX = avgX, smoothedY = avgY;
            if (lastIrisMetricsRef.current) {
                smoothedX = alpha * avgX + (1 - alpha) * lastIrisMetricsRef.current.x;
                smoothedY = alpha * avgY + (1 - alpha) * lastIrisMetricsRef.current.y;
            }
            lastIrisMetricsRef.current = { x: smoothedX, y: smoothedY };
            setIrisMetrics({ x: smoothedX, y: smoothedY });
        }

        // Blinking (treated as focus violation if eyes closed too long)
        const getBlinkRatio = (points: any, p1: number, p2: number, p3: number, p4: number, p5: number, p6: number) => {
            const width = Math.hypot(points[p1].x - points[p4].x, points[p1].y - points[p4].y);
            const h1 = Math.hypot(points[p2].x - points[p6].x, points[p2].y - points[p6].y);
            const h2 = Math.hypot(points[p3].x - points[p5].x, points[p3].y - points[p5].y);
            return width / ((h1 + h2) / 2);
        };
        const blinkRatio = (getBlinkRatio(face, 362, 385, 386, 263, 374, 380) + getBlinkRatio(face, 33, 160, 158, 133, 153, 144)) / 2;
        if (isMountedRef.current) setRawMetrics({ x: lastIrisMetricsRef.current?.x || 0.5, y: lastIrisMetricsRef.current?.y || 0.5, blink: blinkRatio });

        if (blinkRatio > 3.2) {
            if (blinkStartTimeRef.current === 0) blinkStartTimeRef.current = now;
            else if (isActive && now - blinkStartTimeRef.current > 1500) {
                handleViolation("Eyes closed or looking down for too long.", 'focus');
                blinkStartTimeRef.current = 0;
            }
        } else blinkStartTimeRef.current = 0;

        // Gaze Deviation
        if (isActive && baselineMetricsRef.current && lastIrisMetricsRef.current) {
            const b = baselineMetricsRef.current, latest = lastIrisMetricsRef.current;
            if (Math.abs(latest.x - b.x) > 0.12 || Math.abs(latest.y - b.y) > 0.14) {
                if (lookAwayStartTimeRef.current === 0) lookAwayStartTimeRef.current = now;
                else if (now - lookAwayStartTimeRef.current > 1500) {
                    handleViolation("Looking away from the screen.", 'focus');
                    lookAwayStartTimeRef.current = 0;
                }
            } else lookAwayStartTimeRef.current = 0;

            const nose = face[1], leftC = face[234], rightC = face[454], chin = face[152], forehead = face[10];
            if (Math.abs(nose.x - (leftC.x + rightC.x) / 2) > (Math.abs(rightC.x - leftC.x) * 0.22) ||
                Math.abs(nose.y - (forehead.y + chin.y) / 2) > (Math.abs(chin.y - forehead.y) * 0.12)) {
                handleViolation("Head movement detected. Please face the screen.", 'head-pose');
            }

            // --- 3. Object Detection (Phone) ---
            if (objectDetectorRef.current && now - lastObjectCheckTimeRef.current > 500 && videoRef.current?.readyState === 4) {
                lastObjectCheckTimeRef.current = now;
                try {
                    const detections = await objectDetectorRef.current.detect(videoRef.current);
                    const currentLabels = detections.filter(p => p.score > 0.25).map(p => p.class.toLowerCase());
                    detectionHistoryRef.current = [currentLabels, ...detectionHistoryRef.current].slice(0, 5);
                    const dangerousClasses = ['cell phone', 'phone', 'mobile phone', 'remote', 'electronic device', 'laptop', 'book'];
                    const counts: Record<string, number> = {};
                    detectionHistoryRef.current.flat().forEach(label => counts[label] = (counts[label] || 0) + 1);

                    if (dangerousClasses.some(cls => (counts[cls] || 0) >= 3)) {
                        if (phoneStartTimeRef.current === 0) phoneStartTimeRef.current = now;
                        else if (now - phoneStartTimeRef.current > 600) {
                            handleViolation("Unallowed object or phone detected.", 'phone');
                            phoneStartTimeRef.current = 0;
                            detectionHistoryRef.current = [];
                        }
                    } else phoneStartTimeRef.current = 0;
                    if (isMountedRef.current) setDetectedObjects(detections.filter(p => p.score > 0.3).map(p => p.class));
                } catch (err) {
                    console.error("Object detection error:", err);
                }
            }
        }
    }, [handleViolation, isActive, status]);

    const onResultsRef = useRef(onResults);
    useEffect(() => { onResultsRef.current = onResults; }, [onResults]);

    useEffect(() => {
        isMountedRef.current = true;

        const init = async () => {
            // Check if models are already initialized globally (from prepare page)
            const existingModels = getGlobalModelInstance()
            const existingDetector = getGlobalObjectDetector()

            if (existingModels && videoRef.current) {
                // Reuse existing FaceMesh but create new Camera for this video element
                console.log("✅ Reusing existing FaceMesh model from prepare page")

                const { faceMesh } = existingModels
                objectDetectorRef.current = existingDetector

                try {
                    // Import Camera for new instance
                    const { Camera } = await import('@mediapipe/camera_utils');

                    // Ensure faceMesh is ready to receive frames
                    faceMesh.onResults((res: any) => {
                        if (isMountedRef.current) {
                            if (onResultsRef.current) onResultsRef.current(res);
                        }
                    });

                    // Create new Camera instance for this video element
                    const camera = new Camera(videoRef.current, {
                        onFrame: async () => {
                            if (videoRef.current && faceMesh && isMountedRef.current && !isClosingRef.current) {
                                try {
                                    await faceMesh.send({ image: videoRef.current });
                                } catch (err) {
                                    console.error("Error sending frame to faceMesh:", err)
                                }
                            }
                        },
                        width: 640,
                        height: 480
                    });

                    // Update global instance with new camera
                    const newModelInstance = { faceMesh, camera }
                    modelInstanceRef.current = newModelInstance
                    setGlobalModelInstance(newModelInstance)

                    await camera.start()
                    console.log("✅ Camera started for quiz page with reused FaceMesh")

                    // Set ready immediately since models are reused
                    setIsModelReady(true)
                    setDiagnostics(["Models ready (FaceMesh reused)", "Camera Active", "Face Detection Active", "Object Detection Ready"])

                    return
                } catch (err) {
                    console.error("Error reusing models:", err)
                    // Fall through to full initialization
                }
            }

            if (isInitializingRef.current || isGloballyInitializingModels()) return;
            console.log("🔄 Initializing proctoring models for the first time")
            isInitializingRef.current = true;
            setGloballyInitializing(true);

            try {
                // Load TensorFlow and MediaPipe imports in parallel for speed
                const [tfModule, { FaceMesh }, { Camera }] = await Promise.all([
                    tf.ready().then(() => {
                        setDiagnostics(prev => [...prev, "TensorFlow Ready"]);
                        return tf;
                    }),
                    import('@mediapipe/face_mesh'),
                    import('@mediapipe/camera_utils')
                ]);

                if (!videoRef.current || !isMountedRef.current) return;

                setDiagnostics(prev => [...prev, "Initializing Face Mesh..."]);

                const faceMesh = new FaceMesh({
                    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${file}`
                });

                faceMesh.setOptions({
                    maxNumFaces: 4,
                    refineLandmarks: true,
                    minDetectionConfidence: 0.5, // Reduced from 0.6 for faster detection
                    minTrackingConfidence: 0.5   // Reduced from 0.6 for faster detection
                });

                faceMesh.onResults((res: any) => {
                    if (isMountedRef.current) {
                        if (!isModelReady && res.multiFaceLandmarks && res.multiFaceLandmarks.length > 0) {
                            setIsModelReady(true);
                            setDiagnostics(prev => [...prev, "Face Detection Active"]);
                        }
                        if (onResultsRef.current) onResultsRef.current(res);
                    }
                });

                setDiagnostics(prev => [...prev, "Starting Camera..."]);
                const camera = new Camera(videoRef.current, {
                    onFrame: async () => {
                        if (videoRef.current && faceMesh && isMountedRef.current && !isClosingRef.current) {
                            try { await faceMesh.send({ image: videoRef.current }); } catch (err) { }
                        }
                    }, width: 640, height: 480
                });

                const modelsInstance = { faceMesh, camera };
                modelInstanceRef.current = modelsInstance;
                setGlobalModelInstance(modelsInstance);

                await camera.start();
                setDiagnostics(prev => [...prev, "Camera Online"]);

                // Load COCO-SSD in background (non-blocking, loads while user starts using the system)
                cocoSsd.load({ base: 'lite_mobilenet_v2' }).then(model => {
                    if (isMountedRef.current) {
                        objectDetectorRef.current = model;
                        setGlobalObjectDetector(model);
                        setDiagnostics(prev => [...prev, "Object Detection Ready"]);
                    }
                }).catch(err => {
                    console.warn("Object detector load failed:", err);
                });

            } catch (err) {
                console.error("Proctoring Init Error:", err);
                setDiagnostics(prev => [...prev, `Error: ${err instanceof Error ? err.message : String(err)}`]);
            } finally {
                isInitializingRef.current = false;
                setGloballyInitializing(false);
            }
        };

        // Initialize immediately without delay
        init();

        return () => {
            isMountedRef.current = false; isClosingRef.current = true;

            // DON'T cleanup global models on unmount - they persist across pages
            // Only set local refs to null
            modelInstanceRef.current = null;
            objectDetectorRef.current = null;
            setIsModelReady(false);

            isInitializingRef.current = false; isClosingRef.current = false;
        };
    }, [videoRef]);

    useEffect(() => {
        const handleBlur = () => isActive && handleViolation("Window focus lost.", 'tab-blur');
        window.addEventListener('blur', handleBlur);
        return () => window.removeEventListener('blur', handleBlur);
    }, [isActive, handleViolation]);

    return { warningCount, status, irisMetrics, rawMetrics, isModelReady, isCalibrated, diagnostics, detectedObjects, violationLogs, captureProof };
}

export default useProctoring;
