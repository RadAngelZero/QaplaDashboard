import React from 'react';
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
import { distributeQoinsToMultipleUsers } from '../../services/database';

const ApproveQoinsDistributionDialog = ({ open, onClose, users }) => {
    const distributeQoins = () => {
        const usersToAssignQoins = users
        // Filter users with no qoins (or negative qoins)
        .filter((user) => user.Qoins && user.Qoins > 0)
        // Create a valid object for the distributeQoinsToMultipleUsers function
        .map((user) => ({ uid: user.Uid, qoins: user.Qoins }));

        distributeQoinsToMultipleUsers(usersToAssignQoins);

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
                        <TableCell align='center'>User id</TableCell>
                        <TableCell align='center'>GamerTag</TableCell>
                        <TableCell align='center'>UserName</TableCell>
                        <TableCell align='center'>Qoins Ganados</TableCell>
                        <TableCell align='center'>Email</TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.Uid}>
                            <TableCell align='center'>{user.Uid}</TableCell>
                            <TableCell align='center'>{user.GamerTag}</TableCell>
                            <TableCell align='center'>{user.UserName}</TableCell>
                            <TableCell align='center'>
                                <Typography>
                                    {user.Qoins}
                                </Typography>
                            </TableCell>
                            <TableCell align='center'>{user.Email}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Dialog>
    );
}

export default ApproveQoinsDistributionDialog;
