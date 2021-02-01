import React from 'react';
import {
    makeStyles,
    Container,
    Box,
    Card,
    Grid,
    CardContent,
    Button
} from '@material-ui/core';
import { useHistory } from 'react-router-dom';

import RocketImage from './../../assets/RocketImage.png';

const useStyles = makeStyles({
    box: {
        height: '100vh'
    },
    title: {
        fontSize: '40px',
        color: '#FFFFFF',
        letterSpacing: '-1px'
    },
    card: {
        borderRadius: 32,
        overflow: 'hidden',
        marginTop: '3.25rem'
    },
    cardContent: {
        backgroundColor: '#141833',
        padding: '1rem 2rem 1rem 2rem'
    },
    cardTitle: {
        fontSize: '18px',
        color: '#FFFFFF'
    },
    cardBody: {
        fontSize: '14px',
        color: '#B2B3BD'
    },
    button: {
        background: '#8B46FF !important',
        borderRadius: '1rem',
        fontWeight: 'bold',
        padding: '.75rem 2rem .75rem 2rem',
        color: '#FFF',
        fontSize: '14px',
        marginTop: '2rem'
    }
});

const EventSent = () => {
    const classes = useStyles();
    const history = useHistory();

    return (
        <Container>
            <Box className={classes.box} flexDirection='column' display='flex' justifyContent='center' alignItems='center'>
                <h1 className={classes.title}>
                    Awesome!
                </h1>
                <Grid container>
                    <Grid item xs={4} />
                    <Grid item xs={4}>
                        <Card className={classes.card}>
                            <div style={{ overflow: 'hidden', backgroundColor: '#141833' }}>
                                <img
                                    src={RocketImage}
                                    height='160'
                                    style={{
                                        width: '100%',
                                        borderRadius: 16,
                                        objectFit: 'cover',
                                        backgroundSize: 'cover',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'center'
                                    }} />
                            </div>
                            <CardContent className={classes.cardContent}>
                                <p className={classes.cardTitle}>
                                    Your post has been sent :D
                                </p>
                                <p className={classes.cardBody}>
                                    We got you! When your post gets approved it will be available on the
                                    app. We’ll let you know when it happens ;). It can take up to 12 hrs to be
                                    on the app, but usually it only takes a couple of hours.
                                    We appreciate your patience.
                                </p>
                                <Box display='flex'
                                    justifyContent='center'>
                                    <Button variant='contained'
                                        className={classes.button}
                                        onClick={(e) => {history.push('/profile');}} >
                                        Understood
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
}

export default EventSent;