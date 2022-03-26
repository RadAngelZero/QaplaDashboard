import { Button, TextField } from '@material-ui/core';
import React,  { useState, useEffect } from 'react';
import { getPastEventsByTimestamp } from '../../services/database';
import { ONE_DAY_IN_MILLISECONDS } from '../../utilities/Constants';

import EventsList from '../EventsList/EventsList';
import QaplaTextField from '../QaplaTextField/QaplaTextField';

const PastEventsList = () => {
    const [events, setEvents] = useState({});
    const [daysToLoad, setDaysToLoad] = useState(1);
    const [reload, setReload] = useState(true);

    useEffect(() => {
        async function getStreams() {
            const date = new Date();
            const streams = await getPastEventsByTimestamp(date.getTime() - (ONE_DAY_IN_MILLISECONDS * daysToLoad));
            if (streams.exists()) {
                console.log(streams.val());
                setEvents(streams.val());
                setReload(false);
            }
        }

        if (reload) {
            getStreams();
        }
    }, [reload]);
    return (
        <>
        <div>
            <div style={{ marginLeft: 16, marginTop: 16 }}>
                <QaplaTextField type='number' value={daysToLoad} onChange={(value) => setDaysToLoad(value)} label='Días' />
                <br />
                <Button variant='contained' color='primary' disabled={reload} onClick={() => setReload(true)}>Recargar</Button>
            </div>
        </div>
        <EventsList events={events} />
        </>
    );
}

export default PastEventsList;
