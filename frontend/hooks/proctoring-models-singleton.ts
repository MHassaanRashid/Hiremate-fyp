// Global singleton to persist proctoring models across component mounts
// This prevents re-initialization when navigating between prepare and quiz pages

let globalModelInstance: { faceMesh: any, camera: any } | null = null
let globalObjectDetector: any | null = null
let isGloballyInitializing = false
let baselineGazeMetrics: { x: number, y: number } | null = null

export function getGlobalModelInstance() {
    return globalModelInstance
}

export function setGlobalModelInstance(instance: { faceMesh: any, camera: any } | null) {
    globalModelInstance = instance
}

export function getGlobalObjectDetector() {
    return globalObjectDetector
}

export function setGlobalObjectDetector(detector: any) {
    globalObjectDetector = detector
}

export function isGloballyInitializingModels() {
    return isGloballyInitializing
}

export function setGloballyInitializing(value: boolean) {
    isGloballyInitializing = value
}

export function getBaselineGazeMetrics() {
    return baselineGazeMetrics
}

export function setBaselineGazeMetrics(metrics: { x: number, y: number } | null) {
    baselineGazeMetrics = metrics
}

export function cleanupGlobalModels() {
    console.log("Proctoring: Global cleanup initiated...");
    if (globalModelInstance) {
        const { camera, faceMesh } = globalModelInstance
        try {
            if (camera && typeof camera.stop === 'function') {
                camera.stop()
            }
            if (faceMesh && typeof faceMesh.close === 'function') {
                faceMesh.close()
            }
        } catch (e) {
            console.error("Cleanup error in models:", e)
        }
        globalModelInstance = null
    }

    // Aggressive: Stop ALL media tracks in the entire window as a safety measure
    try {
        if (typeof window !== 'undefined' && navigator.mediaDevices) {
            navigator.mediaDevices.enumerateDevices().then(() => {
                // This is a bit hacky but covers all bases if tracks aren't linked to camera object
                const stopAllTracks = (stream: MediaStream) => {
                    stream.getTracks().forEach(track => {
                        track.stop();
                        console.log(`Proctoring: Stopped track: ${track.label}`);
                    });
                };

                // Try to find any active streams
                // We can't easily listed all streams, but we can try to get them if they were attached to video elements
                document.querySelectorAll('video').forEach(video => {
                    const stream = video.srcObject as MediaStream;
                    if (stream && typeof stream.getTracks === 'function') {
                        stopAllTracks(stream);
                        video.srcObject = null;
                    }
                });
            });
        }
    } catch (e) {
        console.error("Proctoring: Aggressive cleanup failed:", e);
    }

    globalObjectDetector = null
    isGloballyInitializing = false
    baselineGazeMetrics = null
}
