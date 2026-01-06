import { supabase } from "../supabaseClient";

/**
 * Uploads a proctoring proof image (Blob or Base64) to Supabase Storage.
 * @param file The file or data URL to upload.
 * @param testId The ID of the test session.
 * @param type The type of violation.
 * @returns The public URL of the uploaded image.
 */
export async function uploadProctoringProof(
    file: Blob | string,
    testId: string,
    type: string
): Promise<string> {
    try {
        let blob: Blob;

        if (typeof file === 'string') {
            // Convert base64 to blob
            const res = await fetch(file);
            blob = await res.blob();
        } else {
            blob = file;
        }

        const fileName = `${testId}/${type}_${Date.now()}.jpg`;
        const filePath = `violation_proofs/${fileName}`;

        const { data, error } = await supabase.storage
            .from('proctoring-proofs')
            .upload(filePath, blob, {
                contentType: 'image/jpeg',
                upsert: true
            });

        if (error) {
            console.error("Storage Upload Error:", error);
            throw error;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('proctoring-proofs')
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error("uploadProctoringProof Failed:", error);
        throw error;
    }
}
