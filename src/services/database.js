import { database } from './firebase';

const eventsRef = database.ref('/eventosEspeciales').child('eventsData');
const eventsRequestsRef = database.ref('/eventosEspeciales').child('JoinRequests');
const gamesRef = database.ref('/GamesResources');
const eventsParticipantsRef = database.ref('/EventParticipants');
const PlatformsRef = database.ref('/PlatformsResources');
const usersRef = database.ref('/Users');
const dashboardUsersRef = database.ref('/DashboardUsers');
const dashboardUsersAdmin = dashboardUsersRef.child('Admins');
const dashboardUsersClient = dashboardUsersRef.child('Clients');
const transactionsRef = database.ref('/Transactions');
const eventTemplates = database.ref('/EventsTemplates');
const eventPrivateTemplates = eventTemplates.child('Private');
const eventPublicTemplates = eventTemplates.child('Public');

/**
 * Returns the events ordered by their dateUTC field
 * @param callback Handler for the returned events
 */
export async function loadEventsOrderByDate(callback) {
    return eventsRef.orderByChild('dateUTC').on('value', callback);
}

/**
 * Save an event on the database
 * @param {object} eventData Data of the event to create
 * @param {function} onFinished Callback called when the event is created
 */
export function createEvent(eventData, onFinished) {
    const eventKey = eventsRef.push().key;
    eventData.idLogro = eventKey;
    eventsRef.child(eventKey).update(eventData, (error) => onFinished(error, eventKey));
}

/**
 * Update an event with eventId
 * @param {string} eventId Event identifier
 * @param {object} eventData Data of the event to update
 * @param {function} onFinished Callback called when the event is updated
 */
export function updateEvent(eventId, eventData, onFinished) {
    eventsRef.child(eventId).update(eventData, onFinished);
}

/**
 * Delete an event from the database
 * @param {string} eventId Event identifier
 * @param {function} onFinished Callback called when the event is deleted
 */
export function deleteEvent(eventId, onFinished) {
    eventsRef.child(eventId).remove(onFinished);
}

/**
 * Load all the games ordered by platform from GamesResources
 * database node
 */
export async function loadQaplaGames() {
    return (await gamesRef.once('value')).val();
}

/**
 * Get the ranking of the given event
 * @param {string} eventId Event identifier
 * @returns {Array} Array of users object with fields
 * { uid, winRate, victories, matchesPlayed, userName, gamerTag } <- For user
 */
export async function getEventRanking(eventId) {
    /**
     * Get only participants with at least one match played
     */
    const rankedUsersObject = await eventsParticipantsRef.child(eventId).orderByChild('matchesPlayed').startAt(1).once('value');

    if (rankedUsersObject.val()) {
        /**
         * Sort the users based on their points and winRate
         */
        return Object.keys(rankedUsersObject.val()).map((uid) => {
            const rankedUser = rankedUsersObject.val()[uid];
            rankedUser.winRate = rankedUser.victories / rankedUser.matchesPlayed;
            rankedUser.uid = uid;

            return rankedUser;
        })

        /**
         * This sort can lead to bugs in the future, check the cloud function onEventStatusChange
         * for a reference
         */
        .sort((a, b) => (b.priceQaploins + b.winRate) - (a.priceQaploins + a.winRate));
    }

    return [];
}

/**
 * Get the ranking of the given event
 * @param {string} eventId Event identifier
 * @param {callback} loadParticipantList Handle the list of participants
 * @returns {Object} Object of users object with fields
 * { uid, winRate, victories, matchesPlayed, userName, gamerTag } <- For every user
 */
export async function getEventParticipants(eventId, loadParticipantList) {
    /**
     * Get only participants with at least one match played
     */
    eventsParticipantsRef.child(eventId).on('value', (d) => loadParticipantList(d.val()));
}

/**
 * Get the ranking of the given event
 * @param {string} eventId Event identifier
 * @param {callback} loadParticipantList Handle the list of participants
 * @returns {Object} Object of users object with fields
 * { uid, winRate, victories, matchesPlayed, userName, gamerTag } <- For every user
 */
export async function getEventParticipantsOnce(eventId) {
    /**
     * Get only participants with at least one match played
     */
    return (await eventsParticipantsRef.child(eventId).once('value')).val();
}

