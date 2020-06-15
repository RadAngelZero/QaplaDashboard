import React, { useEffect, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import styles from './ApproveQoinsDistributionDialog.module.css';
import { uploadEventResults } from '../../services/database';

const ApproveQoinsDistributionDialog = ({ open, onClose, users, eventId }) => {
    const [userFields, setUserFields] = useState([]);
    const hidedFields = ['__rowNum__', 'Qapla ID'];

    useEffect(() => {
        users.some((user) => {
            setUserFields(Object.getOwnPropertyNames(user));

            return true;
        });
    }, [open]);

    const distributeQoins = async () => {
        const usersToAssignQoins = users
        // Filter users with no Place
        .filter((user) => user.Place)
        // Create a valid object for the uploadEventResults function
        .map((user) => ({ uid: user['Qapla ID'], place: user.Place }));

        await uploadEventResults(eventId, usersToAssignQoins);

        onClose();
    }

    return (
        <Dialog fullScreen open={open} onClose={onClose}>
            <AppBar style={{ position: 'relative' }}>
                <Toolbar>
                    <IconButton edge='start' color='inherit' onClick={onClose} aria-label='close'>
                        <CloseIcon />
                    </IconButton>
                    <Typography variant='h6' className={styles.headerBarTitle}>
                        Resultados
                    </Typography>
                    <Button autoFocus color='inherit' onClick={distributeQoins}>
                        Confirmar y dar Qoins
                    </Button>
                </Toolbar>
            </AppBar>
            <TableContainer component={Paper}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {userFields.map((field) => (
                                <React.Fragment key={field}>
                                    {hidedFields.indexOf(field) === -1 &&
                                        <TableCell align='center'>{field}</TableCell>
                                    }
                                </React.Fragment>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {users.map((user) => (
                        <TableRow key={user['Qapla ID']}>
                            {user.Place && userFields.map((userField) => (
                                <React.Fragment key={`${userField}-${user['Qapla ID']}`}>
                                    {hidedFields.indexOf(userField) === -1 &&
                                        <TableCell align='center'>{user[userField]}</TableCell>
                                    }
                                </React.Fragment>
                            ))}
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Dialog>
    );
}

export default ApproveQoinsDistributionDialog;
