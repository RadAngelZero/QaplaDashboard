import React, { useState } from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';

import styles from './EventsList.module.css'
import EventCard from '../EventCard/EventCard';
import { Toolbar } from '@material-ui/core';
import SendPushNotificationDialog from '../SendPushNotificationDialog/SendPushNotificationDialog';

const EventListOfTheDay = ({ day, initialShow, setSelectedEventKey }) => {
    const [show, setShow] = useState(initialShow);

    return (
        <>
            <div onClick={() => setShow(!show)} style={{ cursor: 'pointer' }}>
                <Toolbar className={styles.Toolbar}>
                    <Typography variant='h5' component='div'>
                        {day.title}
                    </Typography>
                </Toolbar>
            </div>
            {show &&
                <Container
                    maxWidth='sm'
                    className={styles.MarginBottom16}>
                    {day.data.map((event, index) => (
                        <EventCard
                            key={`EventCard-${index}`}
                            setSelectedEvent={setSelectedEventKey}
                            eventKey={event.eventKey}
                            event={event}
                            onClick={() => console.log('press')} />
                    ))}
                </Container>
            }
        </>
    );
}

const EventsList = ({ events }) => {
    const [selectedEventKey, setSelectedEventKey] = useState(null);
    const orderedEvents = [];

    Object.keys(events)
    .map((eventKey) => ({ ...events[eventKey], eventKey }))
    // Sort the events by date
    .sort((a, b) => {
        return a.timestamp - b.timestamp;
    })
    // Fill orderedEvents array for the SectionList of the LogrosList component
    .reverse().forEach((event) => {
        const localDate = new Date(event.timestamp);

        const eventSectionTitle = `${localDate.getDate()}/${localDate.getMonth() + 1}/${localDate.getFullYear()}`;

        if (orderedEvents.some((eventsOfTheDay) => eventsOfTheDay.title === eventSectionTitle)) {
            orderedEvents[orderedEvents.length - 1].data.push(event);
        } else {
            orderedEvents.push({ title: eventSectionTitle, data: [ event ], indexDay: orderedEvents.length });
        }
    });

    return (
        <Container maxWidth='xl' className={styles.MarginBottom16}>
            {orderedEvents.map((dayEvents, index) => (
                <EventListOfTheDay
                    key={`EventList-${index}`}
                    initialShow={index < 6}
                    day={dayEvents}
                    setSelectedEventKey={setSelectedEventKey} />
            ))}
            <SendPushNotificationDialog
                open={Boolean(selectedEventKey)}
                onClose={() => setSelectedEventKey(null)}
                topic={selectedEventKey} />
        </Container>
    );
}

export default EventsList;
