import React, { useState , useEffect} from 'react';
import { useParams } from 'react-router-dom';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

import styles from './JoinToEventRequest.module.css';
import { getEventJoinRequests, removeEventJoinRequestsListener, approveEventJoinRequest, rejectEventJoinRequest, getUserLanguage, addQoinsToUser } from '../../services/database';
import { notificateUser } from '../../services/functions';

const JoinToEventRequest = ({ events }) => {
    const { eventId } = useParams();
    const [usersRequests, setUsersRequests] = useState([]);
    const [eventFields, setEventFields] = useState([]);
    const hidedFields = ['token', 'timeStamp', 'firebaseUserIdentifier', 'eventEntry'];

    useEffect(() => {
        getEventJoinRequests(eventId, loadUserRequests);

        return () => {
            removeEventJoinRequestsListener(eventId);
        };
    }, [eventId]);

    /**
     * Handle the changes of the user requests node and save it
     * on the state
     * @param {object} usersRequest Requests of the user
     */
    const loadUserRequests = (usersRequest) => {
        console.log(usersRequest.val());
        if (usersRequest.exists()) {
            let eventFields = {};
            Object.keys(usersRequest.val())
            .some((userKey) => {
                eventFields = Object.getOwnPropertyNames(usersRequest.val()[userKey]);

                delete eventFields.token;

                return true;
            });

            setUsersRequests(
                Object.keys(usersRequest.val())
                .sort((a, b) => usersRequest.val()[a].timeStamp - usersRequest.val()[b].timeStamp)
                .map((uid) => {
                    const userRequest = usersRequest.val()[uid];
                    userRequest.firebaseUserIdentifier = uid;

                    return userRequest;
                })
            );
            setEventFields(eventFields);
        } else {
            setUsersRequests([]);
        }
    }

    /**
     * Approve the users request to join on the event and notificate
     * the user via push notification
     * @param {string} uid User identifier
     * @param {object} userData Data of the user to save
     */
    const acceptUserRequest = async (uid, userData) => {
        const approveNotificationContent = {
            es: {
                title: 'Tu solicitud ha sido aprobada',
                body: `Tu solicitud para participar en el evento ${events[eventId].titulo} ha sido aceptada :D`
            },
            en: {
                title: 'Your request has been approved',
                body: `Your request to participate on the event ${events[eventId].titulo} has been approved :D`
            }
        };

        delete userData.firebaseUserIdentifier;

        approveEventJoinRequest(uid, eventId, userData);
        const userLanguage = await getUserLanguage(uid);

        notificateUser(
            uid,
            userData.token,
            approveNotificationContent[userLanguage].title,
            approveNotificationContent[userLanguage].body,
            {
                eventId
            },
            {
                navigateTo: 'Achievements',
                eventId
            }
        );
    }

    /**
     * Reject the users request to join on the event and notificate
     * the user via push notification
     * @param {string} uid User identifier
     * @param {string} token User firebase cloud messaging token to notify him
     */
    const deleteUserRequest = async (uid, token) => {
        const rejectNotificationContent = {
            es: {
                title: 'Tu solicitud ha sido rechazada',
                body: `Tu solicitud para participar en el evento ${events[eventId].titulo} ha sido rechazada.`
            },
            en: {
                title: 'Your request has been rejected',
                body: `Your request to participate on the event ${events[eventId].titulo} has been rejected.`
            }
        };

        if (window.confirm('¿Estas seguro que deseas rechazar esta solicitud?')) {
            rejectEventJoinRequest(uid, eventId);
            const userLanguage = await getUserLanguage(uid);

            try {
                notificateUser(
                    uid,
                    token,
                    rejectNotificationContent[userLanguage].title,
                    rejectNotificationContent[userLanguage].body,
                    {},
                    {
                        navigateTo: 'Achievements',
                        eventId
                    }
                );
            } catch (e) {
                console.log(e);
            }
        }

        if (events[eventId].eventEntry) {
            addQoinsToUser(uid, events[eventId].eventEntry);
        }
    }

    return (
        <TableContainer component={Paper}>
            <Table stickyHeader>
                <TableHead>
                <TableRow>
                    {eventFields.map((eventField) => (
                        <React.Fragment key={eventField}>
                        {hidedFields.indexOf(eventField) === -1 ?
                            <TableCell align='center'>
                                {eventField}
                            </TableCell>
                            :
                            <></>
                        }
                        </React.Fragment>
                    ))}
                    <TableCell align='center'>
                        Acciones
                    </TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                    {usersRequests.map((request) => (
                        <TableRow key={`request${request.firebaseUserIdentifier}`}>
                            {Object.keys(request).map((requestField, index) => (
                                <React.Fragment key={`${request.firebaseUserIdentifier}${requestField}-${index}`}>
                                    {hidedFields.indexOf(requestField) === -1 ?
                                        <TableCell align='center'>
                                            {request[requestField]}
                                        </TableCell>
                                        :
                                        <></>
                                    }
                                </React.Fragment>
                            ))}
                            <TableCell colSpan={2} align='center'>
                                <Button
                                    variant='contained'
                                    color='primary'
                                    className={styles.AcceptButton}
                                    onClick={() => acceptUserRequest(request.firebaseUserIdentifier, request)}>
                                    Aceptar
                                </Button>
                                <Button
                                    variant='contained'
                                    color='secondary'
                                    onClick={() => deleteUserRequest(request.firebaseUserIdentifier, request.token)}>
                                    Rechazar
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default JoinToEventRequest;
