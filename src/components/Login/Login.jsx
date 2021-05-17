import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import styles from './Login.module.css';
import { ReactComponent as FacebookIcon } from './../../assets/facebook_round.svg';
import { ReactComponent as GoogleIcon } from './../../assets/google-logo.svg';
import { signInWithFacebook, signInWithGoogle, signInWithTwitch } from '../../services/auth';

const Login = ({ user }) => {
    const history = useHistory();

    useEffect(() => {
        if (user) {
            history.push('/');
        }
    }, [user]);

    const authWithFacebook = async () => {
        try {
            await signInWithFacebook();
        } catch (error) {
            console.error(error);
        }
    }

    const authWithGoogle = async () => {
        try {
            const user = await signInWithGoogle();
            history.push('/');
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Container maxWidth='lg'>
            {!user &&
                <Grid container
                    justify='center'
                    alignContent='center'
                    alignItems='center'>
                    <Typography variant='h2'>
                        Bienvenido de nuevo
                    </Typography>
                    <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                        <Button
                            variant='contained'
                            startIcon={<FacebookIcon />}
                            className={[styles.SocialMediaSignInButton, styles.FacebookSignInButton]}
                            onClick={authWithFacebook}>
                            Inicia sesion con Facebook
                        </Button>
                    </Grid>
                    <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                        <Button
                            variant='contained'
                            style={{ backgroundColor: '#FFF' }}
                            startIcon={<GoogleIcon />}
                            className={[styles.SocialMediaSignInButton, styles.GoogleSignInButton]}
                            onClick={authWithGoogle}>
                            Inicia sesion con Google
                        </Button>
                    </Grid>
                    <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                        <Button
                            variant='contained'
                            style={{ backgroundColor: '#EEDD77' }}
                            startIcon={<GoogleIcon />}
                            className={[styles.SocialMediaSignInButton, styles.GoogleSignInButton]}
                            onClick={signInWithTwitch}>
                            Inicia sesion con Twitch
                        </Button>
                    </Grid>
                </Grid>
            }
        </Container>
    );
}

export default Login;
