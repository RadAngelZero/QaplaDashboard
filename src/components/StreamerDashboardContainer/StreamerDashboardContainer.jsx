import React from 'react';
import {
    Grid,
    AppBar,
    Toolbar,
    Link,
    Button
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';

import styles from './StreamerDashboardContainer.module.css';
import StreamerSideBar from '../StreamerSideBar/StreamerSideBar';

const useStyles = makeStyles((theme) => ({
    content: {
        flexGrow: 1,
        paddingLeft: theme.spacing(4) + 1,
        paddingTop: theme.spacing(4) + 1,
    }
}));

const StreamerDashboardContainer = ({ children, user }) => {
    const history = useHistory();
    const classes = useStyles();

    return (
        <Grid container className={styles.container} alignItems={user ? 'flex-start' : 'center'} justify={user ? 'flex-start' : 'center'}>
            {!user ?
                <>
                    <AppBar className={styles.appBar}>
                        <Toolbar>
                            <div style={{ flexGrow: 1 }}></div>
                            <p className={styles.alreadyAUser}>
                                Already a user?
                            </p>
                            <Link to='/' className={`Margin-Right ${styles.buttonContainer}`}>
                                <Button variant='outlined'
                                    color='#5F75EE'
                                    className={styles.button}
                                    onClick={() => history.push('/signin')}>
                                    Sign in
                                </Button>
                            </Link>
                        </Toolbar>
                    </AppBar>
                    {children}
                </>
                :
                <>
                    {history.location.pathname !== '/welcome' &&
                        <StreamerSideBar />
                    }
                    <div className={classes.content}>
                        {children}
                    </div>
                </>
            }
        </Grid>
    );
}

export default StreamerDashboardContainer;
