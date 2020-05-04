import React, { useState, useEffect } from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import './App.css';

import EventsList from './components/EventsList/EventsList';
import EventDetails from './components/EventDetails/EventDetails';
import CreateEvent from './components/CreateEvent/CreateEvent';

import { loadEventsOrderByDate, loadQaplaGames, loadQaplaPlatforms } from './services/database';
import AssignPrizesForEvent from './components/AssignPrizesForEvent/AssignPrizesForEvent';

function App() {
    const [events, setEvents] = useState();
    const [games, setGames] = useState({});
    const [platforms, setPlatforms] = useState({});

    useEffect(() => {

        /**
         * Load and save all the events on the state
         */
        async function loadEventsData() {
            const eventsData = await loadEventsOrderByDate();
            let eventObject = {};
            eventsData.forEach((event) => {
                eventObject[event.key] = event.val();
            });

            setEvents(eventObject);
        }

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

        loadEventsData();
        loadGamesResources();
        loadPlatformsResources();
    }, []);

    const eventsLoaded = events ? events : {};

    return (
        <Router>
            <AppBar position='static'>
                <Toolbar>
                    <Typography variant='h6' className='Nav-Title'>
                        Qapla Dashboard
                    </Typography>
                    <Link to='/event/create' className='white'>
                        <Button color='inherit'>Crear evento</Button>
                    </Link>
                </Toolbar>
            </AppBar>
            <Switch>
                <Route exact path='/'>
                    <EventsList events={eventsLoaded} />
                </Route>
                <Route exact path='/event/prizes/:eventId'>
                    <AssignPrizesForEvent />
                </Route>
                <Route exact path='/event/details/:eventId'>
                    <EventDetails
                        events={eventsLoaded}
                        games={games}
                        platforms={platforms} />
                </Route>
                <Route exact path='/event/create'>
                    <CreateEvent
                        games={games}
                        platforms={platforms} />
                </Route>
            </Switch>
        </Router>
    );
}

export default App;
