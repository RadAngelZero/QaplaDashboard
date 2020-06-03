import { database } from './firebase';

const eventsRef = database.ref('/eventosEspeciales').child('eventsData');
const eventsRequestsRef = database.ref('/eventosEspeciales').child('JoinRequests');
const gamesRef = database.ref('/GamesResources');
const eventsParticipantsRef = database.ref('/EventParticipants');
const PlatformsRef = database.ref('/PlatformsResources');
const usersRef = database.ref('/Users');
const transactionsRef = database.ref('/Transactions');

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
 * @returns {Object} Object of users object with fields
 * { uid, winRate, victories, matchesPlayed, userName, gamerTag } <- For every user
 */
export async function getEventParticipants(eventId) {
    /**
     * Get only participants with at least one match played
     */
    return (await eventsParticipantsRef.child(eventId).once('value')).val();
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
            if (credits) {
                return credits + qoinsToAdd;
            }

            return credits;
        }, (error, b, c) => {
            console.log(error, b, c.val());
        });
    } catch (error) {
        console.error(error);
    }
}