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
import { getEventJoinRequests, removeEventJoinRequestsListener, approveEventJoinRequest, rejectEventJoinRequest } from '../../services/database';

const JoinToEventRequest = () => {
    const { eventId } = useParams();
    const [usersRequests, setUsersRequests] = useState({});
    const [eventFields, setEventFields] = useState([]);

    useEffect(() => {
        getEventJoinRequests(eventId, loadUserRequests);

        return () => {
            removeEventJoinRequestsListener(eventId);
        };
    }, [eventId]);

    const loadUserRequests = (usersRequest) => {
        if (usersRequest.exists()) {
            let eventFields = {};
            Object.keys(usersRequest.val()).some((userKey) => {
                eventFields = Object.getOwnPropertyNames(usersRequest.val()[userKey]);

                delete eventFields.token;

                return true;
            });

            setUsersRequests(usersRequest.val());
            setEventFields(eventFields);
        } else {
            setUsersRequests({});
        }
    }

    const acceptUserRequest = (uid, userData) => {
        approveEventJoinRequest(uid, eventId, userData);
    }

    const deleteUserRequest = (uid) => {
        if (window.confirm('¿Estas seguro que deseas rechazar esta solicitud?')) {
            rejectEventJoinRequest(uid, eventId);
        }
    }

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
                    <TableCell align='center'>
                        Acciones
                    </TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                    {Object.keys(usersRequests).map((requesterUid, index) => (
                        <TableRow key={`requestNumber${index}`}>
                            {Object.keys(usersRequests[requesterUid]).map((requestField, index) => (
                                <>
                                    {requestField !== 'token' ?
                                        <TableCell
                                            align='center'
                                            key={`${index}${usersRequests[requesterUid][requestField]}`}>
                                            {usersRequests[requesterUid][requestField]}
                                        </TableCell>
                                        :
                                        <></>
                                    }
                                </>
                            ))}
                            <TableCell colSpan={2} align='center'>
                                <Button
                                    variant='contained'
                                    color='primary'
                                    className={styles.AcceptButton}
                                    onClick={() => acceptUserRequest(requesterUid, usersRequests[requesterUid])}>
                                    Aceptar
                                </Button>
                                <Button
                                    variant='contained'
                                    color='secondary'
                                    onClick={() => deleteUserRequest(requesterUid)}>
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
