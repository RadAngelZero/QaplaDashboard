import React, { useState, useEffect } from 'react';
import { Container, Button } from '@material-ui/core';

import QaplaSelect from '../QaplaSelect/QaplaSelect';
import { getPremiumStreamers, sendCheersFromQapla } from '../../services/database';
import QaplaTextField from '../QaplaTextField/QaplaTextField';
import { OTHER, QLANES } from '../../utilities/Constants';

const SendCheers = () => {
    const [qoinsToDonate, setQoinsToDonate] = useState('');
    const [message, setMessage] = useState('');
    const [premiumStreamers, setPremiumStreamers] = useState({});
    const [type, setType] = useState(QLANES);
    const [selectedStreamer, setSelectedStreamer] = useState({ uid: '', displayName: '' });

    useEffect(() => {
        async function getStreamers() {
            const streamers = await getPremiumStreamers();

            if (streamers.exists()) {
                setPremiumStreamers(streamers.val());
            }
        }

        getStreamers();
    }, []);

    const setStreamer = (streamerId) => {
        setSelectedStreamer(premiumStreamers[streamerId]);
    }

    const sendCheersToStreamer = async () => {
        try {
            const qaplaLogolURL = 'https://firebasestorage.googleapis.com/v0/b/qapplaapp.appspot.com/o/QaplaImages%2FQ-logo.png?alt=media&token=64ba2610-31db-4548-8338-3094ec31cbb5';
            await sendCheersFromQapla(selectedStreamer.uid, selectedStreamer.displayName, parseInt(qoinsToDonate), message, (new Date).getTime(), 'Qapla gaming', 'Qapla gaming', qaplaLogolURL, type);
            setQoinsToDonate('');
            setMessage('');
            setSelectedStreamer({ uid: '', displayName: '' });
            alert('Cheers enviados correctamente');
        } catch (error) {
            alert('Hubo un error al enviar los cheers');
        }
    }

    return (
        <Container maxWidth='lg' style={{ marginTop: '2em' }}>
            <QaplaSelect
                label='Streamer'
                value={selectedStreamer.uid}
                onChange={(streamerId) => setStreamer(streamerId)}>
                <option aria-label='None' value='' />
                {Object.keys(premiumStreamers).sort((a, b) => premiumStreamers[a].displayName.toLowerCase() > premiumStreamers[b].displayName.toLowerCase() ? 1 : -1).map((streamerUid) => (
                    <option
                        key={streamerUid}
                        value={streamerUid}>{premiumStreamers[streamerUid].displayName}</option>
                ))}
            </QaplaSelect>
            <br />
            <QaplaSelect
                label='Tipo de Cheers'
                value={type}
                onChange={(type) => setType(type)}>
                <option value={QLANES} label='Qlanes' />
                <option value={OTHER} label='Otro' />
            </QaplaSelect>
            <br />
            <QaplaTextField
                label='Qoins'
                value={qoinsToDonate}
                onChange={setQoinsToDonate} />
            <br />
            <QaplaTextField
                label={'Mensaje'}
                multiline
                rows={4}
                value={message}
                onChange={setMessage} />
            <br />
            <Button
                variant='contained'
                color='primary'
                style={{ marginRight: 16 }}
                onClick={sendCheersToStreamer}>
                Enviar Cheers
            </Button>
        </Container>
    );
}

export default SendCheers;