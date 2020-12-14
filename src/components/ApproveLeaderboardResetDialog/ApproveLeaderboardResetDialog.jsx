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

import styles from './ApproveLeaderboardResetDialog.module.css';
import { resetLeaderboard } from '../../services/database';

const ApproveLeaderboardResetDialog = ({ open, onClose, users }) => {
    const [userFields, setUserFields] = useState([]);
    const hidedFields = ['__rowNum__', 'Uid'];

    useEffect(() => {
        users.some((user) => {
            setUserFields(Object.getOwnPropertyNames(user));

            return true;
        });
    }, [open]);

    const distributePrizes = async () => {
        const usersToAssignQoins = users
        // Filter users with no experience
        .filter((user) => { if(user.experience) return user; })
        // Create a valid object for the uploadEventResults function
        .map((user) => ({ uid: user.Uid, experience: user.experience, qoins: user.Qoins }));

        resetLeaderboard(usersToAssignQoins);

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
                    <Button autoFocus color='inherit' onClick={distributePrizes}>
                        Confirmar, resetear leaderboard y dar qoins
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
                        <TableRow key={user.Uid}>
                            {(user.experience) && userFields.map((userField) => (
                                <React.Fragment key={`${userField}-${user.Uid}`}>
                                    {hidedFields.indexOf(userField) === -1 &&
                                        <TableCell align='center'>{user[userField] || 'N/A'}</TableCell>
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

export default ApproveLeaderboardResetDialog;