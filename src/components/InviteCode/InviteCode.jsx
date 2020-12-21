import React, { useState } from 'react';
import {
    Grid,
    AppBar,
    Toolbar,
    Button,
    Link,
    makeStyles,
    InputBase
} from '@material-ui/core';

import styles from './InviteCode.module.css';
import RoomGame from './../../assets/room-game.png';
import { invitationCodeExists } from '../../services/database';

const useStyles = makeStyles((theme) => ({
    margin: {
      paddingLeft: theme.spacing(2),
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1)
    }
}));

const InviteCode = () => {
    const [invitationCode, setInvitationCode] = useState('');
    const classes = useStyles();

    const continueToSignUp = async () => {
        if (await invitationCodeExists(invitationCode)) {
            return console.log('Continue');
        }

        return console.log('No Continue');
    }

    return (
        <Grid container className={styles.container} alignItems='center' justify='center'>
            <AppBar className={styles.appBar}>
                <Toolbar>
                    <div style={{ flexGrow: 1 }}></div>
                    <p className={styles.alreadyAUser}>
                        Already a user?
                    </p>
                    <Link to='/' className={`Margin-Right ${styles.buttonContainer}`}>
                        <Button
                            variant='outlined'
                            color='#5F75EE'
                            className={styles.button}>
                            Sign in
                        </Button>
                    </Link>
                </Toolbar>
            </AppBar>
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
                    <InputBase
                        variant='outlined'
                        label='Invite Code'
                        className={[classes.margin, styles.inviteCodeInput]}
                        fullWidth
                        placeholder='Invite Code'
                        value={invitationCode}
                        onChange={(e) => setInvitationCode(e.target.value)} />
                    <Button variant='contained'
                        className={styles.continueButton}
                        onClick={continueToSignUp}>
                        Continue
                    </Button>
                </div>
            </Grid>
            <Grid item md='3' />
        </Grid>
    );
}

export default InviteCode;