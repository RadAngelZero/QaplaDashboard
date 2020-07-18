import SendBird from 'sendbird';
import { SENDBIRD_KEY } from '../utilities/Constants';

let sb = new SendBird({ appId: SENDBIRD_KEY });

/**
 * Initialize the connection between user and SendBird
 * @param {string} uid User identifier
 */
export function connectUserToSendBird(uid) {
    sb.connect(uid, function(user, error) {
        if (error) {
            console.error(error);
            return;
        }
    });
}

/**
 * Create a channel for the event
 * @param {string} eventName Name of the event
 * @param {string} eventChatImage URL of the event chat image
 * @param {callback} onSuccess Function called after channel chat created
 */
export function createEventChannel(eventName, eventChatImage, onSuccess) {
    sb.OpenChannel.createChannel(eventName, eventChatImage, null,  onSuccess);
}