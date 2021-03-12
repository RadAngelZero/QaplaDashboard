import React, { useEffect, useState } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

import { loadUsersDonations, completeUserDonation, cancelUserDonation, getUserToken, getUserLanguage, addQoinsToUser, getQaplaStreamerBitDonationSize } from '../../services/database';
import { notificateUser } from '../../services/functions';
import ChooseDonationCurrencyDialog from '../ChooseDonationCurrencyDialog/ChooseDonationCurrencyDialog';

const hidedFields = ['uid', 'completed'];

const notifications = {
    completed: {
        title: {
            es: 'Donación Completada',
            en: 'Donation Completed'
        },
        body: {
            es: 'La donación que solicitaste sera realizada en breve',
            en: 'Your requested donation will be executed shortly'
        }
    },
    canceled: {
        title: {
            es: 'Donación Cancelada',
            en: 'Donation Canceled'
        }
    },
    customMessage: {
        title: {
            es: 'Sobre tu Donación',
            en: 'About your Donation'
        }
    }
};

const DonationsRequests = ({ user }) => {
    const [donationsRequests, setDonationsRequests] = useState({});
    const [donationFields, setDonationFields] = useState([]);
    const [openDonationCurrencyDialog, setOpenDonationCurrencyDialog] = useState(false);
    const [selectedDonation, setSelectedDonation] = useState({});

    useEffect(() => {
        if (user && user.admin) {
            loadUsersDonations(loadRequests);
        }
    }, [user]);

    /**
     * Handle the user donations request node
     * @param {object} userDonationsSnap Donations node
     */
    const loadRequests = (userDonationsSnap) => {
        if (userDonationsSnap.exists()) {
            const userDonations = userDonationsSnap.val();
            let userDonationFields = [];
            const upperRegExp = new RegExp(/([A-Z])+/g);
            Object.keys(userDonations).some((donationId) => {
                const propertysNames = Object.getOwnPropertyNames(userDonations[donationId]);
                propertysNames.map((field, index) => {
                    userDonationFields.push('');
                    for (let j = 0; j < field.length; j++) {
                        if (upperRegExp.test(field.charAt(j))) {
                            userDonationFields[index] += ` ${field.charAt(j)}`;
                        } else {
                            userDonationFields[index] += field.charAt(j);
                        }
                    }
                });

                return true;
            });

            setDonationsRequests(userDonations);
            setDonationFields(userDonationFields);
        } else {
            setDonationsRequests({});
        }
    }

    const approveDonation = (donationId) => {
        setSelectedDonation({ ...donationsRequests[donationId], donationId});
        setOpenDonationCurrencyDialog(true);
    }

    const completeDonation = async (donationId) => {
        const donationInfo = donationsRequests[donationId];
        let bitsToDonate = await getQaplaStreamerBitDonationSize(donationInfo.StreamerName);
        if (bitsToDonate.exists()) {
            bitsToDonate = bitsToDonate.val();
        } else {
            bitsToDonate = parseInt(prompt('¿Cuantos bits recibira el usuario por esta donación?'));
        }

        completeUserDonation(donationInfo.uid, donationId, parseInt(donationInfo.Qoins), bitsToDonate);
        const userToken = await getUserToken(donationInfo.uid);
        if (userToken.exists()) {
            const userLanguage = await getUserLanguage(donationInfo.uid);
            notificateUser(donationInfo.uid, userToken.val(), notifications.completed.title[userLanguage || 'es'], notifications.completed.body[userLanguage || 'es']);
        }
    }

    const cancelDonation = async (uid, donationId, qoins) => {
        const userToken = await getUserToken(uid);
        if (userToken.exists()) {
            const userLanguage = await getUserLanguage(uid);
            const reason = prompt(`Razon de la cancelación en ${userLanguage && userLanguage === 'es' ? 'español' : 'inglés'}`);
            if (reason) {
                addQoinsToUser(uid, parseInt(qoins));
                cancelUserDonation(uid, donationId);
                notificateUser(uid, userToken.val(), notifications.canceled.title[userLanguage || 'es'], reason);
            }
        }
    }

    const sendMessageToUser = async (uid) => {
        const userToken = await getUserToken(uid);
        if (userToken.exists()) {
            const userLanguage = await getUserLanguage(uid);
            const reason = prompt(`Mensaje para el usuario en ${userLanguage && userLanguage === 'es' ? 'español' : 'inglés'}`);
            if (reason) {
                notificateUser(uid, userToken.val(), notifications.customMessage.title[userLanguage || 'es'], reason);
            } else {
                alert('Información insuficiente para enviar la notificación');
            }
        }
    }

    return (
        <TableContainer component={Paper}>
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        {donationFields.map((eventField) => (
                            <React.Fragment key={eventField}>
                            {hidedFields.indexOf(eventField) === -1 ?
                                <TableCell align='center'>
                                    {eventField[0].toUpperCase() + eventField.slice(1)}
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
                    {donationsRequests && Object.keys(donationsRequests).map((donationId, index) => (
                        <TableRow key={`donationNumber${index}`}>
                            {Object.keys(donationsRequests[donationId]).map((donationField, index) => (
                                <React.Fragment key={`${index}${donationsRequests[donationId][donationField]}`}>
                                    {hidedFields.indexOf(donationField) === -1 ?
                                        <TableCell align='center'>
                                            {donationsRequests[donationId][donationField]}
                                        </TableCell>
                                        :
                                        <></>
                                    }
                                </React.Fragment>
                            ))}
                            <TableCell align='center'>
                                <Button
                                    variant='contained'
                                    color='secondary'
                                    style={{ marginRight: '1rem', marginTop: '.5rem' }}
                                    onClick={() => sendMessageToUser(donationsRequests[donationId].uid)}>
                                    Enviar mensaje
                                </Button>
                                <Button
                                    variant='contained'
                                    color='primary'
                                    style={{ marginRight: '1rem', marginTop: '.5rem' }}
                                    onClick={() => completeDonation(donationId)}>
                                    Realizada
                                </Button>
                                <Button
                                    variant='contained'
                                    style={{ marginTop: '.5rem' }}
                                    onClick={() => cancelDonation(donationsRequests[donationId].uid, donationId, donationsRequests[donationId].Qoins)}>
                                    Cancelar
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <ChooseDonationCurrencyDialog
                open={openDonationCurrencyDialog}
                closeDialog={() => setOpenDonationCurrencyDialog(false)}
                completeDonation={completeDonation}
                donationInfo={selectedDonation} />
        </TableContainer>
    );
}

export default DonationsRequests;
