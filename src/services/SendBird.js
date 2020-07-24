import SendBird from 'sendbird';
import { SENDBIRD_KEY } from '../utilities/Constants';
import { updateEvent } from './database';

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
    sb.OpenChannel.createChannel(eventName, eventChatImage, null, onSuccess);
}

/**
 * Deletes an open event channel from sendbird
 * @param {string} eventId Event identifier on database
 * @param {string} channelUrl Url of the channel to delete
 */
export async function deleteEventChannel(eventId, channelUrl) {
    const deleteChatRequest = await fetch(
        `https://api-7e54a9f8-dce3-420e-8dc8-d3e8b081a2b0.sendbird.com/v3/open_channels/${channelUrl}`,
        {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json, charset=utf8',
                'Api-Token': '2b3c24f207bb75b9f77217ac3b12aa4d09e4f7e3'
            }
        }
    );

    const deleteChatResult = await deleteChatRequest.json();

    if (deleteChatResult.error) {
        alert('Error al eliminar chat del evento', deleteChatResult.message);
        return;
    }

    updateEvent(eventId, { eventChatUrl: null });
}