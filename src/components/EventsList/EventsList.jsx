import React from 'react';
import Container from '@material-ui/core/Container';

import styles from './EventsList.module.css'
import EventCard from '../EventCard/EventCard';

const EventsList = ({ events }) => {

    return (
        <Container maxWidth='sm' className={styles.MarginBottom16}>
            {Object.keys(events).reverse().map((eventKey) => (
                <EventCard
                    key={eventKey}
                    eventKey={eventKey}
                    photoUrl={events[eventKey].photoUrl}
                    title={events[eventKey].titulo}
                    description={events[eventKey].description}
                    onClick={() => console.log('press')} />
            ))}
        </Container>
    );
}

export default EventsList;
