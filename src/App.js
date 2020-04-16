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

import EventsList from './components/EventsList/EventsList';
import EventDetails from './components/EventDetails/EventDetails';
import CreateEvent from './components/CreateEvent/CreateEvent';

import { loadEventsOrderByDate, loadQaplaGames } from './services/database';

function App() {
    const [events, setEvents] = useState();
    const [games, setGames] = useState({});

    useEffect(() => {
        async function loadEventsData() {
            const eventsData = await loadEventsOrderByDate();
            let eventObject = {};
            eventsData.forEach((event) => {
                eventObject[event.key] = event.val();
            });

            console.log(eventObject);
            setEvents(eventObject);
        }

        async function loadGamesResources() {
            setGames(await loadQaplaGames());
        }

        loadEventsData();
        loadGamesResources();
    }, []);

    return (
        <Router>
            <AppBar position='static'>
                <Toolbar>
                    <Typography variant='h6' style={{ flexGrow: 1 }}>
                        Qapla Dashboard
                    </Typography>
                    <Link to='/event/create' style={{ color: '#FFF' }}>
                        <Button color='inherit'>Crear evento</Button>
                    </Link>
                </Toolbar>
            </AppBar>
                <Switch>
                    <Route exact path='/'>
                        <EventsList events={events ? events : {}} />
                    </Route>
                    <Route exact path='/event/details/:eventId'>
                        <EventDetails
                            events={events ? events : {}}
                            games={games} />
                    </Route>
                    <Route exact path='/event/create'>
                        <CreateEvent
                            events={events ? events : {}}
                            games={games} />
                    </Route>
                </Switch>
        </Router>
    );
}

export default App;
