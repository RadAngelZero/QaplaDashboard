import React, { useState, useEffect } from 'react';
import {
    BrowserRouter as RouterPackage,
    Switch,
    Route,
    Link
} from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import EventsList from './components/EventsList/EventsList';
import EventDetails from './components/EventDetails/EventDetails';
import CreateEvent from './components/CreateEvent/CreateEvent';
import AssignPrizesForEvent from './components/AssignPrizesForEvent/AssignPrizesForEvent';
import JoinToEventRequest from './components/JoinToEventRequest/JoinToEventRequest';
import EventParticipantsList from './components/EventParticipantsList/EventParticipantsList';

import {
    loadEventsOrderByDate,
    loadQaplaGames,
    loadQaplaPlatforms,
    loadUserAdminProfile,
    loadUserClientProfile
} from './services/database';
import { handleUserAuthentication } from './services/auth';

import './App.css';
import Login from './components/Login/Login';
import { auth } from './services/firebase';

const Router = () => {
    const [events, setEvents] = useState();
    const [games, setGames] = useState({});
    const [platforms, setPlatforms] = useState({});
    const [user, setUser] = useState(null);

    useEffect(() => {

        /**
         * Load and save all the games on the state
         */
        async function loadGamesResources() {
            setGames(await loadQaplaGames());
        }

        /**
         * Load and save all the platforms on the state
         */
        async function loadPlatformsResources() {
            setPlatforms(await loadQaplaPlatforms());
        }

        async function checkIfUserIsAuthenticated() {
            handleUserAuthentication((user) => {
                loadUserAdminProfile(user.uid, (userData) => {
                    setUser({ ...userData, admin: true, uid: user.uid });
                });
                loadUserClientProfile(user.uid, (userData) => {
                    setUser({ ...userData, admin: false, uid: user.uid });
                });
            }, () => {
                setUser(undefined);
            });
        }

        loadEventsOrderByDate(loadEventsData);
        loadGamesResources();
        loadPlatformsResources();
        checkIfUserIsAuthenticated();
    }, []);

    /**
     * Load and save all the events on the state
     */
    const loadEventsData = (eventsData) => {
        if (eventsData.exists()) {
            setEvents(eventsData.val());
        }
    }

    const eventsLoaded = events ? events : {};

    return (
        <RouterPackage>
            <AppBar position='static'>
                <Toolbar>
                    <Link to='/' className='Nav-Title White-Color'>
                        <Typography variant='h6' style={{ color: '#FFF' }} >
                            Qapla Dashboard
                        </Typography>
                    </Link>
                    {user === undefined &&
                        <Link to='/login' className='White-Color'>
                            <Button
                                color='inherit'
                                style={{ color: '#FFF' }}>
                                Login
                            </Button>
                        </Link>
                    }
                    {user &&
                        <>
                            <Link to='/user/templates/create' className='White-Color Margin-Right'>
                                <Button
                                    color='inherit'
                                    style={{ color: '#FFF' }}>
                                    Plantillas
                                </Button>
                            </Link>
                            <Button
                                color='inherit'
                                style={{ color: '#FFF' }}
                                onClick={() => auth.signOut()}>
                                Cerrar sesión
                            </Button>
                        </>
                    }
                    <Link to='/event/create' className='White-Color Margin-Right'>
                        <Button
                            variant='contained'
                            color='secondary'
                            style={{ color: '#FFF' }}>
                            Crear evento
                        </Button>
                    </Link>
                </Toolbar>
            </AppBar>
            <Switch>
                <Route exact path='/'>
                    <EventsList events={eventsLoaded} />
                </Route>
                <Route exact path='/event/prizes/:eventId'>
                    <AssignPrizesForEvent events={eventsLoaded} />
                </Route>
                <Route exact path='/event/details/:eventId'>
                    <EventDetails
                        events={eventsLoaded}
                        games={games}
                        platforms={platforms} />
                </Route>
                <Route exact path='/event/requests/:eventId'>
                    <JoinToEventRequest events={eventsLoaded} />
                </Route>
                <Route exact path='/event/participants/:eventId'>
                    <EventParticipantsList events={eventsLoaded} />
                </Route>
                <Route exact path='/event/create'>
                    <CreateEvent
                        games={games}
                        platforms={platforms}
                        user={user} />
                </Route>
                <Route exact path='/user/templates/create'>
                    <CreateEvent
                        games={games}
                        platforms={platforms}
                        template
                        user={user} />
                </Route>
                <Route exact path='/event/duplicate/:eventId'>
                    <EventDetails
                        events={eventsLoaded}
                        games={games}
                        platforms={platforms}
                        eventDuplicated />
                </Route>
                <Route exact path='/login'>
                    <Login user={user} />
                </Route>
            </Switch>
        </RouterPackage>
    );
}

export default Router;