/**
 * Removes a participant from the given event
 * @param {string} uid User identifier
 * @param {string} eventId Event identifier
 */
export async function removeEventParticipant(uid, eventId) {
    eventsParticipantsRef.child(eventId).child(uid).remove();
}

/**
 * Load all the platforms from PlatformsResources
 * database node
 */
export async function loadQaplaPlatforms() {
    return (await PlatformsRef.once('value')).val();
}

/**
 * Close the given event, must be an event of matches, this action
 * trigger the distribuite qoins cloud function
 * @param {string} eventId Event identifier on database
 */
export function closeEvent(eventId) {
    eventsRef.child(eventId).update({ active: false });
}

/**
 * Add any amount of Qoins to multiple users in one transaction
 *
 * @param {array} transactionArray Array of objects with the following structure [ {uid, qoins, ...}, {uid, qoins, ...} ]
 * @example distributeQoinsToMultipleUsers([ {uid: 'dkd', qoins: 50, userName: 'd'}, {uid: 'nufidb', qoins: 100, userName: 'g'} ])
 */
export async function distributeQoinsToMultipleUsers(transactionArray) {
    try {
        let updateUsers = {};

        for (let i = 0; i < transactionArray.length; i++) {
            const userQoins = await getUserQoins(transactionArray[i].uid);
            updateUsers[`/${transactionArray[i].uid}/credits`] = userQoins.val() + transactionArray[i].qoins;
            recordQaploinTransaction(transactionArray[i].uid, transactionArray[i].qoins, 'Event Prize');
        }

        usersRef.update(updateUsers);
    }
    catch(error) {
        console.error('[Add Different Quantity Of Qoins To Multiple Users]', error);
    }
}

/**
 * Upload the results of an event to the EventParticipants node and close the event after
 * so the qoins are distributed by a cloud function
 * @param {Array} placesArray Array with the participants data (uid and place at least)
 */
export async function uploadEventResults(eventId, placesArray) {
    let updateEventPoints = {};
    placesArray.sort((a, b) => parseInt(a.place) - parseInt(b.place))
    .forEach((participant, index) => {
        updateEventPoints[`/${participant.uid}/matchesPlayed`] = placesArray.length;
        updateEventPoints[`/${participant.uid}/victories`] = placesArray.length - index;
        updateEventPoints[`/${participant.uid}/priceQaploins`] = ((placesArray.length - index) * 3) + index;
    });
    await eventsParticipantsRef.child(eventId).update(updateEventPoints);

    closeEvent(eventId);
}

/**
 * Return the current amount of qaploins of specific user
 * @param {string} uid User identifier of firebase node
 * @returns {object} Qoins of the given user
 */
async function getUserQoins(uid) {
    try {
        return await usersRef.child(uid).child('credits').once('value');
    } catch(error) {
        console.error('[Get User Qaploins]', error);
    }
}

/**
 * Get the language of the user device
 * @param {string} uid User identifier
 */
export async function getUserLanguage(uid) {
    return (await usersRef.child(uid).child('language').once('value')).val();
}

/**
 * Create a transaction record of a database (qoins) operation
 * @param {string} uid Unique id of the user
 * @param {number} quantity Number of qaploins
 * @param {string} concept concept of the transaction
 */
async function recordQaploinTransaction(uid, quantity, concept) {
    var today = new Date();

    // Fill date information
    var dd = String(today.getUTCDate()).padStart(2, '0');
    var mm = String(today.getUTCMonth() + 1).padStart(2, '0');
    var yyyy = today.getUTCFullYear();
    var hour = today.getUTCHours();
    var minutes = today.getUTCMinutes();
    // Build today date with previous filled information
    today = mm + '/' + dd + '/' + yyyy + ' ' + hour + ':' + minutes;
    const transaction = {
        date: today,
        concept,
        quantity,
        isServer: true
    };

    try {
        transactionsRef.child(uid).push(transaction);
    } catch (error) {
        console.error('[Record Qaploin Transaction]', error);
    }
}

/**
 * Put a listener to get all the join requests from the given event
 * @param {string} eventId Event identifier
 * @param {function} callback Callback to handle the requests returned from database
 */
export function getEventJoinRequests(eventId, callback) {
    eventsRequestsRef.child(eventId).on('value', callback);
}

