import React from 'react';
import { Grid,
    Card,
    CardContent,
    Button
} from '@material-ui/core';
import ReactPlayer from 'react-player';
import { useHistory } from 'react-router-dom';

import styles from './StreamerOnBoarding.module.css';
import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';

const StreamerOnBoarding = ({ user }) => {
    const history = useHistory();
    const url = 'https://firebasestorage.googleapis.com/v0/b/qapplaapp.appspot.com/o/DashboardVideos%2Fvideo-1607554980.mp4?alt=media&token=d4377b6c-466f-4cc3-bbb7-9a578913c55c';

    const Continue = () => {
        history.push('/profile');
    }

    return (
        <StreamerDashboardContainer user={user}>
            <Grid container justify='center' alignContent='center' className={styles.container}>
                <Grid item xs={12}>
                    <p className={styles.welcome}>
                        Welcome!
                    </p>
                </Grid>
                <Grid item xs={4} />
                <Grid item xs={4}>
                    <Card className={styles.card}>
                        <CardContent>
                            <div className={styles.playerWrapper}>
                                <ReactPlayer
                                    url={url}
                                    width='100%'
                                    height='100%'
                                    controls={true}
                                    className={styles.player} />
                            </div>
                            <div style={{ marginLeft: 18, marginRight: 18 }}>
                                <p style={{
                                    fontSize: '18px',
                                    color: '#FFFFFF',
                                    lineHeight: '24px'
                                }}>
                                    Let’s start with the basics
                                </p>
                                <p style={{
                                    fontSize: '14px',
                                    color: '#B2B3BD',
                                    lineHeight: '24px'
                                }}>
                                    We are thrilled to have you onboard! Watch this short video with the basics to jumpstart your
                                    streaming career with Qapla Gaming. It won’t take more than 3 minutes.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={4} />
                <Button variant='outlined'
                    className={styles.continueButton}
                    onClick={Continue}>
                    Continue
                </Button>
            </Grid>
        </StreamerDashboardContainer>
    );
}

export default StreamerOnBoarding;