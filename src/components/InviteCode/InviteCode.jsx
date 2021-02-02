import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
    Grid,
    Button,
    makeStyles,
    InputBase
} from '@material-ui/core';

import styles from './InviteCode.module.css';
import RoomGame from './../../assets/room-game.png';
import { invitationCodeExists } from '../../services/database';
import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import { auth } from '../../services/firebase'

const useStyles = makeStyles((theme) => ({
    margin: {
      paddingLeft: theme.spacing(2),
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1)
    }
}));

const InviteCode = ({user}) => {
    const history = useHistory();

    const [invitationCode, setInvitationCode] = useState('');
    const classes = useStyles();

    useEffect(() => {
        if(auth.currentUser != null) {
            history.push('/profile');
        }
    })

    const continueToSignUp = async (e) => {
        e.preventDefault();
        if (await invitationCodeExists(invitationCode)) {
            return history.push(`/signin/${invitationCode}`)
        }

        return console.log('No Continue');
    }

    return (
        <StreamerDashboardContainer>
            <Grid item md='4' style={{
                    backgroundImage: `url(${RoomGame})`,
                    backgroundRepeat: 'no-repeat',
                    height: '100vh'
                }}>
            </Grid>
            <Grid item md='1' />
            <Grid item md='4'>
                <p className={styles.getStarted}>
                    Get started, it’s free!
                </p>
                <div className={styles.formContainer}>
                    <p className={styles.instruction}>
                        Enter your invitation code to continue to sign up
                    </p>
                    <form onSubmit={continueToSignUp}>
                        <InputBase
                            variant='outlined'
                            label='Invite Code'
                            className={[classes.margin, styles.inviteCodeInput]}
                            fullWidth
                            placeholder='Invite Code'
                            value={invitationCode}
                            onChange={(e) => setInvitationCode(e.target.value)}
                            onSubmit={() => continueToSignUp} />
                        <Button variant='contained'
                            className={styles.continueButton}
                            type='submit'>
                            Continue
                        </Button>
                    </form>
                </div>
            </Grid>
            <Grid item md='3' />
        </StreamerDashboardContainer>
    );
}

export default InviteCode;