/**
 * Remove a listener fom the the join requests of the given event
 * @param {string} eventId Event identifier
 */
export function removeEventJoinRequestsListener(eventId) {
    eventsRequestsRef.child(eventId).off('value');
}

/**
 * Approve an event join request of an specific user, save the data
 * on EventParticipants and remove it from JoinRequests node of eventosEspeciales
 * @param {string} uid User identifier
 * @param {string} eventId Event identifier
 * @param {object} userData Data of the user for the event (it structure depends
 * by the event)
 */
export async function approveEventJoinRequest(uid, eventId, userData) {
    /**
     * Necessary fields due the EventParticipants structure expected
     * by the cloud function
     */
    userData.priceQaploins = 0;
    userData.matchesPlayed = 0;
    userData.victories = 0;

    await eventsParticipantsRef.child(eventId).child(uid).update(userData);
    await eventsRequestsRef.child(eventId).child(uid).remove();
}

/**
 * Remove a join requesto from the JoinRequests node of eventosEspeciales
 * @param {string} uid User identifier
 * @param {string} eventId Event identifier
 */
export async function rejectEventJoinRequest(uid, eventId) {
    await eventsRequestsRef.child(eventId).child(uid).remove();
}

/**
 * Add the specific amount of Qoins to the given user
 * @param {string} uid user identifier
 * @param {number} qoinsToAdd Qoins to add
 */
export function addQoinsToUser(uid, qoinsToAdd) {
    try {
        usersRef.child(uid).child('credits').transaction((credits) => {
            if (typeof credits === 'number') {
                return credits + qoinsToAdd;
            }

            return credits;
        }, (error) => {
            console.log(error);
        });
    } catch (error) {
        console.error(error);
    }
}

/**
 * Dashboard Users
 */

/**
 * Checks if the given user is a valid user for this platform
 * @param {string} uid User identifier
 */
 export async function isDashboardUser(uid) {
    return (await dashboardUsersAdmin.child(uid).once('value')).exists() || (await dashboardUsersClient.child(uid).once('value')).exists();
 }

/**
 * Listen for the admin profile and their changes
 * @param {string} uid Creator identifier
 * @param {callback} dataHandler Handler for the loaded data
 */
export function loadUserAdminProfile(uid, dataHandler) {
    dashboardUsersAdmin.child(uid).on('value', (adminData) => {
        if (adminData.exists()) {
            dataHandler(adminData.val());
        } else {
            removeUserAdminListener(uid);
        }
    });
}

/**
 * Remove the listener from the user admin profile
 * @param {string} uid User identifier
 */
export function removeUserAdminListener(uid) {
    dashboardUsersAdmin.child(uid).off('value');
}

/**
 * Listen for the client profile and their changes
 * @param {string} uid Creator identifier
 * @param {callback} dataHandler Handler for the loaded data
 */
export function loadUserClientProfile(uid, dataHandler) {
    dashboardUsersClient.child(uid).on('value', (clientData) => {
        if (clientData.exists()) {
            dataHandler(clientData.val());
        } else {
            removeUserClientListener(uid);
        }
    });
}

/**
 * Remove the listener from the user client profile
 * @param {string} uid User identifier
 */
export function removeUserClientListener(uid) {
    dashboardUsersAdmin.child(uid).off('value');
}

/**
 * Templates
 */

/**
 * Saves an event template on the database
 * @param {string} uid User identfier
 * @param {object} eventData Template data to save
 * @param {boolean} privateTemplate True if template is private
 * @param {callback} onComplete Function called after save event template on database
 */
export function saveEventTemplate(uid, eventData, privateTemplate, onComplete) {
    eventData.author = uid;
    if (privateTemplate) {
        eventPrivateTemplates.child(uid).push(eventData, onComplete);
    } else {
        eventPublicTemplates.push(eventData, onComplete);
    }
}

/**
 * Loads all the public event templates
 */
export async function loadPublicEventTemplates() {
    return (await eventPublicTemplates.once('value')).val();
}

/**
 * Loads all the private event templates of the given user
 * @param {string} uid User identfier
 */
export async function loadPrivateTemplates(uid) {
    return (await eventPrivateTemplates.child(uid).once('value')).val();
}