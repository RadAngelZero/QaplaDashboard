import React from 'react';
import {
    Grid,
    AppBar,
    Toolbar,
    Link,
    Button
} from '@material-ui/core';
import { useHistory } from 'react-router-dom';

import styles from './StreamerDashboardContainer.module.css';

const StreamerDashboardContainer = ({ children, user }) => {
    const history = useHistory();

    return (
        <Grid container className={styles.container} alignItems='center' justify='center'>
            {!user &&
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
            }
            {children}
        </Grid>
    );
}

export default StreamerDashboardContainer;
