import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import { getEventParticipants } from '../../services/database';

const EventParticipantsList = () => {
    const { eventId } = useParams();
    const [eventParticipants, setEventParticipants] = useState({});
    const [eventFields, setEventFields] = useState([]);

    useEffect(() => {
        async function getParticipants() {
            const eventParticipants = await getEventParticipants(eventId);
            let eventFields = {};

            Object.keys(eventParticipants).some((userKey) => {
                eventFields = Object.getOwnPropertyNames(eventParticipants[userKey]);

                delete eventFields.token;

                return true;
            });

            setEventParticipants(eventParticipants);
            setEventFields(eventFields);
        }

        getParticipants();
    }, []);

    return (
        <TableContainer component={Paper}>
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        {eventFields.map((eventField) => (
                            <>
                            {eventField !== 'token' ?
                                <TableCell key={eventField} align='center'>
                                    {eventField}
                                </TableCell>
                                :
                                <></>
                            }
                            </>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Object.keys(eventParticipants).map((requesterUid, index) => (
                        <TableRow key={`requestNumber${index}`}>
                            {Object.keys(eventParticipants[requesterUid]).map((requestField, index) => (
                                <>
                                    {requestField !== 'token' ?
                                        <TableCell
                                            align='center'
                                            key={`${index}${eventParticipants[requesterUid][requestField]}`}>
                                            {eventParticipants[requesterUid][requestField]}
                                        </TableCell>
                                        :
                                        <></>
                                    }
                                </>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default EventParticipantsList;
