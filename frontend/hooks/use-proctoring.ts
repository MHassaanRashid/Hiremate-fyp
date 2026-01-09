import { useEffect, useRef, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import {
    getGlobalModelInstance,
    setGlobalModelInstance,
    getGlobalObjectDetector,
    setGlobalObjectDetector,
    isGloballyInitializingModels,
    setGloballyInitializing,
    getBaselineGazeMetrics,
    setBaselineGazeMetrics,
    cleanupGlobalModels
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

    // Internal refs for detection state
    const isActiveRef = useRef(isActive);
    const warningCountRef = useRef(0);
    const lastWarningTimeRef = useRef<number>(0);
    const noFaceStartTimeRef = useRef<number>(0);
    const lookAwayStartTimeRef = useRef<number>(0);
    const phoneStartTimeRef = useRef<number>(0);
    const multipleFaceStartTimeRef = useRef<number>(0);
    const logsRef = useRef<{ type: ViolationType, time: string, reason: string }[]>([]);
    const lastAlivePingRef = useRef<number>(0);
    const isMountedRef = useRef(true);
    const isClosingRef = useRef(false);
    const detectionHistoryRef = useRef<string[][]>([]);
    const potentialProofsRef = useRef<Record<string, string>>({});

    // baseline ...
    const baselineMetricsRef = useRef<{ x: number, y: number } | null>(getBaselineGazeMetrics());
    const calibrationStartTimeRef = useRef<number>(0);
    const calibrationSamplesRef = useRef<{ x: number, y: number }[]>([]);

    // Model refs
    const objectDetectorRef = useRef<cocoSsd.ObjectDetection | null>(null);
    const lastObjectCheckTimeRef = useRef<number>(0);
    const lastIrisMetricsRef = useRef<{ x: number, y: number } | null>(null);
    const isInitializingRef = useRef(false);
    const activeCameraRef = useRef<any>(null);

    // Sync isActive to Ref to avoid closure issues
    useEffect(() => {
        isActiveRef.current = isActive;
        console.log(`Proctoring: Monitoring ${isActive ? 'ACTIVATED' : 'STBY'}`);
    }, [isActive]);

    // Sync state for UI based on recovered singleton baseline
    useEffect(() => {
        if (baselineMetricsRef.current) {
            setIsCalibrated(true);
            setDiagnostics(prev => [...prev.filter(d => !d.includes("Calibration")), "Calibration Complete"]);
        }
    }, []);

    const captureProof = useCallback(() => {
        if (!videoRef.current) return '';
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
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

    const handleViolation = useCallback((reason: string, type: ViolationType, manualProof?: string) => {
        const now = Date.now();
        if (!isActiveRef.current) {
            console.log(`Proctoring: Suppression -> ${type}: ${reason}`);
            return;
        }
        if (now - lastWarningTimeRef.current < 4000) return;

        console.log(`Proctoring: !!! VIOLATION !!! [${type}] ${reason}`);

        lastWarningTimeRef.current = now;
        warningCountRef.current += 1;

        const proof = manualProof || potentialProofsRef.current[type] || captureProof();
        // Clear the buffer
        delete potentialProofsRef.current[type];

        const logEntry = { type, time: new Date().toISOString(), reason, proof };
        logsRef.current.push(logEntry);

        if (isMountedRef.current) {
            setWarningCount(warningCountRef.current);
            setStatus('warning');
            setViolationLogs([...logsRef.current]);
            if (onWarningRef.current) onWarningRef.current(warningCountRef.current, reason, type);
        }

        setTimeout(() => {
            if (isMountedRef.current && status !== 'terminated') setStatus('active');
        }, 3000);
    }, [status]);

    const calculateIrisPosition = useCallback((irisCenter: any, innerCorner: any, outerCorner: any, isRightEye: boolean) => {
        let ratio;
        if (isRightEye) {
            ratio = (irisCenter.x - innerCorner.x) / (outerCorner.x - innerCorner.x);
        } else {
            ratio = (irisCenter.x - outerCorner.x) / (innerCorner.x - outerCorner.x);
        }
        return Math.max(0, Math.min(1, ratio));
    }, []);

    const onResults = useCallback(async (results: any) => {
        if (!isMountedRef.current || isClosingRef.current) return;
        const now = Date.now();

        // Loop proof
        if (now - lastAlivePingRef.current > 5000) {
            console.log(`Proctoring: Heartbeat (F:${results.multiFaceLandmarks?.length || 0} A:${isActiveRef.current} C:${!!baselineMetricsRef.current})`);
            lastAlivePingRef.current = now;
        }

        const faces = results.multiFaceLandmarks;

        // --- 1. Face Presence ---
        if (!faces || faces.length === 0) {
            if (isMountedRef.current) setIrisMetrics(null);
            if (isActiveRef.current) {
                if (noFaceStartTimeRef.current === 0) {
                    noFaceStartTimeRef.current = now;
                    potentialProofsRef.current['no-face'] = captureProof();
                } else if (now - noFaceStartTimeRef.current > 2000) {
                    handleViolation("No face detected.", 'no-face');
                    noFaceStartTimeRef.current = 0;
                }
            }
        } else {
            noFaceStartTimeRef.current = 0;

            if (isActiveRef.current && faces.length > 1) {
                if (multipleFaceStartTimeRef.current === 0) {
                    multipleFaceStartTimeRef.current = now;
                    potentialProofsRef.current['multi-face'] = captureProof();
                } else if (now - multipleFaceStartTimeRef.current > 1000) {
                    handleViolation("Multiple faces detected.", 'multi-face');
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

            if (isMountedRef.current) {
                setIrisMetrics({ x: avgX, y: avgY });
            }

            // Calibration (Persistent via singleton)
            if (!baselineMetricsRef.current) {
                if (calibrationStartTimeRef.current === 0) {
                    calibrationStartTimeRef.current = now;
                    setDiagnostics(prev => [...prev.filter(d => !d.includes("Calibration")), "Calibration Started"]);
                    console.log("Proctoring: Calibration starting...");
                } else if (now - calibrationStartTimeRef.current < 4000) {
                    calibrationSamplesRef.current.push({ x: avgX, y: avgY });
                } else {
                    if (calibrationSamplesRef.current.length > 5) {
                        const samplesX = calibrationSamplesRef.current.map(s => s.x).sort((a, b) => a - b);
                        const samplesY = calibrationSamplesRef.current.map(s => s.y).sort((a, b) => a - b);
                        const baseline = {
                            x: samplesX[Math.floor(samplesX.length / 2)],
                            y: samplesY[Math.floor(samplesY.length / 2)]
                        };
                        baselineMetricsRef.current = baseline;
                        setBaselineGazeMetrics(baseline); // Store in singleton
                        setIsCalibrated(true);
                        setDiagnostics(prev => [...prev.filter(d => !d.includes("Calibration")), "Calibration Complete"]);
                        console.log("Proctoring: Calibration Result:", baseline);
                    } else {
                        console.log("Proctoring: Calibration reset (too few samples)");
                        calibrationStartTimeRef.current = now;
                        calibrationSamplesRef.current = [];
                    }
                }
            }

            // Gaze sensitivity check
            if (isActiveRef.current && baselineMetricsRef.current) {
                const b = baselineMetricsRef.current;
                const devX = Math.abs(avgX - b.x);
                const devY = Math.abs(avgY - b.y);

                if (devX > 0.10 || devY > 0.12) {
                    console.log(`Proctoring: Gaze Deviation X:${devX.toFixed(3)} Y:${devY.toFixed(3)} (Threshold X:0.10 Y:0.12)`);
                    if (lookAwayStartTimeRef.current === 0) {
                        lookAwayStartTimeRef.current = now;
                        potentialProofsRef.current['focus'] = captureProof();
                    }
                    else if (now - lookAwayStartTimeRef.current > 1200) {
                        handleViolation("Looking away from screen.", 'focus');
                        lookAwayStartTimeRef.current = 0;
                    }
                } else {
                    lookAwayStartTimeRef.current = 0;
                }

                // Head Pose
                const nose = face[1], lCrit = face[234], rCrit = face[454], chin = face[152], fore = face[10];
                const headX = Math.abs(nose.x - (lCrit.x + rCrit.x) / 2) / (rCrit.x - lCrit.x);
                const headY = Math.abs(nose.y - (fore.y + chin.y) / 2) / (chin.y - fore.y);
                if (headX > 0.22 || headY > 0.13) {
                    console.log(`Proctoring: Head Move X:${headX.toFixed(3)} Y:${headY.toFixed(3)} (Threshold X:0.22 Y:0.13)`);
                    handleViolation("Head movement detected.", 'head-pose');
                }
            }
        }

        // --- Object Detection ---
        if (isActiveRef.current && objectDetectorRef.current && now - lastObjectCheckTimeRef.current > 400 && videoRef.current?.readyState === 4) {
            lastObjectCheckTimeRef.current = now;
            try {
                const detections = await objectDetectorRef.current.detect(videoRef.current);
                const currentLabels = detections.filter(p => p.score > 0.28).map(p => p.class.toLowerCase());

                if (currentLabels.length > 0) {
                    console.log("Proctoring: Seeing objects:", currentLabels);
                }

                detectionHistoryRef.current = [currentLabels, ...detectionHistoryRef.current].slice(0, 4);
                const cheatClasses = ['cell phone', 'phone', 'mobile phone', 'remote', 'laptop', 'book', 'paper'];

                let detectedCheat = false;
                for (const cls of cheatClasses) {
                    const count = detectionHistoryRef.current.flat().filter(l => l === cls).length;
                    if (count >= 2) {
                        detectedCheat = true;
                        break;
                    }
                }

                if (detectedCheat) {
                    if (phoneStartTimeRef.current === 0) {
                        phoneStartTimeRef.current = now;
                        potentialProofsRef.current['phone'] = captureProof();
                    }
                    else if (now - phoneStartTimeRef.current > 200) {
                        handleViolation("Unallowed object detected.", 'phone');
                        phoneStartTimeRef.current = 0;
                        detectionHistoryRef.current = [];
                    }
                } else {
                    phoneStartTimeRef.current = 0;
                }

                if (isMountedRef.current) {
                    setDetectedObjects(detections.filter(p => p.score > 0.3).map(p => p.class));
                }
            } catch (err) {
                console.error("Proctoring: Object detect error:", err);
            }
        }
    }, [handleViolation, calculateIrisPosition, status]);

    const onResultsRef = useRef(onResults);
    useEffect(() => { onResultsRef.current = onResults; }, [onResults]);

    useEffect(() => {
        isMountedRef.current = true;
        isClosingRef.current = false;

        const connect = async () => {
            if (!videoRef.current) {
                console.log("Proctoring: Waiting for camera feed mount...");
                if (isMountedRef.current) setTimeout(connect, 300);
                return;
            }

            console.log("Proctoring: Starting AI Engine...");
            setDiagnostics(prev => [...prev, "Syncing AI..."]);

            // RECOVER OR LOAD
            let faceMesh = getGlobalModelInstance()?.faceMesh;
            let detector = getGlobalObjectDetector();

            if (!faceMesh || !detector) {
                if (isGloballyInitializingModels()) return;
                setGloballyInitializing(true);
                try {
                    await tf.ready();
                    if (tf.getBackend() !== 'webgl' && tf.findBackend('webgl')) await tf.setBackend('webgl');

                    const [{ FaceMesh }, cocoModel] = await Promise.all([
                        import('@mediapipe/face_mesh'),
                        cocoSsd.load({ base: 'lite_mobilenet_v2' })
                    ]);

                    faceMesh = new FaceMesh({ locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${f}` });
                    faceMesh.setOptions({ maxNumFaces: 2, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
                    detector = cocoModel;
                    setGlobalObjectDetector(detector);
                    setDiagnostics(prev => [...prev, "AI Loaded"]);
                } catch (e) {
                    console.error("Proctoring Error:", e);
                } finally {
                    setGloballyInitializing(false);
                }
            }

            if (!faceMesh || !isMountedRef.current) return;
            objectDetectorRef.current = detector;

            // Link results to loop
            faceMesh.onResults((res: any) => {
                if (isMountedRef.current && onResultsRef.current) onResultsRef.current(res);
            });

            // START CAMERA
            try {
                const { Camera } = await import('@mediapipe/camera_utils');
                const camera = new Camera(videoRef.current, {
                    onFrame: async () => {
                        if (videoRef.current && faceMesh && isMountedRef.current && !isClosingRef.current) {
                            try { await faceMesh.send({ image: videoRef.current }); } catch (err) { }
                        }
                    },
                    width: 640, height: 480
                });

                activeCameraRef.current = camera;
                setGlobalModelInstance({ faceMesh, camera });

                await camera.start();
                console.log("Proctoring: Camera Link Established ✅");
                setIsModelReady(true);
                setDiagnostics(["Monitoring Active", "Object AI Bound", "Camera Protected"]);
            } catch (err) {
                console.error("Proctoring Error:", err);
            }
        };

        connect();

        return () => {
            isMountedRef.current = false;
            isClosingRef.current = true;
            console.log("Proctoring: Unmounting - Triggering final cleanup");
            cleanupGlobalModels();
        };
    }, []);

    useEffect(() => {
        const handleBlur = () => {
            if (isActiveRef.current) {
                potentialProofsRef.current['tab-blur'] = captureProof();
                handleViolation("Window focus lost.", 'tab-blur');
            }
        };
        window.addEventListener('blur', handleBlur);
        return () => window.removeEventListener('blur', handleBlur);
    }, [handleViolation]);

    return { warningCount, status, irisMetrics, rawMetrics, isModelReady, isCalibrated, diagnostics, detectedObjects, violationLogs, captureProof };
}

export default useProctoring;
