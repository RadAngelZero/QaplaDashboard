import React, { useEffect, useState } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

import { loadUsersDonations, completeUserDonation } from '../../services/database';

const hidedFields = ['uid', 'completed'];

const DonationsRequests = ({ user }) => {
    const [donationsRequests, setDonationsRequests] = useState({});
    const [donationFields, setDonationFields] = useState([]);

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
                                    onClick={() => completeUserDonation(donationId)}>
                                    Realizada
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default DonationsRequests;
