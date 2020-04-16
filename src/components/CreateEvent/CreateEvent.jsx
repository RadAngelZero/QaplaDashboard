import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import CancelIcon from '@material-ui/icons/Cancel';

import styles from './CreateEvent.module.css';
import QaplaTextField from '../QaplaTextField/QaplaTextField';
import QaplaSelect from '../QaplaSelect/QaplaSelect';
import { createEvent } from '../../services/database';

const CreateEvent = ({ games }) => {
    const [titles, setTitle] = useState({ 'es': '', 'en': '' });
    const [date, setDate] = useState();
    const [hour, setHour] = useState();
    const [photoUrl, setPhotoUrl] = useState('');
    const [discordLink, setDiscordLink] = useState('');
    const [platform, setPlatform] = useState('switch_white');
    const [game, setGame] = useState('xRocket');
    const [descriptions, setDescription] = useState({ 'es': '', 'en': '' });
    const [prizes, setPrizes] = useState();

    const saveEventOnDatabase = () => {
        const [year, month, day] = date.split('-');
        const [hours, minutes] = hour.split(':');
        const selectedDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
        const UTCDay = selectedDate.getUTCDate() < 10 ? `0${selectedDate.getUTCDate()}` : selectedDate.getUTCDate();
        const UTCMonth = selectedDate.getUTCMonth() + 1 < 10 ? `0${selectedDate.getUTCMonth() + 1}` : selectedDate.getUTCMonth() + 1;
        const UTCHour = selectedDate.getUTCHours() < 10 ? `0${selectedDate.getUTCHours()}` : selectedDate.getUTCHours();
        const UTCMinutes = selectedDate.getUTCMinutes() < 10 ? `0${selectedDate.getUTCMinutes()}` : selectedDate.getUTCMinutes();

        createEvent(
            {
                title: titles,
                titulo: titles['es'], // <- Temporary field, remove it later
                dateUTC: `${UTCDay}-${UTCMonth}-${selectedDate.getUTCFullYear()}`,
                hourUTC: `${UTCHour}:${UTCMinutes}`,
                tiempoLimite: `${day}-${month}-${year}`,
                hour,
                photoUrl,
                discordLink,
                platform,
                prices: prizes,
                game,
                /**
                 * At this point we use the tipoLogro field for the game, in the future we must change it
                 * for the game field
                 */
                tipoLogro: game,
                descriptions,
                description: descriptions['es'] // <- Temporary field, remove it later
            },
            (error) => console.log(error ? error : 'Succesful update')
        );
    }

    const setTitleByLanguage = (language, value) => {
        setTitle({ ...titles, [language]: value });
    }

    const setDescriptionByLanguage = (language, value) => {
        setDescription({ ...descriptions, [language]: value });
    }

    const setPrizeByKey = (key, value) => {
        setPrizes({ ...prizes, [key]: parseInt(value) });
    }

    const setPrizeRange = (previousKey, newKey, value) => {
        const prizesCopy = {...prizes};
        delete prizesCopy[previousKey];
        setPrizes({ ...prizesCopy, [newKey]: parseInt(value) });
    }

    const addPrize = () => {
        if (prizes && Object.keys(prizes).length > 0) {
            const prizesCopy = {...prizes};
            let lastPlace = Object.keys(prizes).sort((a, b) => {
                if (a.includes('-')) {
                    a = a.split('-')[1];
                }

                if (b.includes('-')) {
                    b = b.split('-')[1];
                }

                return parseInt(a) < parseInt(b);
            })[0];

            if (lastPlace.includes('-')) {
                lastPlace = lastPlace.split('-')[1];
            }

            prizesCopy[parseInt(lastPlace) + 1] = 0;
            setPrizes(prizesCopy);
        } else {
            setPrizes({'1': 0});
        }
    }

    const removePrize = (key) => {
        const prizesCopy = {...prizes};
        delete prizesCopy[key];
        setPrizes(prizesCopy);
    }

    const languages = {
        en: {
            names: {
                en: 'English',
                es: 'Spanish'
            }
        },
        es: {
            names: {
                en: 'Ingles',
                es: 'Español'
            }
        }
    };

    return (
        <Container maxWidth='lg' className={styles.Container}>
            <Typography variant='h3' component='h3'>
                Evento: {titles['es']}
            </Typography>
            <form className={styles.MarginTop16}>
                {Object.keys(languages['es'].names).map((availableLanguage) => (
                    <QaplaTextField
                        label={`Titulo ${languages['es'].names[availableLanguage]}`}
                        variant='outlined'
                        value={titles[availableLanguage]}
                        onChange={(value) => setTitleByLanguage(availableLanguage, value)} />
                ))}
                <QaplaTextField
                    label='Fecha (CST)'
                    variant='outlined'
                    type='date'
                    value={date}
                    onChange={setDate} />
                <QaplaTextField
                    label='Hora (CST 12 horas)'
                    variant='outlined'
                    type='time'
                    value={hour}
                    onChange={setHour} />
                <QaplaTextField
                    label='Foto (url)'
                    variant='outlined'
                    type='text'
                    value={photoUrl}
                    onChange={setPhotoUrl} />
                <QaplaTextField
                    label='Discord Link'
                    variant='outlined'
                    type='text'
                    value={discordLink}
                    onChange={setDiscordLink} />
                <QaplaSelect
                    label='Plataforma'
                    id='Platform'
                    value={platform}
                    onChange={setPlatform}>
                    <option aria-label='None' value='' />
                    <option value='switch_white'>Nintendo switch</option>
                    <option value='ps4_white'>PlayStation</option>
                    <option value='xbox_white'>Xbox</option>
                    <option value='pc_white'>PC/Movil</option>
                </QaplaSelect>
                <QaplaSelect
                    label='Juego'
                    id='Game'
                    disabled={!games[platform]}
                    value={game}
                    onChange={setGame}>
                    <option aria-label='None' value='' />
                    {games && games[platform] && Object.keys(games[platform]).map((gameKey) => (
                        <option key={gameKey} value={gameKey}>
                            {games[platform][gameKey].name}
                        </option>
                    ))}
                    <option value='Torneo'>Torneo (evento sin retas)</option>
                </QaplaSelect>
                {Object.keys(languages['es'].names).map((availableLanguage) => (
                    <QaplaTextField
                        label={`Descripción ${languages['es'].names[availableLanguage]}`}
                        multiline
                        rows={4}
                        value={descriptions[availableLanguage]}
                        onChange={(value) => setDescriptionByLanguage(availableLanguage, value)} />
                ))}
                <Typography>
                    Premios
                </Typography>
                {prizes && Object.keys(prizes).sort((a, b) => parseInt(b) < parseInt(a)).map((prizeKey) => (
                    <>
                        <QaplaTextField
                            label='Posición'
                            mini
                            value={prizeKey}
                            onChange={(value) => setPrizeRange(prizeKey, value, prizes[prizeKey])} />
                        <QaplaTextField
                            type='number'
                            label='Premio'
                            value={prizes[prizeKey]}
                            onChange={(value) => setPrizeByKey(prizeKey, value)} />
                        <Button onClick={() => removePrize(prizeKey)}>
                            <CancelIcon
                                color='secondary'
                                className={styles.RemovePrize} />
                        </Button>
                        <br/>
                    </>
                ))}
                <Button
                    variant='text'
                    color='primary'
                    className={styles.MarginRight16}
                    onClick={addPrize}>
                    Agregar premio
                </Button>
                <div className={styles.MarginTop16}>
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={saveEventOnDatabase}>
                        Crear evento
                    </Button>
                </div>
            </form>
        </Container>
    );
}

export default CreateEvent;
