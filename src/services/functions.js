import { functions } from './firebase';

/**
 * Send a push notification to the given user
 * @param {string} uid User identifier
 * @param {string} token Firebase cloud messaging device token
 * @param {string} title Title of the push notification
 * @param {string} body Body of the push notification
 * @param {object} extraData Data to send with the notification
 * @param {boolean} onlyData True if the message is an only data message, false for push notification
 */
export async function notificateUser(uid, token, title, body, extraData = {}, onlyData = false) {
    const notificateUser = functions.httpsCallable('notificateUser');

    return await notificateUser({ uid, token, title, body, extraData, onlyData });
}