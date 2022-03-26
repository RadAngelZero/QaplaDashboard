import staticLeaderboard from './../assets/Leaderboard.json';
import { database } from './firebase';
import { deleteEventChannel } from './SendBird';
import { distributeLeaderboardExperience, notificateUsersOnLeaderboardReset } from './functions';
import { QLANES, QOINS, XQ } from '../utilities/Constants';

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
const userDonationsRef = database.ref('/UserDonations');
const donationsHistoryRef = database.ref('/DonationsHistory');
const usersRewardsProgressRef = database.ref('/UsersRewardsProgress');
const DonationsCostsRef = database.ref('/DonationsCosts');
const DonationsLeaderBoardRef = database.ref('/DonationsLeaderBoard');
const InvitationCodeRef = database.ref('/InvitationCode');
const userStreamersRef = database.ref('/UserStreamer');
const streamsApprovalRef = database.ref('/StreamsApproval');
const streamersEventsDataRef = database.ref('/StreamersEventsData');
const leaderBoardPrizesRef = database.ref('/LeaderBoardPrizes');
const leaderboardWinnersRef = database.ref('/LeaderboardWinners');
const qaplaStreamersRef = database.ref('/QaplaStreamers');
const activeCustomRewardsRef = database.ref('/ActiveCustomRewards');
const qaplaLevelsRequirementsRef = database.ref('QaplaLevelsRequirements');
const streamersDonationsRef = database.ref('StreamersDonations');
const userStreamsRewardsRef = database.ref('/UserStreamsRewards');
const eventsDataAdminRef = database.ref('/EventsDataAdmin');

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
export async function deleteEvent(eventId, onFinished) {
    await eventsRef.child(eventId).remove(onFinished);
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
 * @param {string} eventChannelUrl Chat channel of the event
 */
export function closeEvent(eventId, eventChannelUrl) {
    eventsRef.child(eventId).update({ active: false }, (error) => {
        if (error) {
            alert(error.message);
            return;
        }

        deleteEventChannel(eventId, eventChannelUrl);
    });
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
 * @param {string} eventId Event identifier on database
 * @param {Array} placesArray Array with the participants data (uid and place at least)
 * @param {string} eventChannelUrl Chat channel of the event
 */
export async function uploadEventResults(eventId, placesArray, eventChannelUrl) {
    let updateEventPoints = {};
    placesArray.forEach((participant, index) => {
        if (participant.place) {
            updateEventPoints[`/${participant.uid}/matchesPlayed`] = placesArray.length;
            updateEventPoints[`/${participant.uid}/victories`] = placesArray.length - index;
            updateEventPoints[`/${participant.uid}/priceQaploins`] = ((placesArray.length - index) * 3) + index;
        }
    });
    await eventsParticipantsRef.child(eventId).update(updateEventPoints);

    closeEvent(eventId, eventChannelUrl);
}

export async function getUserUserName(uid) {
    return await usersRef.child(uid).child('userName').once('value');
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

export async function getUserToken(uid) {
    return await usersRef.child(uid).child('token').once('value');
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
    const adminUser = (await dashboardUsersAdmin.child(uid).once('value')).exists();
    const streamerUser = (await userStreamersRef.child(uid).once('value')).exists();

    return adminUser || streamerUser;
 }

/**
 * Listen for the admin profile and their changes
 * @param {string} uid Creator identifier
 * @param {callback} dataHandler Handler for the loaded data
 */
export async function loadUserAdminProfile(uid, dataHandler) {
    dashboardUsersAdmin.child(uid).on('value', (adminData) => {
        if (adminData.exists()) {
            dataHandler(adminData.val());
        } else {
            removeUserAdminListener(uid);
        }
    });
}

export function loadStreamerProfile(uid, dataHandler) {
    userStreamersRef.child(uid).on('value', (streamerData) => {
        if (streamerData.exists()) {
            dataHandler(streamerData.val());
        } else {
            removeUserAdminListener(uid);
        }
    });
}

/**
 * Gets all the profile from the given streamer
 * @param {string} streamerUid Uid of the streamer
 */
export async function getStreamerProfile(streamerUid) {
    return await userStreamersRef.child(streamerUid).once('value');
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
            console.log('Client');
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
    dashboardUsersClient.child(uid).off('value');
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
 * Updates an event template on the database
 * @param {string | null} authorUid User identifier or null if public template
 * @param {string} templateId Event identfier
 * @param {object} templateData Template data to update
 * @param {callback} onComplete Function called after update event template on database
 */
export function updateEventTemplate(authorUid, templateId, templateData, onComplete) {
    if (authorUid) {
        eventPrivateTemplates.child(authorUid).child(templateId).update(templateData, onComplete);
    } else {
        eventPublicTemplates.child(templateId).update(templateData, onComplete);
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

/**
 * User donations
 */

/**
 * Put a listener on the UserDonations database node
 * @param {callback} loadDonations Handles the donations information
 */
export function loadUsersDonations(loadDonations) {
    userDonationsRef.orderByChild('completed').equalTo(false).on('value', loadDonations);
}

/**
 * Mark as completed a user donation in both request (UserDonations) and history (DonationsHistory) nodes
 * @param {string} uid User identifier
 * @param {string} donationId Donation identifier
 * @param {number} qoinsDonated Number of qoins donated
 * @param {number} bitsDonated Number of bits donated
 */
export async function completeUserDonation(uid, donationId, qoinsDonated, bitsDonated) {
    const pointsToAdd = qoinsDonated / (await getDonationQoinsBase()).val();

    const rewardProgress = await usersRewardsProgressRef.child(uid).once('value');
    let tensInPoints = Math.floor(pointsToAdd / 10);
    const bitsPackagesToDonate = qoinsDonated / 200;

    if (!rewardProgress.exists()) {
        const currentPoints = pointsToAdd - tensInPoints * 10;
        const donations = {
            bits:  bitsDonated * bitsPackagesToDonate,
            qoins: qoinsDonated
        };

        await usersRewardsProgressRef.child(uid).update({
            currentPoints,
            donations,
            lifes: tensInPoints,
            rewardsReedemed: 0
        });
    } else {
        let currentPoints = rewardProgress.val().currentPoints + pointsToAdd;
        tensInPoints = Math.floor(currentPoints / 10);
        currentPoints -= tensInPoints * 10;
        const donations = {
            ...rewardProgress.val().donations,
            bits: (rewardProgress.val().donations.bits ? rewardProgress.val().donations.bits : 0) + (bitsDonated * bitsPackagesToDonate),
            qoins: (rewardProgress.val().donations.qoins ? rewardProgress.val().donations.qoins : 0) + qoinsDonated
        };

        await usersRewardsProgressRef.child(uid).update({
            currentPoints,
            lifes: rewardProgress.val().lifes + tensInPoints,
            donations
        });
    }

    await donationsHistoryRef.child(uid).child(donationId).update({ status: 'completed' });
    await userDonationsRef.child(donationId).remove();
}

/**
 * Mark as canceled a user donation in both request (UserDonations) and history (DonationsHistory) nodes
 * @param {string} uid User identifier
 * @param {string} donationId Donation identifier
 */
export async function cancelUserDonation(uid, donationId) {
    await donationsHistoryRef.child(uid).child(donationId).update({ status: 'rejected' });
    await userDonationsRef.child(donationId).remove();
}

/**
 * Donations costs
 */

/**
 * Get the cost (in Qoins) of the eCoins available to donate
 */
export async function getDonationsCosts() {
    return await DonationsCostsRef.child('ECoinToQoinRatio').once('value');
}

/**
 * Get the base of Qoins considered in the ECoin To Qoin equation
 */
export async function getDonationQoinsBase() {
    return await DonationsCostsRef.child('QoinsBase').once('value');
}

/**
 * Distribute the specified ammount of experience to the given users+
 * @param {Array} experienceArray Object with uid and experience to give
 * @example distributeExperienceToUsers('RocketEvent', [{ uid: 'advdf', userName: 'inde', experience: 20 }, { uid: 'nciodsn', userName: 'DHVS', experience: 50 }]);
 */
export async function distributeExperienceToUsers(eventId, experienceArray) {
    distributeLeaderboardExperience(eventId, experienceArray);
}

/**
 * Return the amount of experience in the qaplaLevel node on the user profile
 * @param {string} uid User identifier
 */
export async function getUserQaplaLevel(uid) {
    const userExperience = await usersRef.child(uid).child('qaplaLevel').once('value');
    return userExperience.exists() ? userExperience.val() : 0;
}

/**
 * Leaderboard
 */

/**
 * Return the amount of experience (totalDonations node) on the donations leaderboard user node
 * If the node does not exist it creates the node and returns 0
 * @param {string} uid User identifier
 */
export async function getUserLeaderboardExperience(uid) {
    const leaderboardExperience = await DonationsLeaderBoardRef.child(uid).child('totalDonations').once('value');
    if (!leaderboardExperience.exists()) {
        await DonationsLeaderBoardRef.child(uid).update({
            totalDonations: 0,
            userName: (await getUserUserName(uid)).val()
        });

        return 0;
    }

    return leaderboardExperience.val();
}

/**
 * Returns all the users of the leaderboard
 */
export async function getLeaderboard() {
    return await (await DonationsLeaderBoardRef.orderByChild('totalDonations').limitToLast(100).once('value')).val();
}

/**
 * Reset the leaderboard and give prizes to users
 * @param {array} users Array of the top users in the leaderboard
 * @param {function} updateHelperText Function called on every step of the process
 * @param {function} onSuccess Function called once the process is finished
 */
export async function resetLeaderboard(users, updateHelperText, onSuccess) {
    updateHelperText('Obteniendo usuarios del leaderboard...')
    const donations = (await DonationsLeaderBoardRef.orderByChild('totalDonations').startAt(1).once('value')).val();
    const qaplaLevels = await qaplaLevelsRequirementsRef.once('value');

    let usersWithDonations = [];
    let updateLeaderboard = {};

    updateHelperText('Procesando usuarios del leaderboard...');
    Object.keys(donations).map((uid) => {
        usersWithDonations.push({ uid, seasonXQ: donations[uid].totalDonations });

        updateLeaderboard[`${uid}/`] = { ...donations[uid], totalDonations: 0 };
    });

    updateHelperText('Reseteando valores del leaderboard...');
    await DonationsLeaderBoardRef.update(updateLeaderboard);

    updateHelperText('Definiendo niveles de fin del temporada 0%');
    for (let i = 0; i < usersWithDonations.length; i++) {
        const user = usersWithDonations[i];
        const lastSeasonLevel = getUserSeasonLevel(user.seasonXQ, qaplaLevels.val());
        await usersRef.child(user.uid).update({ lastSeasonLevel, seasonXQ: 0 });
        let progress = Math.round(i / usersWithDonations.length * 100);
        updateHelperText(`Definiendo niveles de fin del temporada ${progress}%`);
    }

    updateHelperText('Bajando nivel a usuarios que no participaron esta temporada');
    const usersWithLevel = await usersRef.orderByChild('lastSeasonLevel').startAt(1).once('value');

    const keysOfUsersWithLevel = Object.keys(usersWithLevel.val()).map((uid) => ({ uid, ...usersWithLevel.val()[uid] }));
    for (let i = 0; i < Object.keys(usersWithLevel.val()).length; i++) {
        const user = keysOfUsersWithLevel[i];
        const thisUserHaveXQ = usersWithDonations.find((userWithXQ) => userWithXQ.uid === user.uid);

        if (!thisUserHaveXQ) {
            console.log(user.uid, user.lastSeasonLevel);
            await usersRef.child(user.uid).update({ lastSeasonLevel: 1, seasonXQ: 0 });
        }
    }

    updateHelperText('Entregando premios...');
    users.map((user) => {
        usersRef.child(user.uid).child('credits').transaction((qoins) => {
            if (qoins !== null) {
                return qoins + user.qoins;
            }

            return user.qoins;
        });
    });

    updateHelperText('Notificando usuarios...');
    await notificateUsersOnLeaderboardReset(usersWithDonations);

    updateHelperText('Listo, cerrando modal!');
    setTimeout(() => {
        onSuccess();
    }, 1500);
}

/**
 * Helper function to validate if the level distribution was correct after a leadarboard reset
 */
export async function getUsersWithLastSeasonLevel() {
    const donations = staticLeaderboard; // (await DonationsLeaderBoardRef.orderByChild('totalDonations').startAt(1).once('value')).val();

    let usersWithDonations = [];
    Object.keys(donations).map((uid) => {
        if (donations[uid].totalDonations) {
            usersWithDonations.push({ uid, seasonXQ: donations[uid].totalDonations });
        }
    });

    // Uncomment to check reset of levels succesful for users who dont participate this season
    /* const usersWithLevel = (await usersRef.orderByChild('lastSeasonLevel').startAt(2).once('value')).val();

    Object.keys(usersWithLevel).forEach((uid) => {
        if (!donations[uid]) {
            console.log('Usuario con 0 donaciones pero nivel 2 o mas', uid, usersWithLevel[uid].lastSeasonLevel);
        }
    }); */

    const qaplaLevels = await qaplaLevelsRequirementsRef.once('value');

    let badUsers = [];
    for (let i = 0; i < usersWithDonations.length; i++) {
        const user = usersWithDonations[i];
        const calculatedLevel = getUserSeasonLevel(user.seasonXQ, qaplaLevels.val());
        const actualLevel = await usersRef.child(user.uid).child('lastSeasonLevel').once('value');

        if (calculatedLevel !== actualLevel.val()) {
            badUsers.push({ uid: user.uid, calculatedLevel, actualLevel: actualLevel.val() });
        } else {
            console.log('Usuario bien: ', user.uid, calculatedLevel, actualLevel.val());
        }
    }

    console.table(badUsers);
}

/**
 * Determines the current level of the given user
 * @param {number} userSeasonXQ XQ acumulated of the season
 * @param {array} qaplaLevels Array with the details of the Qapla levels
 * @returns {number} Level of the given user
 */
export function getUserSeasonLevel(userSeasonXQ, qaplaLevels) {
    let currentLevel = 1;
    qaplaLevels.forEach((level, index) => {
        if (userSeasonXQ >= level.requiredXQ) {
            currentLevel = index + 1;
        }
    });

    return currentLevel;
}

/**
 * Check if the invitation code exists
 * @param {string} invitationCode Random invitation code
 */
export async function invitationCodeExists(invitationCode) {
    if (invitationCode) {
        return (await InvitationCodeRef.child(invitationCode).once('value')).exists();
    }

    return false;
}

/**
 * Save the invitation code in the database, if free trial true saves the details of the subscription
 * so the user can inmediatly get the benefits of their free trial
 * @param {string} invitationCode Invitation code
 * @param {boolean} freeTrial Flag to know if the user will have or not a free trial
 * @param {object} subscriptionDetails Details like streamsIncluded and redemptionsPerStream
 */
export async function saveInvitationCode(invitationCode, freeTrial, subscriptionDetails) {
    if (freeTrial) {
        await InvitationCodeRef.child(invitationCode).set({ freeTrial, subscriptionDetails });
    } else {
        await InvitationCodeRef.child(invitationCode).set(true);
    }
}

/**
 * Return true if the streamer id exists
 * @param {string} uid Streamer Identifier
 */
export async function streamerProfileExists(uid) {
    return (await userStreamersRef.child(uid).once('value')).exists();
}

/**
 * Remove the invitation code and create the profile for the streamer
 * @param {string} uid User Identifier
 * @param {object} userData Data to save
 * @param {string} inviteCode Invitation code used
 */
export async function createStreamerProfile(uid, userData, inviteCode) {
    InvitationCodeRef.child(inviteCode).remove();
    return await userStreamersRef.child(uid).update(userData);
}

/**
 * Return the streamsApproval node content
 */
export async function getStreamsToApprove() {
    return await streamsApprovalRef.once('value');
}

/**
 * Remove stream to approve
 * @param {string} streamId Stream identifier
 */
export async function removeEventToApprove(streamId) {
    return await streamsApprovalRef.child(streamId).remove();
}

/**
 * Remove stream to approve and update streamerreference to approved
 * @param {string} idStreamer Id of the streamer that request the approval
 * @param {string} streamId Stream identifier
 * @param {number} timestamp Final timestamp of the event
 * @param {string} date UTC date in format DD-MM-YYYY
 * @param {string} hour UTC hour in format HH:MM
 */
export async function approveStreamRequest(idStreamer, streamId, timestamp, date, hour) {
    removeEventToApprove(streamId);
    streamersEventsDataRef.child(idStreamer).child(streamId).update({ status: 2, timestamp, date, hour });

    // Update last event timestamp to show on cheers list
    const lastTimestamp = await userStreamersRef.child(idStreamer).child('lastStreamTs').once('value');
    if (!lastTimestamp.exists() || (lastTimestamp.exists() && lastTimestamp.val() < timestamp)) {
        userStreamersRef.child(idStreamer).update({ lastStreamTs: timestamp });
    }
}

/**
 * Update the stream information on the streamer node
 * @param {string} idStreamer Id of the streamer that request the approval
 * @param {string} streamId Stream identifier
 * @param {number} timestamp Final timestamp of the event
 * @param {string} date UTC date in format DD-MM-YYYY
 * @param {string} hour UTC hour in format HH:MM
 */
export async function updateStreamerEventData(idStreamer, streamId, timestamp, date, hour) {
    streamersEventsDataRef.child(idStreamer).child(streamId).update({ timestamp, date, hour });

    // Update last event timestamp to show on cheers list
    const lastTimestamp = await userStreamersRef.child(idStreamer).child('lastStreamTs').once('value');
    if (!lastTimestamp.exists() || (lastTimestamp.exists() && lastTimestamp.val() < timestamp)) {
        userStreamersRef.child(idStreamer).update({ lastStreamTs: timestamp });
    }
}

/**
 * Reject a stream request
 * @param {string} idStreamer Id of the streamer
 * @param {string} streamId Stream identifier
 * @param {function} onFinished Callback called once the stream is rejected
 */
export async function rejectStreamRequest(idStreamer, streamId, onFinished) {
    removeEventToApprove(streamId);
    streamersEventsDataRef.child(idStreamer).child(streamId).remove(onFinished);
}

/**
 * Create a stream request in the nodes StreamersEvents and StreamsApproval
 * @param {object} streamer User object
 * @param {string} game Selected game for the stream
 * @param {string} date Date in formar DD/MM/YYYY
 * @param {string} hour Hour in format hh:mm
 * @param {string} streamType One of 'exp' or 'tournament'
 * @param {timestamp} timestamp Timestamp based on the given date and hour
 */
export async function createNewStreamRequest(streamer, game, date, hour, streamType, timestamp) {
    const event = await streamersEventsDataRef.child(streamer.uid).push({
        date,
        hour,
        game,
        status: 1,
        streamType,
        timestamp
    });

    return await streamsApprovalRef.child(event.key).set({
        date,
        hour,
        game,
        idStreamer: streamer.uid,
        streamerName: streamer.displayName,
        streamType,
        timestamp,
        streamerChannelLink: 'https://twitch.tv/' + streamer.login,
        streamerPhoto: streamer.photoUrl
    });
}

/**
 * Returns all the leaderboard prizes
 */
export async function loadLeaderboardPrizes() {
    return await leaderBoardPrizesRef.once('value');
}

/**
 * Update the leaderboard prizes
 * @param {array} prizes Prizes array
 */
export async function updateLeaderboardPrizes(prizes) {
    return await leaderBoardPrizesRef.set(prizes);
}

/**
 * Get the number of winners in the current leaderboard season
 */
export async function getLeaderboardWinnersNumber() {
    return await leaderboardWinnersRef.once('value');
}

/**
 * Set the number of winners in the current leaderboard season
 * @param {number} numberOfWinners Number value to save
 */
export async function setLeaderboardWinnersNumber(numberOfWinners) {
    return await leaderboardWinnersRef.set(numberOfWinners);
}

/**
 * QaplaStreamers
 */

/**
 * Get the entire node of QaplaStreamers
 */
export async function getQaplaStreamers() {
    return await qaplaStreamersRef.once('value');
}

/**
 * Overwrite the QaplaStreamers node with the given content
 * @param {object} qaplaStreamers Qapla streamers to save
 */
export async function saveQaplaStreamers(qaplaStreamers) {
    qaplaStreamersRef.set(qaplaStreamers);
}

/**
 * Get the bit donation size of the given streamer
 * @param {string} streamerName Streamer name
 */
export async function getQaplaStreamerBitDonationSize(streamerName) {
    return await qaplaStreamersRef.child(streamerName).child('donationSize').child('bits').once('value');
}

/**
 * ActiveCustomRewards
 */

/**
 * Get the snapshot of all the active custom rewards
 */
export async function getAllActiveCustomRewards() {
    return await activeCustomRewardsRef.once('value');
}

/**
 * Add a game on the games resources -> all games node
 * @param {string} gameKey Key of the game to save
 * @param {string} gameName Name of the game to save
 * @param {url} fallbackImageUrl URL of the image to show in streamers dashboard if there are no local file
 */
export async function addGameToCategories(gameKey, gameName, fallbackImageUrl) {
    return await gamesRef.child('allGames').child(gameKey).set({
        gameName,
        acronym: 'Twitch',
        name: 'Twitch',
        fallbackImageUrl,
        informationNeededToAdd: {
            'Twitch Username': {
                required: true,
                hint: {
                    en: 'Username of Twitch',
                    es: 'Username de Twitch'
                }
            }
        }
    });
}

/**
 * Retruns all the streamers with premium flag equal to true
 */
export async function getPremiumStreamers() {
    return await userStreamersRef.orderByChild('premium').equalTo(true).once('value');
}

/**
 * Store cheers on the database at StreamersDonations node
 * @param {string} streamerUid Streamer uid
 * @param {string} streamerName Name of the streamer
 * @param {number} amountQoins Amount of donated Qoins
 * @param {string} message Message from the user
 * @param {number} timeStamp Timestamp of the moment when the donation is sent
 * @param {string} userName Qapla username
 * @param {string} twitchUserName Username of Twitch
 * @param {string} userPhotoURL URL of the user profile photo
 * @param {string} type Type of donation (one of QLANES or OTHER)
 */
 export async function sendCheersFromQapla(streamerUid, streamerName, amountQoins, message, timestamp, userName, twitchUserName, userPhotoURL, type) {
    const donationRef = streamersDonationsRef.child(streamerUid).push({
        amountQoins,
        message,
        timestamp,
        uid: '',
        read: false,
        twitchUserName,
        userName,
        photoURL: userPhotoURL
    });

    if (type === QLANES) {
        userStreamersRef.child(streamerUid).child('qlanBalance').transaction((streamerQoins) => {
            if (streamerQoins) {
                streamerQoins += amountQoins;
            }

            return streamerQoins ? streamerQoins : amountQoins;
        });
    } else {
        userStreamersRef.child(streamerUid).child('qoinsBalance').transaction((streamerQoins) => {
            if (streamerQoins) {
                streamerQoins += amountQoins;
            }

            return streamerQoins ? streamerQoins : amountQoins;
        });
    }

    database.ref('/StreamersDonationAdministrative').child(donationRef.key).set({
        amountQoins,
        message,
        timestamp,
        uid: '',
        sent: false,
        twitchUserName,
        userName,
        streamerName
    });
}

/**
 * Write (with transactions) the qoins on user profile and the XQ on qaplaLevel, seasonXQ and totalDonations nodes
 * @param {string} uid User identifier
 * @param {number} xq Ammount of XQ to assign
 * @param {number} qoins Amount of Qoins to assign
 * @returns Empty string if completed and error list on string otherwise
 */
export async function giveQoinsAndXQToUser(uid, xq, qoins) {
    let errorString = '';

    if (xq && xq > 0) {
        const qaplaLevelUpdate = await usersRef.child(uid).child('qaplaLevel').transaction((level) => {
            if (level) {
                return level + xq;
            }

            return xq;
        });

        if (!qaplaLevelUpdate.committed) {
            errorString += '\nError al actualizar qaplaLevel';
        }

        const seasonXQUpdate = await usersRef.child(uid).child('seasonXQ').transaction((seasonXQ) => {
            if (seasonXQ) {
                return seasonXQ + xq;
            }

            return xq;
        });

        if (!seasonXQUpdate.committed) {
            errorString += '\nError al actualizar seasonXQ';
        }

        const totalDonationsUpdate = await DonationsLeaderBoardRef.child(uid).child('totalDonations').transaction((totalDonations) => {
            if (totalDonations) {
                return totalDonations + xq;
            }

            return xq;
        });

        if (!totalDonationsUpdate.committed) {
            errorString += '\nError al actualizar totalDonations';
        }

        if (!errorString) {
            const date = new Date();
            await userStreamsRewardsRef.child(uid).push({ type: XQ, streamerName: 'Qapla', streamId: '', amount: xq, timestamp: date.getTime() });
        }
    }

    if (qoins && qoins > 0) {
        const qoinsUpdate = await usersRef.child(uid).child('credits').transaction((currentQoins) => {
            if (currentQoins) {
                return currentQoins + qoins;
            }

            return qoins;
        });

        if (!qoinsUpdate.committed) {
            errorString += '\nError al dar Qoins';
        } else {
            const date = new Date();
            await userStreamsRewardsRef.child(uid).push({ type: QOINS, streamerName: 'Qapla', streamId: '', amount: qoins, timestamp: date.getTime() });
        }
    }

    return errorString;
}

export async function getPastEventsByTimestamp(startTimestamp) {
    return await eventsDataAdminRef.orderByChild('timestamp').startAt(startTimestamp).once('value');
}