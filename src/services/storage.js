import { storage } from './firebase';

/**
 * Upload an image to firebase storage
 * @param {file} image Image to save
 * @param {string} ref Folder path to save the image
 * @param {function} updateUploadStatus Function called every time the state of the upload changes
 * @param {function} onError Function called if there is an error during the upload
 * @param {function} onFinished Function called when the process is over (and succesful)
 */
export function uploadImage(image, ref, updateUploadStatus, onError, onFinished) {
    const uploadTask = storage.ref(ref).child(image.name).put(image);

    uploadTask.on('state_changed', (snapshot) => {
        updateUploadStatus(snapshot.bytesTransferred / snapshot.totalBytes);
    }, (error) => {
        onError(error);
    }, async () => {
        const url = await storage.ref(ref).child(image.name).getDownloadURL();

        onFinished(url);
    });
}

export async function deleteImage(memeId) {
    return await storage.ref('Memes').child(memeId).delete();
}