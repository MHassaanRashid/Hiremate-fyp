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
    if (globalModelInstance) {
        const { camera, faceMesh } = globalModelInstance
        try {
            // Aggressively stop all tracks if possible
            if (camera && camera.video) {
                const stream = camera.video.srcObject as MediaStream;
                if (stream && stream.getTracks) {
                    stream.getTracks().forEach(track => track.stop());
                }
            }
            if (camera && typeof camera.stop === 'function') camera.stop()
            if (faceMesh && typeof faceMesh.close === 'function') faceMesh.close()
        } catch (e) {
            console.error("Cleanup error:", e)
        }
        globalModelInstance = null
    }
    globalObjectDetector = null
    isGloballyInitializing = false
    baselineGazeMetrics = null
}
