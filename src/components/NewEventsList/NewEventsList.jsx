import React, { useState, useEffect } from 'react';
import {
    Toolbar,
    Typography,
    Container,
    makeStyles
} from '@material-ui/core';

import EventCard from '../EventCard/EventCard';
import { getStreamsToApprove } from '../../services/database';

const useStyles = makeStyles(() => ({
    toolbar: {
        backgroundColor: '#A9A9A9',
        marginTop: '1.5rem'
    },
    marginBottom16: {
        marginBottom: '1rem'
    }
}));

const EventList = ({ setEventToApprove, day, games }) => {
    const [show, setShow] = useState(true);
    const classes = useStyles();

    return (
        <>
            <div onClick={() => setShow(!show)} style={{ cursor: 'pointer' }}>
                <Toolbar className={classes.toolbar}>
                    <Typography variant='h5' component='div'>
                        {day.title}
                    </Typography>
                </Toolbar>
            </div>
            {show &&
                <Container
                    maxWidth='sm'
                    className={classes.marginBottom16}>
                    {day.data.map((event, index) => (
                        <EventCard
                            setEventToApprove={setEventToApprove}
                            newEvent
                            games={games}
                            key={`EventCard-${index}`}
                            eventKey={event.eventId}
                            event={event} />
                    ))}
                </Container>
            }
        </>
    );
}

const NewEventsList = ({ setEventToApprove, games }) => {
    const [events, setEvents] = useState([]);

    useEffect(() => {

        /**
         * Load, order and save on state the events to show on the list
         */
        async function loadEventsToApprove() {
            let eventsObject = (await getStreamsToApprove()).val();
            let events = [];

            Object.keys(eventsObject)
            .sort((a, b) => eventsObject[b].timestamp - eventsObject[a].timestamp) // Order array based on timestamp
            .forEach((eventId) => {
                let date = new Date(eventsObject[eventId].timestamp);
                date.setHours(0, 0, 0, 0);
                const eventSectionTitle = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

                if (events.some((eventsOfTheDay) => eventsOfTheDay.title === eventSectionTitle)) {
                    const index = events.findIndex((event) => event.title === eventSectionTitle);
                    events[index].data.push({ ...eventsObject[eventId], eventId });
                } else {
                    events.push({ title: eventSectionTitle, data: [{ ...eventsObject[eventId], eventId }] });
                }
            });

            setEvents(events);
        }

        loadEventsToApprove();
    }, []);

    const classes = useStyles();

    return (
        <Container maxWidth='xl' className={classes.MarginBottom16}>
            {events.map((dayEvents, index) => (
                <EventList
                    key={`EventList-${index}`}
                    day={dayEvents}
                    games={games}
                    setEventToApprove={setEventToApprove} />
            ))}
        </Container>
    );
}

export default NewEventsList;