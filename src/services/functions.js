import { functions } from './firebase';

/**
 * Send a push notification to the given user
 * @param {string} uid User identifier
 * @param {string} token Firebase cloud messaging device token
 * @param {string} title Title of the push notification
 * @param {string} body Body of the push notification
 * @param {object} payload Extra data useful for the cloud function
 * @param {object} extraData Data to send with the notification
 * @param {boolean} onlyData True if the message is an only data message, false for push notification
 */
export async function notificateUser(uid, token, title, body, payload = {}, extraData = {}, onlyData = false) {
    const notificate = functions.httpsCallable('notificateUser');

    try {
        return await notificate({ uid, token, title, body, payload, extraData, onlyData });
    } catch (error) {
        console.log(error);
    }
}

/**
 * Send a push notification to the given topic
 * @param {string} topic Topic identifier
 * @param {object} titles Titles of the push notification (in different languages)
 * @param {object} bodys Bodys of the push notification (in different languages)
 * @param {object} extraData Data to send with the notification
 * @param {boolean} onlyData True if the message is an only data message, false for push notification
 */
export async function notificateToTopic(topic, titles, bodys, extraData = {}, onlyData = false) {
    const notificateToTopic = functions.httpsCallable('notificateToTopic');

    try {
        return await notificateToTopic({ topic, titles, bodys, extraData, onlyData });
    } catch (error) {
        console.log(error);
    }
}