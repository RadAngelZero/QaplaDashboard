import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import CancelIcon from '@material-ui/icons/Cancel';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';

import styles from './CreateEvent.module.css';
import QaplaTextField from '../QaplaTextField/QaplaTextField';
import QaplaSelect from '../QaplaSelect/QaplaSelect';
import { createEvent, updateEvent, saveEventTemplate, loadPublicEventTemplates, loadPrivateTemplates } from '../../services/database';
import Languages from '../../utilities/Languages';
import { createEventInvitationDeepLink } from '../../services/links';

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

const CreateEvent = ({ games, platforms, template = false, user = {} }) => {
    const [currentSection, setCurrentSection] = useState(0);
    const [titles, setTitle] = useState({ 'es': '', 'en': '' });
    const [date, setDate] = useState();
    const [hour, setHour] = useState();
    const [discordLink, setDiscordLink] = useState('');
    const [platform, setPlatform] = useState('');
    const [game, setGame] = useState('');
    const [descriptions, setDescriptions] = useState({ 'es': '', 'en': '' });
    const [prizes, setPrizes] = useState({});
    const [eventLinks, setEventLinks] = useState([]);
    const [isMatchesEvent, setIsMatchesEvent] = useState(true);
    const [streamerName, setStreamerName] = useState('');
    const [streamerChannelLink, setStreamerChannelLink] = useState('');
    const [streamerPhoto, setStreamerPhoto] = useState('');
    const [streamingPlatformImage, setStreamingPlatformImage] = useState('');
    const [backgroundImage, setBackgroundImage] = useState('');
    const [descriptionsTitle, setDescriptionsTitle] = useState({});
    const [appStringPrizes, setAppStringPrizes] = useState({});
    const [instructionsToParticipate, setInstructionsToParticipate] = useState({});
    const [streamerGameData, setStreamerGameData] = useState({});
    const [eventEntry, setEventEntry] = useState(0);
    const [acceptAllUsers, setAcceptAllUsers] = useState(true);
    const [participantNumber, setParticipantNumber] = useState(0);
    const [isPrivateTemplate, setIsPrivateTemplate] = useState(true);
    const [publicEventsTemplates, setPublicEventsTemplates] = useState({});
    const [privateEventsTemplates, setPrivateEventsTemplates] = useState({});
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const history = useHistory();

    /**
     * Format the dates and save the event on the database
     */
    const saveEventOnDatabase = async (e) => {
        e.preventDefault();
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

        const eventData = {
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
            streamerGameData,
            streamerName,
            streamerChannelLink,
            streamerPhoto,
            backgroundImage,
            descriptionsTitle,
            appStringPrizes,
            instructionsToParticipate,
            eventEntry: parseInt(eventEntry),
            isMatchesEvent,
            acceptAllUsers,
            participantNumber
        };

        if (template) {
            saveEventTemplate(user.uid, eventData, isPrivateTemplate, (error) => {
                if (error) {
                    alert('Error al guardar la plantilla');
                    return console.error(error);
                }

                alert('Plantilla guardada correctamente');
                history.push('/');
            });
        } else {
            createEvent(eventData,
                async (error, key) => {
                    if (error) {
                        console.error(error);
                        alert('Hubo un problema al crear el evento');
                        return;
                    }

                    const links = {};

                    /**
                     * We create one link for every language we support
                     */
                    for (let i = 0; i < Object.keys(Languages).length; i++) {
                        const language = Object.keys(Languages)[i];
                        links[language] = await createEventInvitationDeepLink(key, titles[language], descriptions[language], backgroundImage);
                    }

                    setEventLinks(links);
                    updateEvent(key, { eventLinks: links });
                    alert('Evento publicado exitosamente');
                    history.push('');
                }
            );
        }
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

                return parseInt(b) - parseInt(a);
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

    const setPrizesForParticipantNumber = (participantNumber) => {
        setParticipantNumber(participantNumber);
        setPrizes(fixedPrizesValues[participantNumber]);
    }

    /**
     * Send the user to the next step of the form
     */
    const goToNextStep = () => {
        let allRight = true;
        switch (currentSection) {
            case 0:
                if (!streamerName ||
                    !titles['en'] ||
                    !titles['es'] ||
                    !descriptions['en'] ||
                    !descriptions['es'] ||
                    !date ||
                    !hour
                    ) {
                    allRight = false;
                }
                break;
            case 3:
                if (!backgroundImage ||
                    !streamerPhoto ||
                    !streamingPlatformImage
                ) {
                    allRight = false;
                }
                break;
            default:
                break;
        }

        if (allRight || template) {
            setCurrentSection(currentSection + 1);
        } else {
            alert('Revisa que los campos esten llenados de forma correcta');
        }
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

    /**
     * Update the selected template (also all the fields in the template)
     * @param {string} selectedTemplate Key of the selected template
     */
    const setTemplate = (selectedTemplate) => {
        let template = {};
        if (selectedTemplate) {
            template = privateEventsTemplates[selectedTemplate] ? privateEventsTemplates[selectedTemplate] : publicEventsTemplates[selectedTemplate];
        }
        setSelectedTemplate(selectedTemplate);
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
            participantNumber
        } = template;
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
    }

    /**
     * Load all the eventes templates (privates and publics)
     */
    const loadEventTemplates = async () => {
        setPublicEventsTemplates(await loadPublicEventTemplates());
        if (user && user.uid) {
            setPrivateEventsTemplates(await loadPrivateTemplates(user.uid));
        }
    }

    return (
        <Container maxWidth='lg' className={styles.Container}>
            <form onSubmit={saveEventOnDatabase}>
                <Typography
                    variant='h3'
                    className={styles.EventTitle}>
                    {template ? `Plantilla: ${titles['es']}` : `Evento: ${titles['es']}`}
                </Typography>
                {currentSection === 0 &&
                    <>
                        {!template &&
                            <>
                                <Typography
                                    variant='h5'
                                    className={styles.ItalicFont}>
                                    Plantilla (opcional)
                                </Typography>
                                <br/>
                                {Object.keys(publicEventsTemplates).length > 0 || Object.keys(privateEventsTemplates).length > 0 ?
                                    <QaplaSelect
                                        label='Plantilla'
                                        id='Template'
                                        value={selectedTemplate}
                                        onChange={setTemplate}>
                                        <option aria-label='None' value='' />
                                        {Object.keys(privateEventsTemplates).map((privateTemplateKey) => (
                                            <option
                                                key={privateTemplateKey}
                                                value={privateTemplateKey}>{privateEventsTemplates[privateTemplateKey].title['es']}</option>
                                        ))}
                                        {Object.keys(publicEventsTemplates).map((publicTemplateKey) => (
                                            <option
                                                key={publicTemplateKey}
                                                value={publicTemplateKey}>{publicEventsTemplates[publicTemplateKey].title['es']}</option>
                                        ))}
                                    </QaplaSelect>
                                    :
                                    <Button
                                        variant='contained'
                                        color='secondary'
                                        disabled={user === null || (typeof user !== 'object' && Object.keys(user).length <= 0)}
                                        onClick={loadEventTemplates}>
                                        Cargar plantillas
                                    </Button>
                                }
                                <br/>
                                <br/>
                            </>
                        }
                        {template && user && user.admin &&
                            <>
                                <Typography
                                    variant='h5'
                                    className={styles.ItalicFont}>
                                    Tipo de plantilla
                                </Typography>
                                <RadioGroup value={isPrivateTemplate} onChange={() => setIsPrivateTemplate(!isPrivateTemplate)}>
                                    <Grid container>
                                        <Grid item md={3}>
                                            <FormControlLabel
                                                value={true}
                                                control={<Radio />}
                                                label='Plantilla Privada' />
                                        </Grid>
                                        <Grid item md={3}>
                                            <FormControlLabel
                                                value={false}
                                                control={<Radio />}
                                                label='Plantilla publica' />
                                        </Grid>
                                    </Grid>
                                </RadioGroup>
                            </>
                        }
                        <Typography
                            variant='h5'
                            className={styles.ItalicFont}>
                            Información del evento
                        </Typography>
                        <br/>
                        <Grid container>
                            <Grid item md={12}>
                                <QaplaTextField
                                    required
                                    label='Nombre del streamer'
                                    variant='outlined'
                                    value={streamerName}
                                    onChange={setStreamerName} />
                            </Grid>
                            {Object.keys(Languages['es'].names).map((availableLanguage) => (
                                <Grid item md={3} lg={4} key={`Description-${availableLanguage}`}>
                                    <QaplaTextField
                                        required
                                        key={`Title-${availableLanguage}`}
                                        label={`Titulo ${Languages['es'].names[availableLanguage]}`}
                                        variant='outlined'
                                        value={titles[availableLanguage] || ''}
                                        onChange={(value) => setTitleByLanguage(availableLanguage, value)} />
                                </Grid>
                            ))}
                            <br/>
                        </Grid>
                        <Grid container>
                            {Object.keys(Languages['es'].names).map((availableLanguage) => (
                                <Grid item md={3} lg={4} key={`Description-${availableLanguage}`}>
                                    <QaplaTextField
                                        label={`Titulo de la descripción ${Languages['es'].names[availableLanguage]}`}
                                        value={descriptionsTitle[availableLanguage]}
                                        onChange={(value) => setDescriptionsTitleByLanguage(availableLanguage, value)} />
                                    <br/>
                                    <QaplaTextField
                                        required
                                        label={`Descripción ${Languages['es'].names[availableLanguage]}`}
                                        multiline
                                        rows={4}
                                        value={descriptions[availableLanguage] || ''}
                                        onChange={(value) => setDescriptionByLanguage(availableLanguage, value)} />
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
                                    onChange={(value) => setSelectedGame(value)}>
                                    <option aria-label='None' value='' />
                                    {games && games[platform] && Object.keys(games[platform]).map((gameKey) => (
                                        <option key={gameKey} value={gameKey}>
                                            {games[platform][gameKey].name}
                                        </option>
                                    ))}
                                </QaplaSelect>
                            </Grid>
                        </Grid>
                        {game && games[platform] && games[platform][game] && games[platform][game].informationNeededForEvent &&
                            <Typography
                                variant='h5'
                                className={styles.ItalicFont}>
                                Información para los participantes
                            </Typography>
                        }
                        <Grid container>
                            {game && games[platform] && games[platform][game] && games[platform][game].informationNeededForEvent && Object.keys(games[platform][game].informationNeededForEvent).map((streamerDataFieldKey) => (
                                <Grid item md={3} key={`streamerGameField-${streamerDataFieldKey}`}>
                                    <br/>
                                    <QaplaTextField
                                        label={streamerDataFieldKey}
                                        placeholder={games[platform][game].informationNeededForEvent[streamerDataFieldKey].hint['es']}
                                        value={streamerGameData[streamerDataFieldKey] || ''}
                                        onChange={(value) => setStreamerGameData({ ...streamerGameData, [streamerDataFieldKey]: value })} />
                                </Grid>
                            ))}
                            <br/>
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
                            <Grid item md={3} lg={4}>
                                <QaplaTextField
                                    required
                                    label='Fecha (CST) Año-mes-día'
                                    variant='outlined'
                                    type='date'
                                    value={date}
                                    onChange={setDate} />
                            </Grid>
                            <Grid item md={3} lg={4}>
                                <QaplaTextField
                                    required
                                    label='Hora (CST 24 horas)'
                                    variant='outlined'
                                    type='time'
                                    value={hour}
                                    onChange={setHour} />
                            </Grid>
                        </Grid>
                        <br/>
                    </>
                }
                {currentSection === 1 &&
                    <>
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
                                </Grid>
                            ))}
                        </Grid>
                        <FormControlLabel
                            control={<Checkbox checked={isMatchesEvent} onChange={() => setIsMatchesEvent(!isMatchesEvent)} color='primary' />}
                            label='Evento de retas' />
                            <Typography
                                variant='h5'
                                className={styles.ItalicFont}>
                                Qoins a repartir
                            </Typography>
                            <br/>
                            {prizes && Object.keys(prizes).sort((a, b) => parseInt(b) < parseInt(a)).map((prizeKey, index) => (
                                <React.Fragment key={`PrizeNumberKey-${index}`}>
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
                    </>
                }
                {currentSection === 2 &&
                    <>
                        <Grid container>
                            {Object.keys(Languages['es'].names).map((availableLanguage) => (
                                <Grid item md={6} key={`InstructionsToParticipate-${availableLanguage}`}>
                                    <Typography>
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
                    </>
                }
                {currentSection === 3 &&
                    <>
                        <Typography
                            variant='h5'
                            className={styles.ItalicFont}>
                            Fotos y links del evento
                        </Typography>
                        <br/>
                        <Grid container>
                            <Grid md={12}>
                                <QaplaTextField
                                    required
                                    label='Foto de streamer'
                                    variant='outlined'
                                    type='text'
                                    value={streamerPhoto}
                                    onChange={setStreamerPhoto} />
                            </Grid>
                            <Grid md={4}>
                                <QaplaTextField
                                    required
                                    label='Foto de fondo'
                                    variant='outlined'
                                    type='text'
                                    value={backgroundImage}
                                    onChange={setBackgroundImage} />
                            </Grid>
                            <Grid md={4}>
                                <QaplaTextField
                                    required
                                    label='Foto de la plataforma'
                                    variant='outlined'
                                    type='text'
                                    value={streamingPlatformImage}
                                    onChange={setStreamingPlatformImage} />
                            </Grid>
                        </Grid>
                        <Grid container>
                            <Grid md={4}>
                                <QaplaTextField
                                    label='Discord Link'
                                    variant='outlined'
                                    type='text'
                                    value={discordLink}
                                    onChange={setDiscordLink} />
                            </Grid>
                            <Grid md={4}>
                                <QaplaTextField
                                    label='Streamer Channel Link'
                                    variant='outlined'
                                    type='text'
                                    value={streamerChannelLink}
                                    onChange={setStreamerChannelLink} />
                            </Grid>
                        </Grid>
                        <br/>
                    </>
                }
                {currentSection === 4 &&
                    <>
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
                        <br/>
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
                        <br/>
                        {eventLinks.length > 0 &&
                            <Typography
                                variant='h5'
                                className={styles.ItalicFont}>
                                Links
                            </Typography>
                        }
                        {Object.keys(eventLinks).map((linkKey) => (
                            <p key={linkKey}>
                                {`${linkKey}.-`} <a href={eventLinks[linkKey]}>{`${eventLinks[linkKey]}`}</a>
                            </p>
                        ))}
                    </>
                }
                <div className={styles.MarginTop16}>
                    <>
                        {currentSection > 0 &&
                            <Button
                                variant='contained'
                                onClick={() => setCurrentSection(currentSection - 1)}
                                className={styles.MarginRight16}>
                                Atras
                            </Button>
                        }
                        {currentSection < 4 &&
                            <Button
                                variant='contained'
                                color='primary'
                                className={styles.MarginRight16}
                                onClick={goToNextStep}>
                                Siguiente
                            </Button>
                        }
                        <Button
                            disabled={currentSection !== 4}
                            variant='contained'
                            color='primary'
                            type='submit'>
                                {template ? 'Guardar Plantilla' : 'Crear evento'}
                        </Button>
                    </>
                </div>
            </form>
        </Container>
    );
}

export default CreateEvent;
