import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import CancelIcon from '@material-ui/icons/Cancel';
import FileCopyIcon from '@material-ui/icons/FileCopy';

import styles from './EventDetails.module.css';
import QaplaTextField from '../QaplaTextField/QaplaTextField';
import QaplaSelect from '../QaplaSelect/QaplaSelect';
import { deleteEvent, updateEvent, getEventRanking, closeEvent } from '../../services/database';
import Languages from '../../utilities/Languages';

const EventDetails = ({ events, games, platforms }) => {
    const { eventId } = useParams();
    events[eventId] = events[eventId] ? events[eventId] : {};
    const [titles, setTitle] = useState(events[eventId].title ? events[eventId].title : { 'es': '', 'en': '' });
    const [date, setDate] = useState(events[eventId].tiempoLimite ? events[eventId].tiempoLimite : '');
    const [hour, setHour] = useState(events[eventId].hour ? events[eventId].hour : '');
    const [photoUrl, setPhotoUrl] = useState(events[eventId].photoUrl ? events[eventId].photoUrl : '');
    const [discordLink, setDiscordLink] = useState(events[eventId].discordLink ? events[eventId].discordLink : '');
    const [platform, setPlatform] = useState(events[eventId].platform ? events[eventId].platform : '');
    const [game, setGame] = useState(events[eventId].tipoLogro ? events[eventId].tipoLogro : '');
    const [descriptions, setDescriptions] = useState(events[eventId].descriptions ? events[eventId].descriptions : { 'es': '', 'en': '' });
    const [prizes, setPrizes] = useState(events[eventId].prices ? events[eventId].prices : {});
    const [eventLinks, setEventLinks] = useState(events[eventId].eventLinks ? events[eventId].eventLinks : []);
    const history = useHistory();

    useEffect(() => {
        if (events[eventId]) {
            const { title, tiempoLimite, hour, photoUrl, discordLink, platform, tipoLogro, descriptions, prices, eventLinks } = events[eventId];
            setTitle(title ? title : { 'es': '', 'en': '' });
            if (tiempoLimite && tiempoLimite.includes('-')) {
                const [day, month, year] = tiempoLimite.split('-');
                setDate(`${year}-${month}-${day}`);
            }
            setHour(hour ? hour : '');
            setPhotoUrl(photoUrl ? photoUrl : '');
            setDiscordLink(discordLink ? discordLink : '');
            setPlatform(platform ? platform : '');
            setGame(tipoLogro ? tipoLogro : '');
            setDescriptions(descriptions ? descriptions : { 'es': '', 'en': '' });
            setPrizes(prices ? prices : {});
            setEventLinks(eventLinks ? eventLinks : []);

        }
    }, [events]);

    /**
     * Delete the event from the database
     */
    const removeEventFromDatabase = () => {
        deleteEvent(eventId, (error) => console.log(error ? error : 'Succesful delete'));
    }

    /**
     * Update the event on the database
     */
    const updateEventOnDatabase = () => {
        const [year, month, day] = date.split('-');
        const [hours, minutes] = hour.split(':');
        const selectedDate = new Date(year, month - 1, day, hours, minutes, 0, 0);

        /**
         * Add a 0 in front of every date variable if is less tan 10 because in the cloud functions and app
         * we need it, for example if the day is 2, we need 02, to ensure the length of the dates strings
         * are always the same
         * TODO: Refactor, send this to utils.js
         */
        const UTCDay = selectedDate.getUTCDate() < 10 ? `0${selectedDate.getUTCDate()}` : selectedDate.getUTCDate();
        const UTCMonth = selectedDate.getUTCMonth() + 1 < 10 ? `0${selectedDate.getUTCMonth() + 1}` : selectedDate.getUTCMonth() + 1;
        const UTCHour = selectedDate.getUTCHours() < 10 ? `0${selectedDate.getUTCHours()}` : selectedDate.getUTCHours();
        const UTCMinutes = selectedDate.getUTCMinutes() < 10 ? `0${selectedDate.getUTCMinutes()}` : selectedDate.getUTCMinutes();

        updateEvent(
            eventId,
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

    /**
     * Update the titles variable state based on the language to update
     * @param {string} language Language code (example es, en)
     * @param {string} value Value of the title
     */
    const setTitleByLanguage = (language, value) => {
        setTitle({ ...titles, [language]: value });
    }

    /**
     * Update the descriptions variable state based on the language to update
     * @param {string} language Language code (example es, en)
     * @param {string} value Value of the description
     */
    const setDescriptionsByLanguage = (language, value) => {
        setDescriptions({ ...descriptions, [language]: value });
    }

    /**
     * Update the value for a event prize
     * @param {string} key Key of the prize to update (1, 2, 3, etc.)
     * @param {string} value Qoins to add as prize for the key (place)
     */
    const setPrizeByKey = (key, value) => {
        setPrizes({ ...prizes, [key]: parseInt(value) });
    }

    /**
     * Update the key of a prize, useful to change the places who win the value
     * For example: the second place win 300 Qoins, but now that must be
     * the prize for the third place, this function change the 2 (previousKey)
     * for the 3 (newKey) with the same value (300 Qoins)
     * @param {string} previousKey Key (places) used before (1, 2, 3, etc.)
     * @param {string} newKey New key (place) (1, 2, 5-10, etc. )
     * @param {string} value Qoins to add as prize on the event
     */
    const setPrizeRange = (previousKey, newKey, value) => {
        const prizesCopy = {...prizes};
        delete prizesCopy[previousKey];
        setPrizes({ ...prizesCopy, [newKey]: parseInt(value) });
    }

    /**
     * Add a prize to the object of prizes, by default with the last place + 1
     * for example if we have prizes for: 1, 2, 3, 4-10 and we call this function
     * will create a new element on the object with the key 11, for the 11 place
     * on the event
     */
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

    /**
     * Remove a prize to the object of prizes
     * for example if we have prizes for: 1, 2, 3, 4-10 and we call this function
     * with the 4-10 key, then the prizes object will only contains now the 1, 2, 3 places
     * on the event
     * @param {string} key Place to remove from the event prize object
     */
    const removePrize = (key) => {
        const prizesCopy = {...prizes};
        delete prizesCopy[key];
        setPrizes(prizesCopy);
    }

    /**
     * Log the current ranking of the event
     */
    const showRanking = async () => {
        (await getEventRanking(eventId)).forEach((user, index) => {
            console.log(`${index + 1}° UserName: ${user.userName} GamerTag: ${user.gamerTag} uid: ${user.uid}`);
        });
    }

    /**
     * Finish an event of matches
     */
    const finishEvent = () => {
        closeEvent(eventId);
    }
    /**
     * Send the user to the assign prizes page
     */
    const goToEventPrizes = () => history.push(`/event/prizes/${eventId}`);

    /**
     * Save the EventId on the user clipboard
     */
    const copyEventId = () => {
        const field = document.getElementById('EventIdTextField');
        field.value = eventId;
        field.select();
        document.execCommand('copy');
        alert('Texto copiado');
    }

    return (
        <Container maxWidth='lg' className={styles.Container}>
            <Typography variant='h3' component='h3'>
                Evento: {titles['es']}
            </Typography>
            <form className={styles.MarginTop16}>
                <QaplaTextField
                    label='ID del evento'
                    value={eventId}
                    inputAdornment={<FileCopyIcon />}
                    onChange={() => {}}
                    onPressAdornment={copyEventId}
                    id='EventIdTextField' />
                {Object.keys(Languages['es'].names).map((availableLanguage) => (
                    <QaplaTextField
                        key={`title-${availableLanguage}`}
                        label={`Titulo ${Languages['es'].names[availableLanguage]}`}
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
                    {Object.keys(platforms).map((platformKey) => (
                        <option
                            key={platformKey}
                            value={platformKey}>{platforms[platformKey].name}</option>
                    ))}
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
                {Object.keys(Languages['es'].names).map((availableLanguage) => (
                    <QaplaTextField
                        key={`Description-${availableLanguage}`}
                        label={`Descripción ${Languages['es'].names[availableLanguage]}`}
                        multiline
                        rows={4}
                        value={descriptions[availableLanguage]}
                        onChange={(value) => setDescriptionsByLanguage(availableLanguage, value)} />
                ))}
                {eventLinks && Object.keys(eventLinks).map((linkKey) => (
                    <p>
                        {`Link ${linkKey}.-`} <a href={eventLinks[linkKey]}>{`${eventLinks[linkKey]}`}</a>
                    </p>
                ))}
                <Typography>
                    Premios
                </Typography>
                {prizes && Object.keys(prizes).sort((a, b) => parseInt(b) < parseInt(a)).map((prizeKey) => (
                    <React.Fragment key={`Prize-${prizeKey}`}>
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
                    </React.Fragment>
                ))}
                <Button
                    variant='text'
                    color='primary'
                    className={styles.MarginRight16}
                    onClick={addPrize}>
                    Agregar premio
                </Button>
                <div className={styles.MarginTop16}>
                    {/**
                     * MarginRight16 use !important css because without it the margin
                     * is not applied to this button
                     */}
                    <Button
                        variant='contained'
                        color='secondary'
                        className={styles.MarginRight16}
                        onClick={removeEventFromDatabase}>
                        Eliminar
                    </Button>
                    <Button
                        variant='contained'
                        color='primary'
                        className={styles.MarginRight16}
                        onClick={updateEventOnDatabase}>
                        Guardar cambios
                    </Button>
                    {games && games[platform] && games[platform][game] ?
                        <>
                            <Button
                            variant='contained'
                            className={styles.MarginRight16}
                            onClick={showRanking}>
                                Ver resultados al momento
                            </Button>
                            <Button
                            variant='contained'
                            color='primary'
                            onClick={finishEvent}>
                                Finalizar evento
                            </Button>
                        </>
                        :
                        <Button
                        variant='contained'
                        onClick={goToEventPrizes}>
                            Repartir premios
                        </Button>
                    }
                </div>
            </form>
        </Container>
    );
}

export default EventDetails;
