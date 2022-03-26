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

/**
 * Send a push notification to the given topic
 * @param {Array} experienceArray Array of objects with experience [{ uid: 'ddd', experience: 25  }, { uid: 'df', experience: 50 }]
 */
export async function distributeLeaderboardExperience(eventId, experienceArray) {
    const distributeExperience = functions.httpsCallable('distributeLeaderboardExperience');

    try {
        return await distributeExperience({ eventId, experienceArray });
    } catch (error) {
        console.log(error);
    }
}

/**
 * Call the twitchAuthentication cloud function to generate user and token of the new
 * qapla-twitch user
 * @param {string} uid User identifier
 * @param {string} displayName Username on twitch
 * @param {string} login Login string of twitch (regularly is the equal to the display name)
 * @param {string} photoUrl URL of twitch image
 * @param {string} email email of twitch
 */
export async function createUserWithTwitch(uid, displayName, login, photoUrl, email) {
    const authWithTwitch = functions.httpsCallable('twitchAuthentication');
    try {
        return await authWithTwitch({ uid, displayName, login, photoUrl, email });
    } catch (error) {
        console.log(error);
    }
}

/**
 * Call the onLeaderboardReset cloud function to notificate all users with points
 * on the leaderboard that it will be reseted
 * @param {array} usersToNotificate List of users to notificate
 */
export async function notificateUsersOnLeaderboardReset(usersToNotificate) {
    const onLeaderboardReset = functions.httpsCallable('onLeaderboardReset');

    try {
        return await onLeaderboardReset({ usersToNotificate });
    } catch (error) {
        console.log(error);
    }
}

export async function notificateToEventParticipantsAndStreamerFollowers(streamId, streamerId, titles, bodies) {
    const notificateToEventParticipantsAndStreamerFollowersFunction = functions.httpsCallable('notificateToEventParticipantsAndStreamerFollowers');
    try {
        return await notificateToEventParticipantsAndStreamerFollowersFunction({ streamId, streamerId, titles, bodies });
    } catch (error) {
        console.log(error);
    }
}