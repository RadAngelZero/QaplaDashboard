import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import CancelIcon from '@material-ui/icons/Cancel';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import Grid from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';

import styles from './EventDetails.module.css';
import QaplaTextField from '../QaplaTextField/QaplaTextField';
import QaplaSelect from '../QaplaSelect/QaplaSelect';
import { deleteEvent, updateEvent, getEventRanking, closeEvent } from '../../services/database';
import Languages from '../../utilities/Languages';

const fixedPrizesValues = {
    0: {},
    16: {
        '1': 100,
        '2': 75,
        '3': 50,
        '4': 25,
        '5-16': 15,
        '17-100': 10
    },
    32: {
        '1': 200,
        '2': 150,
        '3': 100,
        '4': 50,
        '5-8': 25,
        '9-16': 15,
        '17-100': 10
    }
};

const EventDetails = ({ events, games, platforms }) => {
    const { eventId } = useParams();
    events[eventId] = events[eventId] ? events[eventId] : {};
    const [active, setActive] = useState(events[eventId].active ? events[eventId].active : false);
    const [titles, setTitle] = useState(events[eventId].title ? events[eventId].title : { 'es': '', 'en': '' });
    const [date, setDate] = useState(events[eventId].tiempoLimite ? events[eventId].tiempoLimite : '');
    const [hour, setHour] = useState(events[eventId].hour ? events[eventId].hour : '');
    const [discordLink, setDiscordLink] = useState(events[eventId].discordLink ? events[eventId].discordLink : '');
    const [platform, setPlatform] = useState(events[eventId].platform ? events[eventId].platform : '');
    const [game, setGame] = useState(events[eventId].tipoLogro ? events[eventId].tipoLogro : '');
    const [descriptions, setDescriptions] = useState(events[eventId].descriptions ? events[eventId].descriptions : { 'es': '', 'en': '' });
    const [prizes, setPrizes] = useState(events[eventId].prices ? events[eventId].prices : {});
    const [eventLinks, setEventLinks] = useState(events[eventId].eventLinks ? events[eventId].eventLinks : []);
    const [streamerName, setStreamerName] = useState(events[eventId].streamerName ? events[eventId].streamerName : '');
    const [streamerChannelLink, setStreamerChannelLink] = useState(events[eventId].streamerChannelLink ? events[eventId].streamerChannelLink : '');
    const [streamerPhoto, setStreamerPhoto] = useState(events[eventId].streamerPhoto ? events[eventId].streamerPhoto : '');
    const [streamingPlatformImage, setStreamingPlatformImage] = useState(events[eventId].streamingPlatformImage ? events[eventId].streamingPlatformImage : '');
    const [backgroundImage, setBackgroundImage] = useState(events[eventId].backgroundImage ? events[eventId].backgroundImage : '');
    const [descriptionsTitle, setDescriptionsTitle] = useState(events[eventId].descriptionsTitle ? events[eventId].descriptionsTitle : {});
    const [appStringPrizes, setAppStringPrizes] = useState(events[eventId].appStringPrizes ? events[eventId].appStringPrizes : {});
    const [instructionsToParticipate, setInstructionsToParticipate] = useState(events[eventId].instructionsToParticipate ? events[eventId].instructionsToParticipate : {});
    const [streamerGameData, setStreamerGameData] = useState(events[eventId].streamerGameData ? events[eventId].streamerGameData : {});
    const [eventEntry, setEventEntry] = useState(events[eventId].eventEntry ? events[eventId].eventEntry : 0);
    const [isMatchesEvent, setIsMatchesEvent] = useState(events[eventId].isMatchesEvent ? events[eventId].isMatchesEvent : false);
    const [acceptAllUsers, setAcceptAllUsers] = useState(events[eventId].acceptAllUsers ? events[eventId].acceptAllUsers : false);
    const [participantNumber, setParticipantNumber] = useState(events[eventId].participantNumber ? events[eventId].participantNumber : 0);
    const [featured, setFeatured] = useState(events[eventId].featured ? events[eventId].featured : false);

    const history = useHistory();

    useEffect(() => {
        if (events[eventId]) {
            const {
                title,
                tiempoLimite,
                hour,
                discordLink,
                platform,
                tipoLogro,
                descriptions,
                prices,
                eventLinks,
                active,
                streamerName,
                streamerChannelLink,
                streamerPhoto,
                streamingPlatformImage,
                backgroundImage,
                descriptionsTitle,
                appStringPrizes,
                instructionsToParticipate,
                streamerGameData,
                eventEntry,
                isMatchesEvent,
                acceptAllUsers,
                participantNumber,
                featured
            } = events[eventId];
            setTitle(title ? title : { 'es': '', 'en': '' });
            if (tiempoLimite && tiempoLimite.includes('-')) {
                const [day, month, year] = tiempoLimite.split('-');
                setDate(`${year}-${month}-${day}`);
            }
            setHour(hour ? hour : '');
            setDiscordLink(discordLink ? discordLink : '');
            setPlatform(platform ? platform : '');
            setGame(tipoLogro ? tipoLogro : '');
            setDescriptions(descriptions ? descriptions : { 'es': '', 'en': '' });
            setPrizes(prices ? prices : {});
            setEventLinks(eventLinks ? eventLinks : []);
            setActive(active ? active : false);
            setStreamerName(streamerName ? streamerName : '');
            setStreamerChannelLink(streamerChannelLink ? streamerChannelLink : '');
            setStreamerPhoto(streamerPhoto ? streamerPhoto : '');
            setStreamingPlatformImage(streamingPlatformImage ? streamingPlatformImage : '');
            setBackgroundImage(backgroundImage ? backgroundImage : '');
            setDescriptionsTitle(descriptionsTitle ? descriptionsTitle : {});
            setAppStringPrizes(appStringPrizes ? appStringPrizes : {});
            setInstructionsToParticipate(instructionsToParticipate ? instructionsToParticipate : {});
            setStreamerGameData(streamerGameData ? streamerGameData : {});
            setEventEntry(eventEntry ? eventEntry : 0);
            setIsMatchesEvent(isMatchesEvent ? isMatchesEvent : false);
            setAcceptAllUsers(acceptAllUsers ? acceptAllUsers : false);
            setParticipantNumber(participantNumber ? participantNumber : 0);
            setFeatured(featured ? featured : false);
        }
    }, [events]);

    /**
     * Delete the event from the database
     */
    const removeEventFromDatabase = () => {
        deleteEvent(eventId, (error) => {
            alert(error ? `Error al eliminar el evento: ${error}` : 'Evento eliminado');
            if (!error) {
                history.push(`/`);
            }
        });
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

        let streamerGameDataFiltered = {};
        Object.keys(streamerGameData)
            .filter((key) => streamerGameData[key] !== '')
            .forEach((key) => {
                streamerGameDataFiltered[key] = streamerGameData[key];
            });

        updateEvent(
            eventId,
            {
                title: titles,
                titulo: titles['es'], // <- Temporary field, remove it later
                dateUTC: `${UTCDay}-${UTCMonth}-${selectedDate.getUTCFullYear()}`,
                hourUTC: `${UTCHour}:${UTCMinutes}`,
                tiempoLimite: `${day}-${month}-${year}`,
                hour,
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
                description: descriptions['es'], // <- Temporary field, remove it later
                streamingPlatformImage,
                streamerName,
                streamerChannelLink,
                streamerPhoto,
                backgroundImage,
                descriptionsTitle,
                appStringPrizes,
                instructionsToParticipate,
                streamerGameData: streamerGameDataFiltered,
                eventEntry: eventEntry ? parseInt(eventEntry) : 0,
                isMatchesEvent,
                acceptAllUsers,
                participantNumber,
                featured
            },
            (error) => {
                if (error) {
                    console.error(error);
                    alert('Hubo un problema al actualizar el evento');
                    return;
                }

                alert('Evento actualizado exitosamente');
            }
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
    const setDescriptionByLanguage = (language, value) => {
        setDescriptions({ ...descriptions, [language]: value });
    }

    /**
     * Update the description title on the given language
     * @param {string} language Language code (example es, en)
     * @param {string} value Value of the description
     */
    const setDescriptionsTitleByLanguage = (language, value) => {
        setDescriptionsTitle({ ...descriptionsTitle, [language]: value });
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
     * Update a field of the string prize object of the given language
     * @param {string} language Language of the prize description
     * @param {number} index Index of the prize
     * @param {string} value Value to save
     * @param {string} field Field to save (one of title or prize)
     */
    const updateAppStringPrizeByLanguage = (language, index, value, field) => {
        const appStringPrizesCopy = appStringPrizes;
        appStringPrizesCopy[language][index][field] = value;

        setAppStringPrizes({...appStringPrizesCopy});
    }

    /**
     * Add a prize to the appStringPrizes on the given language
     * @param {string} language Language of the prize description
     */
    const addAppStringPrize = (language) => {
        const appStringPrizesCopy = appStringPrizes;

        if (!appStringPrizesCopy[language]) {
            appStringPrizesCopy[language] = [];
        }
        appStringPrizesCopy[language].push({ title: '', prize: '' });

        setAppStringPrizes({...appStringPrizesCopy});
    }

    /**
     * Remove a prize to the appStringPrizes on the given language
     * @param {string} language Language of the prize description
     * @param {number} index Index of the prize
     */
    const removeAppStringPrize = (language, index) => {
        const appStringPrizesCopy = appStringPrizes;

        appStringPrizesCopy[language].splice(index, 1);

        if (appStringPrizesCopy[language].length === 0) {
            delete appStringPrizesCopy[language];
        }

        setAppStringPrizes({...appStringPrizesCopy});
    }

    /**
     * Update a field of the instructions to participate object of the given language
     * @param {string} language Language of the prize description
     * @param {number} index Index of the prize
     * @param {string} value Value to save
     * @param {string} field Field to save (one of title or prize)
     */
    const updateInstructionsToParticipateByLanguage = (language, index, value) => {
        const instructionsToParticipateCopy = instructionsToParticipate;
        instructionsToParticipateCopy[language][index] = value;

        setInstructionsToParticipate({...instructionsToParticipateCopy});
    }

    /**
     * Add a instruction to the instructionsToParticipate on the given language
     * @param {string} language Language of the prize description
     */
    const addInstructionToParticipate = (language) => {
        const instructionsToParticipateCopy = instructionsToParticipate;

        if (!instructionsToParticipateCopy[language]) {
            instructionsToParticipateCopy[language] = [];
        }
        instructionsToParticipateCopy[language].push('');

        setInstructionsToParticipate({...instructionsToParticipateCopy});
    }

    /**
     * Remove a prize to the instructionsToParticipate on the given language
     * @param {string} language Language of the prize description
     * @param {number} index Index of the prize
     */
    const removeInstructionsToParticipate = (language, index) => {
        const instructionsToParticipateCopy = instructionsToParticipate;

        instructionsToParticipateCopy[language].splice(index, 1);

        if (instructionsToParticipateCopy[language].length === 0) {
            delete instructionsToParticipateCopy[language];
        }

        setInstructionsToParticipate({...instructionsToParticipateCopy});
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

    /**
     * Send the user to the join requests page
     */
    const goToJoinRequests = () => history.push(`/event/requests/${eventId}`);

    /**
     * Send the user to the join requests page
     */
    const goToEventParticipants = () => history.push(`/event/participants/${eventId}`);

    const setPrizesForParticipantNumber = (participantNumber) => {
        setParticipantNumber(participantNumber);
        setPrizes(fixedPrizesValues[participantNumber]);
    }

    /**
     * Add a custom field for the streamerGameData
     */
    const addInformationNeededForEvent = () => {
        const name = window.prompt('Nombre del campo a agregar:', `${games[platform][game].name} ID`);
        if (name) {
            if (!games[platform][game].informationNeededForEvent) {
                games[platform][game].informationNeededForEvent = {};
            }

            games[platform][game].informationNeededForEvent[name] = {};
            games[platform][game].informationNeededForEvent[name].hint = {};
            Object.keys(Languages).forEach((language) => {
                games[platform][game].informationNeededForEvent[name].hint[language] = name;
            });
            setStreamerGameData({ ...streamerGameData, [name]: '' });
        }
    }

    /**
     * Update the selected game and delete all the streamerGameData
     * @param {string} value New game value
     */
    const setSelectedGame = (value) => {
        setGame(value);
        setStreamerGameData({});
    }

    return (
        <Container maxWidth='lg' className={styles.Container}>
            <Typography
                variant='h3'
                className={styles.EventTitle}>
                Evento: {titles['es']}
            </Typography>
            <form className={styles.MarginTop16}>
                <Typography
                    variant='h5'
                    className={styles.ItalicFont}>
                    Información del evento
                </Typography>
                <br/>
                <Grid container>
                    <Grid item md={12}>
                        <QaplaTextField
                            label='ID del evento'
                            value={eventId}
                            inputAdornment={<FileCopyIcon />}
                            onChange={() => {}}
                            onPressAdornment={copyEventId}
                            id='EventIdTextField' />
                    </Grid>
                    <Grid item md={12}>
                        <br/>
                        <QaplaTextField
                            label='Nombre del streamer'
                            variant='outlined'
                            value={streamerName}
                            onChange={setStreamerName} />
                    </Grid>
                </Grid>
                <br/>
                <Grid container>
                    {Object.keys(Languages['es'].names).map((availableLanguage) => (
                        <Grid item md={4} key={`Title-${availableLanguage}`}>
                            <QaplaTextField
                                key={`title-${availableLanguage}`}
                                label={`Titulo ${Languages['es'].names[availableLanguage]}`}
                                variant='outlined'
                                value={titles[availableLanguage]}
                                onChange={(value) => setTitleByLanguage(availableLanguage, value)} />
                        </Grid>
                    ))}
                </Grid>
                <br/>
                <Grid container>
                    {Object.keys(Languages['es'].names).map((availableLanguage) => (
                        <Grid item md={4} key={`Description-${availableLanguage}`}>
                            <QaplaTextField
                                label={`Titulo de la descripción ${Languages['es'].names[availableLanguage]}`}
                                value={descriptionsTitle[availableLanguage] || ''}
                                onChange={(value) => setDescriptionsTitleByLanguage(availableLanguage, value)} />
                            <br/>
                            <QaplaTextField
                                label={`Descripción ${Languages['es'].names[availableLanguage]}`}
                                multiline
                                rows={4}
                                value={descriptions[availableLanguage] || ''}
                                onChange={(value) => setDescriptionByLanguage(availableLanguage, value)} />
                            <br/>
                        </Grid>
                    ))}
                </Grid>
                <Typography
                    variant='h5'
                    className={styles.ItalicFont}>
                    Juego y plataforma
                </Typography>
                <br/>
                <Grid container>
                    <Grid item md={4}>
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
                    </Grid>
                    <Grid item md={4}>
                        <QaplaSelect
                            label='Juego'
                            id='Game'
                            disabled={!games[platform]}
                            value={game}
                            onChange={setSelectedGame}>
                            <option aria-label='None' value='' />
                            {games && games[platform] && Object.keys(games[platform]).map((gameKey) => (
                                <option key={gameKey} value={gameKey}>
                                    {games[platform][gameKey].name}
                                </option>
                            ))}
                        </QaplaSelect>
                    </Grid>
                </Grid>
                <Typography
                    variant='h5'
                    className={styles.ItalicFont}>
                    Información para los participantes
                </Typography>
                <Grid container>
                    {Object.keys(streamerGameData).map((streamerDataFieldKey) => (
                        <Grid item md={4} key={`streamerGameField-${streamerDataFieldKey}`}>
                            <br/>
                            <QaplaTextField
                                label={streamerDataFieldKey}
                                placeholder={streamerDataFieldKey}
                                value={streamerGameData[streamerDataFieldKey] || ''}
                                onChange={(value) => setStreamerGameData({ ...streamerGameData, [streamerDataFieldKey]: value })} />
                        </Grid>
                    ))}
                    {game && games[platform] && games[platform][game] &&
                        <Grid item md={12}>
                            <Button
                                variant='outlined'
                                color='secondary'
                                className={styles.MarginRight16}
                                onClick={addInformationNeededForEvent}>
                                Agregar campo
                            </Button>
                        </Grid>
                    }
                </Grid>
                <br/>
                <Typography
                    variant='h5'
                    className={styles.ItalicFont}>
                    Fecha y hora
                </Typography>
                <br/>
                <Grid container>
                    <Grid item md={4}>
                        <QaplaTextField
                            label='Fecha (CST)'
                            variant='outlined'
                            type='date'
                            value={date}
                            onChange={setDate} />
                    </Grid>
                    <Grid item md={4}>
                        <QaplaTextField
                            label='Hora (CST 24 horas)'
                            variant='outlined'
                            type='time'
                            value={hour}
                            onChange={setHour} />
                    </Grid>
                </Grid>
                <br/>
                <Typography
                    variant='h5'
                    className={styles.ItalicFont}>
                    Numero de participantes
                </Typography>
                <br/>
                <QaplaSelect
                    label='Numero de participantes'
                    value={participantNumber}
                    onChange={setPrizesForParticipantNumber}>
                    <option value={0} />
                    <option value={16}>16</option>
                    <option value={32}>32</option>
                </QaplaSelect>
                <br/>
                <Grid container>
                    {Object.keys(Languages['es'].names).map((availableLanguage) => (
                        <Grid item md={6} key={`PrizeList-${availableLanguage}`}>
                            <Typography
                                variant='h5'
                                className={styles.ItalicFont}>
                                Descripción de premios en {Languages['es'].names[availableLanguage]}
                            </Typography>
                            {appStringPrizes && appStringPrizes[availableLanguage] && appStringPrizes[availableLanguage].map((prize, index) => (
                                <React.Fragment key={`AppStringPrize-${availableLanguage}-${index}`}>
                                    <p>
                                        {index + 1}
                                    </p>
                                    <QaplaTextField
                                        label='Posición'
                                        mini
                                        placeholder='Ganador, Cuarto'
                                        value={prize.title}
                                        onChange={(value) => updateAppStringPrizeByLanguage(availableLanguage, index, value, 'title')} />
                                    <QaplaTextField
                                        type='text'
                                        label='Premio'
                                        value={prize.prize}
                                        onChange={(value) => updateAppStringPrizeByLanguage(availableLanguage, index, value, 'prize')} />
                                    <Button onClick={() => removeAppStringPrize(availableLanguage, index)}>
                                        <CancelIcon
                                            color='secondary'
                                            className={styles.RemovePrize} />
                                    </Button>
                                    <br/>
                                </React.Fragment>
                            ))}
                            <br/>
                            <Button
                                variant='outlined'
                                color='secondary'
                                className={styles.MarginRight16}
                                onClick={() => addAppStringPrize(availableLanguage)}>
                                Agregar premio
                            </Button>
                            <br/>
                            <br/>
                        </Grid>
                    ))}
                </Grid>
                <FormControlLabel
                    control={<Checkbox checked={isMatchesEvent} onChange={() => setIsMatchesEvent(!isMatchesEvent)} name="checkedA" color='primary' />}
                    label='Evento de retas' />
                <Typography
                    variant='h5'
                    className={styles.ItalicFont}>
                    Qoins a repartir
                </Typography>
                <br/>
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
                    variant='outlined'
                    color='secondary'
                    className={styles.MarginRight16}
                    onClick={addPrize}>
                    Agregar premio
                </Button>
                <br/>
                <br/>
                <Grid container>
                    {Object.keys(Languages['es'].names).map((availableLanguage) => (
                        <Grid item md={6} key={`InstructionsToParticipate-${availableLanguage}`}>
                            <Typography
                                variant='h5'
                                className={styles.ItalicFont}>
                                Instrucciones para participar en {Languages['es'].names[availableLanguage]}
                            </Typography>
                            {instructionsToParticipate && instructionsToParticipate[availableLanguage] && instructionsToParticipate[availableLanguage].map((instruction, index) => (
                                <React.Fragment key={`Instructions-${availableLanguage}-${index}`}>
                                    <p>
                                        {index + 1}
                                    </p>
                                    <QaplaTextField
                                        label={`Instrucciones para participar en ${Languages['es'].names[availableLanguage]}`}
                                        multiline
                                        rows={4}
                                        value={instruction}
                                        onChange={(value) => updateInstructionsToParticipateByLanguage(availableLanguage, index, value)} />
                                    <Button onClick={() => removeInstructionsToParticipate(availableLanguage, index)}>
                                        <CancelIcon
                                            color='secondary'
                                            className={styles.RemovePrize} />
                                    </Button>
                                </React.Fragment>
                            ))}
                            <br/>
                            <Button
                                variant='outlined'
                                color='secondary'
                                className={styles.MarginRight16}
                                onClick={() => addInstructionToParticipate(availableLanguage)}>
                                Agregar Instrucción
                            </Button>
                            <br/>
                        </Grid>
                    ))}
                </Grid>
                <br/>
                <Typography
                    variant='h5'
                    className={styles.ItalicFont}>
                    Fotos y links del evento
                </Typography>
                <br/>
                <QaplaTextField
                    label='Foto de fondo'
                    variant='outlined'
                    type='text'
                    value={backgroundImage}
                    onChange={setBackgroundImage} />
                <QaplaTextField
                    label='Foto de streamer'
                    variant='outlined'
                    type='text'
                    value={streamerPhoto}
                    onChange={setStreamerPhoto} />
                <QaplaTextField
                    label='Foto de la plataforma'
                    variant='outlined'
                    type='text'
                    value={streamingPlatformImage}
                    onChange={setStreamingPlatformImage} />
                <QaplaTextField
                    label='Discord Link'
                    variant='outlined'
                    type='text'
                    value={discordLink}
                    onChange={setDiscordLink} />
                <QaplaTextField
                    label='Streamer Channel Link'
                    variant='outlined'
                    type='text'
                    value={streamerChannelLink}
                    onChange={setStreamerChannelLink} />
                <br/>
                <Typography
                    variant='h5'
                    className={styles.ItalicFont}>
                    Links
                </Typography>
                {eventLinks && Object.keys(eventLinks).map((linkKey) => (
                    <p key={`Link-${linkKey}`}>
                        {`Link ${linkKey}.-`} <a href={eventLinks[linkKey]}>{`${eventLinks[linkKey]}`}</a>
                    </p>
                ))}
                <Typography
                    variant='h5'
                    className={styles.ItalicFont}>
                    Entrada para el evento
                </Typography>
                <br/>
                <QaplaTextField
                    label='Entrada (Qoins)'
                    type='number'
                    value={eventEntry}
                    onChange={(eventEntry) => eventEntry >= 0 && setEventEntry(eventEntry)} />
                <Typography
                    variant='h5'
                    className={styles.ItalicFont}>
                    Manejo de inscripciones
                </Typography>
                <RadioGroup value={acceptAllUsers} onChange={() => setAcceptAllUsers(!acceptAllUsers)}>
                    <FormControlLabel
                        value={true}
                        control={<Radio />}
                        label='Aceptar a todos' />
                    <FormControlLabel
                        value={false}
                        control={<Radio />}
                        label='Revisar solicitudes' />
                </RadioGroup>
                <Typography
                    variant='h5'
                    className={styles.ItalicFont}>
                    Información adicional
                </Typography>
                <FormControlLabel
                    control={<Checkbox checked={featured} onChange={() => setFeatured(!featured)} color='primary' />}
                    label='Evento destacado' />
                <br/>
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
                    {active &&
                        <>
                            {isMatchesEvent ?
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
                                    className={styles.MarginRight16}
                                    onClick={goToEventPrizes}>
                                    Repartir premios
                                </Button>
                            }
                        </>
                    }
                    <Button
                        variant='contained'
                        className={styles.MarginRight16}
                        onClick={goToJoinRequests}>
                        Ver solicitudes
                    </Button>
                    <Button
                        variant='contained'
                        onClick={goToEventParticipants}>
                        Ver participantes
                    </Button>
                </div>
            </form>
        </Container>
    );
}

export default EventDetails;
