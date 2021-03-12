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
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { Helmet } from 'react-helmet';

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
    scriptParaBits
} from './services/database';
import { handleUserAuthentication } from './services/auth';

import './App.css';
import Login from './components/Login/Login';
import { auth } from './services/firebase';
import { connectUserToSendBird } from './services/SendBird';
import DonationsRequests from './components/DonationsRequests/DonationsRequests';
import DistributeExperience from './components/DistributeExperience/DistributeExperience';
import Leaderboard from './components/Leaderboard/Leaderboard';
import CreateInvitation from './components/CreateInvitation/CreateInvitation';
import NewEventsList from './components/NewEventsList/NewEventsList';
import ApproveEventForm from './components/ApproveEventForm/ApproveEventForm';
import LeaderboardPrizes from './components/LeaderboardPrizes/LeaderboardPrizes';
import LeaderboardWinners from './components/LeaderboardWinners/LeaderboardWinners';
import QaplaStreamers from './components/QaplaStreamers/QaplaStreamers';

const Router = () => {
    const [events, setEvents] = useState();
    const [games, setGames] = useState({});
    const [platforms, setPlatforms] = useState({});
    const [user, setUser] = useState(null);
    const [menuTemplate, setMenuTemplate] = useState(null);
    const [menuLeaderboard, setMenuLeaderboard] = useState(null);
    const [menuStreamers, setMenuStreamers] = useState(null);
    const [eventToApprove, setEventToApprove] = useState({});

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
            }, () => {
                setUser(undefined);
                connectUserToSendBird('Admin');
            });
        }

        // scriptParaBits();

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

    const closeMenuTemplate = () => {
        setMenuTemplate(null);
    }

    const closeMenuLeaderboard = () => {
        setMenuLeaderboard(null);
    }

    const closeMenuStreamers = () => {
        setMenuStreamers(null);
    }

    const eventsLoaded = events ? events : {};

    return (
        <RouterPackage>
            <Switch>
                {!user ?
                    <Route exact path='/'>
                        <Login user={user} />
                    </Route>
                    :
                    <>
                        {user.admin &&
                        <>
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
                                                    onClick={(e) => setMenuTemplate(e.currentTarget)} >
                                                    Plantillas
                                                </Button>
                                                <Menu
                                                    anchorEl={menuTemplate}
                                                    open={Boolean(menuTemplate)}
                                                    onClose={closeMenuTemplate}>
                                                    <Link to='/user/templates/create' className='White-Color Margin-Right'>
                                                        <MenuItem style={{ color: '#000' }} onClick={closeMenuTemplate}>Crear</MenuItem>
                                                    </Link>
                                                    <Link to='/user/templates/edit' className='White-Color Margin-Right'>
                                                        <MenuItem style={{ color: '#000' }} onClick={closeMenuTemplate}>Editar</MenuItem>
                                                    </Link>
                                                </Menu>
                                            </>
                                                <Link to='/donations' className='White-Color Margin-Right'>
                                                    <Button
                                                        className='White-Color Margin-Right'
                                                        color='inherit'
                                                        style={{ color: '#FFF' }}>
                                                        Donaciones
                                                    </Button>
                                                </Link>
                                                <Button
                                                    color='inherit'
                                                    style={{ color: '#FFF' }}
                                                    className='White-Color Margin-Right'
                                                    onClick={(e) => setMenuLeaderboard(e.currentTarget)} >
                                                    Leaderboard
                                                </Button>
                                                <Menu
                                                    anchorEl={menuLeaderboard}
                                                    open={Boolean(menuLeaderboard)}
                                                    onClose={closeMenuLeaderboard}>
                                                    <Link to='/leaderboard' className='White-Color Margin-Right'>
                                                        <MenuItem style={{ color: '#000' }} onClick={closeMenuLeaderboard}>Reiniciar</MenuItem>
                                                    </Link>
                                                    <Link to='/prizes' className='White-Color Margin-Right'>
                                                        <MenuItem style={{ color: '#000' }} onClick={closeMenuLeaderboard}>Premios</MenuItem>
                                                    </Link>
                                                    <Link to='/winners/leaderboard' className='White-Color Margin-Right'>
                                                        <MenuItem style={{ color: '#000' }} onClick={closeMenuLeaderboard}>Numero de ganadores</MenuItem>
                                                    </Link>
                                                </Menu>
                                                <Button
                                                    color='inherit'
                                                    style={{ color: '#FFF' }}
                                                    className='White-Color Margin-Right'
                                                    onClick={(e) => setMenuStreamers(e.currentTarget)} >
                                                    Streamers
                                                </Button>
                                                <Menu
                                                    anchorEl={menuStreamers}
                                                    open={Boolean(menuStreamers)}
                                                    onClose={closeMenuStreamers}>
                                                    <Link to='/create/invitation' className='White-Color Margin-Right'>
                                                        <MenuItem style={{ color: '#000' }} onClick={closeMenuStreamers}>Crear codigo para nuevo streamer</MenuItem>
                                                    </Link>
                                                    <Link to='/streamers' className='White-Color Margin-Right'>
                                                        <MenuItem style={{ color: '#000' }} onClick={closeMenuStreamers}>Gestionar Streamers</MenuItem>
                                                    </Link>
                                                    <Link to='/new/events' className='White-Color Margin-Right'>
                                                        <MenuItem style={{ color: '#000' }} onClick={closeMenuStreamers}>Gestionar Eventos</MenuItem>
                                                    </Link>
                                                </Menu>
                                            <Button
                                                color='inherit'
                                                style={{ color: '#FFF' }}
                                                className='White-Color Margin-Right'
                                                onClick={() => auth.signOut()}>
                                                Cerrar sesión
                                            </Button>
                                        </>
                                    }
                                    <Link to='/event/create' className='White-Color Margin-Right'>
                                        <Button
                                            className='White-Color Margin-Right'
                                            variant='contained'
                                            color='secondary'
                                            style={{ color: '#FFF' }}>
                                            Crear evento
                                        </Button>
                                    </Link>
                                </Toolbar>
                            </AppBar>
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
                                <Route exact path='/create/invitation'>
                                    <CreateInvitation user={user} />
                                </Route>
                                <Route exact path='/new/events'>
                                    <NewEventsList
                                        user={user}
                                        setEventToApprove={setEventToApprove}
                                        games={games} />
                                </Route>
                                <Route exact path='/new/event/:eventId'>
                                    <ApproveEventForm
                                        event={eventToApprove}
                                        user={user}
                                        games={games}
                                        platforms={platforms} />
                                </Route>
                                <Route exact path='/streamers'>
                                    <QaplaStreamers />
                                </Route>
                                <Route exact path='/login'>
                                    <Login user={user} />
                                </Route>
                                <Route exact path='/leaderboard'>
                                    <Leaderboard user={user} />
                                </Route>
                                <Route exact path='/prizes'>
                                    <LeaderboardPrizes user={user} />
                                </Route>
                                <Route exact path='/winners/leaderboard'>
                                    <LeaderboardWinners user={user} />
                                </Route>
                        </>
                    }
                    </>
                }
            </Switch>
        </RouterPackage>
    );
}

export default Router;
