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
    const hidedFields = ['token', 'timeStamp', 'firebaseUserIdentifier', 'eventEntry'];

    useEffect(() => {
        async function getParticipants() {
            const eventParticipants = await getEventParticipants(eventId);
            if (eventParticipants) {
                let eventFields = {};

                Object.keys(eventParticipants).some((userKey) => {
                    eventFields = Object.getOwnPropertyNames(eventParticipants[userKey]);

                    delete eventFields.token;

                    return true;
                });

                setEventParticipants(eventParticipants);
                setEventFields(eventFields);
            }
        }

        getParticipants();
    }, []);

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
                    </TableRow>
                </TableHead>
                <TableBody>
                    {eventParticipants && Object.keys(eventParticipants).map((requesterUid, index) => (
                        <TableRow key={`requestNumber${index}`}>
                            {eventFields.map((requestField, index) => (
                                <React.Fragment key={`${index}${eventParticipants[requesterUid][requestField]}`}>
                                    {hidedFields.indexOf(requestField) === -1 ?
                                        <TableCell align='center'>
                                            {eventParticipants[requesterUid][requestField]}
                                        </TableCell>
                                        :
                                        <></>
                                    }
                                </React.Fragment>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default EventParticipantsList;
