import React, { useState } from 'react';
import { Avatar, Grid, Button, Card, Menu, MenuItem, CardContent, Box, IconButton, CardMedia } from '@material-ui/core';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';

import styles from './StreamerProfile.module.css';
import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import { ReactComponent as TwitchIcon } from './../../assets/twitchIcon.svg';
import { ReactComponent as Arrow } from './../../assets/Arrow.svg';
import { ReactComponent as AddIcon } from './../../assets/AddIcon.svg';
import { ReactComponent as CalendarIcon } from './../../assets/CalendarIcon.svg';
import { ReactComponent as OptionsIcon } from './../../assets/OptionsIcon.svg';

const StyledMenu = withStyles({
    paper: {
      backgroundColor: '#141833'
    },
  })((props) => (
    <Menu
      {...props}
    />
));

const useStyles = makeStyles({
    endIcon: {
      position: 'absolute',
      right: '1.5rem'
    },
  });

const StreamerProfile = ({ user }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const classes = useStyles();
    const history = useHistory();

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
      };

      const handleClose = () => {
        setAnchorEl(null);
      };

    const createStream = () => history.push('/create');

    return (
        <StreamerDashboardContainer user={user}>
            <div className={styles.avatarContainer}>
                <Avatar
                    alt='User image'
                    src={user.photoUrl} />
                <span className={styles.streamerName}>{user.displayName}</span>
            </div>
            <Grid container>
                <Grid item xs={12}>
                    <Button variant='contained'
                        className={styles.twitchButton}
                        startIcon={<TwitchIcon />}>
                        {user.displayName} 23.5K
                    </Button>
                </Grid>
                <Grid item xs={12}>
                    <Grid container>
                        <Grid item xs={3}>
                            <h1 className={styles.title}>My events</h1>
                        </Grid>
                        <Grid item xs={9} style={{ marginTop: '6rem' }}>
                            <Button className={styles.filter}
                                classes={{
                                    endIcon: classes.endIcon
                                }}
                                endIcon={<Arrow />}
                                onClick={handleClick}>
                                Scheduled
                            </Button>
                            <StyledMenu
                                anchorEl={anchorEl}
                                keepMounted
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                                >
                                <MenuItem onClick={handleClose}>Algo</MenuItem>
                                <MenuItem onClick={handleClose}>Algo1</MenuItem>
                                <MenuItem onClick={handleClose}>Algo2</MenuItem>
                            </StyledMenu>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Grid container spacing={4}>
                        <Grid item md={3}>
                            <Card className={styles.createEventCard}>
                                <h1 className={styles.newStream}>
                                    New <br/> Stream
                                </h1>
                                <CardContent>
                                    <Box display='flex' justifyContent='center'>
                                        <IconButton
                                            onClick={createStream}
                                            className={styles.createButton}>
                                            <AddIcon />
                                        </IconButton>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item md={3}>
                            <Card className={styles.eventCard}>
                                <div style={{ overflow: 'hidden' }}>
                                    <img
                                        src='https://rocketleague.media.zestyio.com/rl_platform_keyart_2019.f1cb27a519bdb5b6ed34049a5b86e317.jpg'
                                        height='160'
                                        style={{
                                            objectFit: 'cover',
                                            backgroundSize: 'cover',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'center'
                                        }} />
                                </div>
                                <CardContent className={styles.eventCardContent}>
                                    <p className={styles.eventCardTitle}>
                                        Rocket Champions League
                                    </p>
                                    <div className={styles.rowContainer}>
                                        <div className={styles.circle} />
                                        <p className={styles.participantsNumber}>
                                            50 Participants
                                        </p>
                                    </div>
                                    <div className={styles.dateContainer}>
                                        <div className={styles.rowContainer}>
                                            <CalendarIcon />
                                            <p className={styles.date}>
                                                11 Ene 2021
                                            </p>
                                        </div>
                                        <OptionsIcon />
                                    </div>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </StreamerDashboardContainer>
    );
}

export default StreamerProfile;