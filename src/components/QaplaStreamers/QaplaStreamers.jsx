import React, { useState, useEffect } from 'react';
import { Container, Grid, Button } from '@material-ui/core';

import { getQaplaStreamers, saveQaplaStreamers } from '../../services/database';
import QaplaTextField from '../QaplaTextField/QaplaTextField';

const QaplaStreamers = () => {
    const [streamers, setStreamers] = useState({});

    useEffect(() => {
        async function getStreamers() {
            const streamers = await getQaplaStreamers();
            setStreamers(streamers.exists() ? streamers.val() : {});
        }

        getStreamers();
    }, []);

    const onBitsValueChange = (streamerName, value) => {
        const streamersCopy = {...streamers};
        streamersCopy[streamerName].donationSize.bits = parseInt(value) ? parseInt(value) : 0;

        setStreamers(streamersCopy);
    }

    const deleteStreamer = (streamerName) => {
        const streamersCopy = {...streamers};
        delete streamersCopy[streamerName];

        setStreamers(streamersCopy);
    }

    const addStreamer = () => {
        const streamerName = prompt('Nombre del streamer');
        if (streamerName) {
            const streamersCopy = {...streamers};
            streamersCopy[streamerName] = { donationSize: { bits: 0 } };

            setStreamers(streamersCopy);
        }
    }

    const saveChanges = () => {
        saveQaplaStreamers(streamers);
    }

    return (
        <Container>
            <Grid container>
                {Object.keys(streamers).map((streamerName) => (
                    <Grid xs={12}>
                        <br/>
                        <Grid container>
                            <Grid xs={2}>
                                <p>{streamerName}</p>
                            </Grid>
                            <Grid xs={3}>
                                <QaplaTextField
                                    label='Bits recibidos por donación'
                                    value={streamers[streamerName].donationSize.bits || 0}
                                    onChange={(value) => onBitsValueChange(streamerName, value)} />
                            </Grid>
                            <Grid xs={4}>
                                <Button
                                    onClick={() => deleteStreamer(streamerName)}
                                    variant='contained'
                                    color='primary'>
                                    Eliminar
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                ))}
                <Button
                    onClick={addStreamer}
                    variant='contained'
                    color='primary'>
                    Agregar
                </Button>
                <Button
                    style={{ marginLeft: 16 }}
                    onClick={saveChanges}
                    variant='contained'
                    color='secondary'>
                    Guardar cambios
                </Button>
            </Grid>
        </Container>
    );
}

export default QaplaStreamers;