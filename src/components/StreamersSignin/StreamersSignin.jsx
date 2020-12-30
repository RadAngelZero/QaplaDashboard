import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
    Grid,
    Button,
    Icon
} from '@material-ui/core';

import twitchIcon from './../../assets/twitchIcon.svg';
import styles from './StreamersSignin.module.css';
import RoomGame from './../../assets/room-game.png';
import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import { signInWithTwitch } from '../../services/auth';
import { streamerProfileExists, createStreamerProfile } from '../../services/database';
import { auth } from '../../services/firebase';

const StreamersSignin = () => {
    const [isLoadingAuth, setIsLoadingAuth] = useState(false);
    const history = useHistory();
    const { inviteCode } = useParams();

    const SignIn = async () => {
        setIsLoadingAuth(true);
        const user = await signInWithTwitch();
        if (!(await streamerProfileExists(user.firebaseAuthUser.user.uid))) {
            if (inviteCode) {
                await createStreamerProfile(user.firebaseAuthUser.user.uid, user.userData, inviteCode);
                history.push('/welcome');
            } else {
                const user = auth.currentUser;
                await user.delete();
                alert('Requieres un codigo de invitación para acceder');
            }
        } else {
            history.push('/profile');
        }
        setIsLoadingAuth(false);
    }

    const TwitchIcon = (
        <Icon>
          <img src={twitchIcon} height={22} width={22} />
        </Icon>
    );

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
                    Create your account
                </p>
                <div className={styles.formContainer}>
                    <Button variant='contained'
                        className={styles.continueButton}
                        startIcon={TwitchIcon}
                        onClick={SignIn}>
                        {!isLoadingAuth ?
                            'Sign up with Twitch'
                            :
                            'Loading...'
                        }
                    </Button>
                </div>
            </Grid>
            <Grid item md='3' />
        </StreamerDashboardContainer>
    );
}

export default StreamersSignin;