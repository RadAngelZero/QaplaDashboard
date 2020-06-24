import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import { getEventParticipants, removeEventParticipant, getUserLanguage, addQoinsToUser } from '../../services/database';
import { Button } from '@material-ui/core';
import { notificateUser } from '../../services/functions';

const EventParticipantsList = ({ events }) => {
    const { eventId } = useParams();
    const [eventParticipants, setEventParticipants] = useState([]);
    const [eventFields, setEventFields] = useState([]);
    const hidedFields = ['token', 'timeStamp', 'firebaseUserIdentifier', 'eventEntry'];

    useEffect(() => {
        async function getParticipants() {
            getEventParticipants(eventId, loadParticipantsList);
        }

        getParticipants();
    }, []);

    /**
     * Saves and sort the list of participants on the local state
     * @param {object} eventParticipants List of participants
     */
    const loadParticipantsList = (eventParticipants) => {
        if (eventParticipants) {
            let eventFields = {};

            Object.keys(eventParticipants).some((userKey) => {
                eventFields = Object.getOwnPropertyNames(eventParticipants[userKey]);

                delete eventFields.token;

                return true;
            });

            setEventParticipants(
                Object.keys(eventParticipants)
                .sort((a, b) => eventParticipants[a].timeStamp - eventParticipants[b].timeStamp)
                .map((uid) => {
                    const participant = eventParticipants[uid];
                    participant.firebaseUserIdentifier = uid;

                    return participant;
                })
            );

            setEventFields(eventFields);
        }
    }

    /**
     * Remove a participant from the event participant list
     * @param {string} uid User identifier
     * @param {string} token Token of the user
     */
    const removeParticipant = async (uid, token) => {
        const rejectNotificationContent = {
            es: {
                title: `Se rechazo tu participación en el evento: ${events[eventId].title['es']}`
            },
            en: {
                title: `Your participation in the event: ${events[eventId].title['en']} has been rejected`
            }
        };

        if (window.confirm('¿Estas seguro que deseas eliminar a este participante?')) {
            removeEventParticipant(uid, eventId)
            const userLanguage = await getUserLanguage(uid);

            if (events[eventId].eventEntry) {
                addQoinsToUser(uid, events[eventId].eventEntry);
            }

            const message = window.prompt(
                'Agrega un mensaje para el participante (opcional):',
                'Tu solicitud fue eliminada por que la información que contiene no es valida.'
            );

            if (message) {
                try {
                    notificateUser(
                        uid,
                        token,
                        rejectNotificationContent[userLanguage].title,
                        message,
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
                    {eventParticipants && eventParticipants.map((participant, index) => (
                        <TableRow key={`requestNumber${index}`}>
                            {eventFields.map((requestField, index) => (
                                <React.Fragment key={`${index}${participant[requestField]}`}>
                                    {hidedFields.indexOf(requestField) === -1 ?
                                        <TableCell align='center'>
                                            {participant[requestField]}
                                        </TableCell>
                                        :
                                        <></>
                                    }
                                </React.Fragment>
                            ))}
                            <TableCell align='center'>
                                <Button
                                    variant='contained'
                                    onClick={() => removeParticipant(participant.firebaseUserIdentifier, participant.token)}>
                                    Eliminar
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default EventParticipantsList;
