import React, { useState, useEffect } from 'react';
import {
    BrowserRouter as RouterPackage,
    Switch,
    Route,
    Link,
    Redirect
} from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

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
import { connectUserToSendBird } from './services/SendBird';
import DonationsRequests from './components/DonationsRequests/DonationsRequests';
import DistributeExperience from './components/DistributeExperience/DistributeExperience';

const Router = () => {
    const [events, setEvents] = useState();
    const [games, setGames] = useState({});
    const [platforms, setPlatforms] = useState({});
    const [user, setUser] = useState(null);
    const [menu, setMenu] = useState(null);

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

        function checkIfUserIsAuthenticated() {
            handleUserAuthentication((user) => {
                loadUserAdminProfile(user.uid, (userData) => {
                    setUser({ ...userData, admin: true, uid: user.uid });
                    connectUserToSendBird(user.uid);
                });
                loadUserClientProfile(user.uid, (userData) => {
                    setUser({ ...userData, admin: false, uid: user.uid });
                    connectUserToSendBird(user.uid);
                });
            }, () => {
                setUser(undefined);
                connectUserToSendBird('Admin');
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

    const closeMenu = () => {
        setMenu(null);
    }

    const eventsLoaded = events ? events : {};

    return (
        <>
            {user !== null &&
            <>
                {user ?
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
                                        <>
                                            <Button
                                                color='inherit'
                                                style={{ color: '#FFF' }}
                                                className='White-Color Margin-Right'
                                                onClick={(e) => setMenu(e.currentTarget)} >
                                                Plantillas
                                            </Button>
                                            <Menu
                                                anchorEl={menu}
                                                open={Boolean(menu)}
                                                onClose={closeMenu}>
                                                <Link to='/user/templates/create' className='White-Color Margin-Right'>
                                                    <MenuItem style={{ color: '#000' }} onClick={closeMenu}>Crear</MenuItem>
                                                </Link>
                                                <Link to='/user/templates/edit' className='White-Color Margin-Right'>
                                                    <MenuItem style={{ color: '#000' }} onClick={closeMenu}>Editar</MenuItem>
                                                </Link>
                                            </Menu>
                                        </>
                                        {user.admin &&
                                            <Link to='/donations' className='White-Color Margin-Right'>
                                                <Button
                                                    color='inherit'
                                                    style={{ color: '#FFF' }}>
                                                    Donaciones
                                                </Button>
                                            </Link>
                                        }
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
                            {user.admin ?
                                <>
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
                                    <Route exact path='/user/templates/edit'>
                                        <CreateEvent
                                            games={games}
                                            platforms={platforms}
                                            editTemplate
                                            user={user} />
                                    </Route>
                                    <Route exact path='/event/duplicate/:eventId'>
                                        <EventDetails
                                            events={eventsLoaded}
                                            games={games}
                                            platforms={platforms}
                                            eventDuplicated />
                                    </Route>
                                    <Route exact path='/donations'>
                                        <DonationsRequests user={user} />
                                    </Route>
                                    <Route exact path='/event/experience/:eventId'>
                                        <DistributeExperience user={user} />
                                    </Route>
                                    <Route exact path='/login'>
                                        <Login user={user} />
                                    </Route>
                                </>
                                :
                                <>
                                    <Route exact path='/'>
                                        <h1>No eres admin</h1>
                                    </Route>
                                    <Redirect from='*' to='/' />
                                </>
                            }
                        </Switch>
                    </RouterPackage>
                :
                    <RouterPackage>
                        <Switch>
                            <Route exact path='/admin/login'>
                                <Login user={user} />
                            </Route>
                            <Route exact path='/'>
                                <h1>No admin</h1>
                            </Route>
                            <Redirect from='*' to='/' />
                        </Switch>
                    </RouterPackage>
                }
            </>
        }
        </>
    );
}

export default Router;
