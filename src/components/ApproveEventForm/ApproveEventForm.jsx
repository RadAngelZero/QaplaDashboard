import React, { useState } from 'react';
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

import styles from './../EventDetails/EventDetails.module.css';
import QaplaTextField from '../QaplaTextField/QaplaTextField';
import QaplaSelect from '../QaplaSelect/QaplaSelect';
import { deleteEvent, updateEvent, approveStreamRequest, loadPublicEventTemplates, loadPrivateTemplates } from '../../services/database';
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

const ApproveEventForm = ({ user, event, games, eventDuplicated = false }) => {
    const { eventId } = useParams();
    const dateReference = new Date(event.timestamp ? event.timestamp : 0);
    const [titles, setTitle] = useState((event.optionalData && event.optionalData.title) ? event.optionalData.title : { es: '', en: '' });
    const [timestamp, setTime] = useState(event.timestamp ? event.timestamp : '');
    const [date, setDate] = useState(`${dateReference.getDate() >= 10 ? dateReference.getDate() : `0${dateReference.getDate()}`}-${dateReference.getMonth() + 1 >= 10 ? dateReference.getMonth() + 1 : `0${dateReference.getMonth() + 1}`}-${dateReference.getFullYear()}`);
    const [hour, setHour] = useState(`${dateReference.getHours() >= 10 ? dateReference.getHours() : `0${dateReference.getHours()}`}:${dateReference.getMinutes() >= 10 ? dateReference.getMinutes() : `0${dateReference.getMinutes()}`}`);
    const [game, setGame] = useState(event.game ? event.game : '');
    const [descriptions, setDescriptions] = useState((event.optionalData && event.optionalData.descriptions) ? event.optionalData.descriptions : { es: '', en: '' });
    const [prizes, setPrizes] = useState(event.prices ? event.prices : {});
    const [streamerName, setStreamerName] = useState(event.streamerName ? event.streamerName : '');
    const [streamerChannelLink, setStreamerChannelLink] = useState(event.streamerChannelLink ? event.streamerChannelLink : '');
    const [streamerPhoto, setStreamerPhoto] = useState(event.streamerPhoto ? event.streamerPhoto : '');
    const [streamingPlatformImage, setStreamingPlatformImage] = useState('https://cdn.discordapp.com/attachments/696141270757933086/717152413819077050/Logo_Twitch.png');
    const [sponsorImage, setSponsorImage] = useState(event.sponsorImage ? event.sponsorImage : '');
    const [gradientColors, setGradientColors] = useState(event.gradientColors ? event.gradientColors : { primary: '', secondary: '' });
    const [backgroundImage, setBackgroundImage] = useState(event.backgroundImage ? event.backgroundImage : '');
    const [descriptionsTitle, setDescriptionsTitle] = useState((event.optionalData && event.optionalData.descriptionsTitle) ? event.optionalData.descriptionsTitle : { es: '', en: '' });
    const [appStringPrizes, setAppStringPrizes] = useState(event.appStringPrizes ? event.appStringPrizes : {});
    const [instructionsToParticipate, setInstructionsToParticipate] = useState(event.instructionsToParticipate ? event.instructionsToParticipate : {});
    const [streamerGameData, setStreamerGameData] = useState(event.streamerGameData ? event.streamerGameData : {});
    const [eventEntry, setEventEntry] = useState(event.eventEntry ? event.eventEntry : 0);
    const [acceptAllUsers, setAcceptAllUsers] = useState(event.acceptAllUsers ? event.acceptAllUsers : false);
    const [participantNumber, setParticipantNumber] = useState(event.participantNumber ? event.participantNumber : 0);
    const [featured, setFeatured] = useState(event.featured ? event.featured : false);
    const [publicEventsTemplates, setPublicEventsTemplates] = useState(null);
    const [privateEventsTemplates, setPrivateEventsTemplates] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [idStreamer, setIdStreamer] = useState(event.idStreamer);

    const history = useHistory();

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
        const [day, month, year] = date.split('-');
        const selectedDate = new Date(timestamp);

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

        let gradientColorsFiltered = {};
        let validColors = true;
        Object.keys(gradientColors)
            .filter((key) => gradientColors[key] !== '')
            .forEach((key) => {
                if (gradientColors[key].charAt(0) !== '#') {
                    gradientColorsFiltered[key] = `#${gradientColors[key]}`;
                } else {
                    gradientColorsFiltered[key] = gradientColors[key];
                }

                const validColorRegExp = new RegExp('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$');
                if (!validColorRegExp.test(gradientColorsFiltered[key])) {
                    alert('Color de gradiente invalido, verifique antes de continuar');
                    validColors = false;
                }
            });

        if (!validColors) {
            return;
        }

        const eventData = {
            idStreamer,
            title: titles,
            titulo: titles['es'], // <- Temporary field, remove it later
            dateUTC: `${UTCDay}-${UTCMonth}-${selectedDate.getUTCFullYear()}`,
            hourUTC: `${UTCHour}:${UTCMinutes}`,
            tiempoLimite: `${day}-${month}-${year}`,
            hour,
            prices: prizes,
            platform: 'allGames',
            game,
            /**
             * At this point we use the tipoLogro field for the game, in the future we must change it
             * for the game field
             */
            tipoLogro: game,
            descriptions,
            description: descriptions['es'], // <- Temporary field, remove it later
            gradientColors: gradientColorsFiltered,
            streamingPlatformImage,
            sponsorImage,
            streamerName,
            streamerChannelLink,
            streamerPhoto,
            backgroundImage,
            descriptionsTitle,
            appStringPrizes,
            instructionsToParticipate,
            streamerGameData: streamerGameDataFiltered,
            eventEntry: eventEntry ? parseInt(eventEntry) : 0,
            isMatchesEvent: false, // <- Temporary field, remove it later (and also remove reference on cloud functions)
            acceptAllUsers,
            participantNumber,
            featured,
            idLogro: eventId,
            timestamp
        };

        updateEvent(
            eventId,
            eventData,
            (error) => {
                if (error) {
                    console.error(error);
                    alert('Hubo un problema al actualizar el evento');
                    return;
                }

                approveStreamRequest(idStreamer, eventId);
                alert('Evento creado exitosamente');
                history.push('/');
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
     * Sort the prizes object
     */
    const sortPrizeObject = () => {
        return Object.keys(prizes).sort((a, b) => {
            if (a.includes('-') && a.split('-')[1]) {
                a = parseInt(a.split('-')[0]) < parseInt(a.split('-')[1]) ? a.split('-')[1] : a.split('-')[0];
            }

            if (b.includes('-') && b.split('-')[1]) {
                b = parseInt(b.split('-')[0]) < parseInt(b.split('-')[1]) ? b.split('-')[1] : b.split('-')[0];
            }

            return parseInt(b) - parseInt(a);
        });
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
            let lastPlace = sortPrizeObject()[0];

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
     * Save the EventId on the user clipboard
     */
    const copyEventId = () => {
        const field = document.getElementById('EventIdTextField');
        field.value = eventId;
        field.select();
        document.execCommand('copy');
        alert('Texto copiado');
    }

    const setPrizesForParticipantNumber = (participantNumber) => {
        setParticipantNumber(participantNumber);
        setPrizes(fixedPrizesValues[participantNumber]);
    }

    /**
     * Add a custom field for the streamerGameData
     */
    const addInformationNeededForEvent = () => {
        const name = window.prompt('Nombre del campo a agregar:', `${games['allGames'][game].name} ID`);
        if (name) {
            if (!games['allGames'][game].informationNeededForEvent) {
                games['allGames'][game].informationNeededForEvent = {};
            }

            games['allGames'][game].informationNeededForEvent[name] = {};
            games['allGames'][game].informationNeededForEvent[name].hint = {};
            Object.keys(Languages).forEach((language) => {
                games['allGames'][game].informationNeededForEvent[name].hint[language] = name;
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

    const setGradient = (position, value) => {
        setGradientColors({ ...gradientColors, [position]: value });
    }

    /**
     * Load all the eventes templates (privates and publics)
     */
    const loadEventTemplates = async () => {
        setPublicEventsTemplates(await loadPublicEventTemplates() || {});
        if (user && user.uid) {
            setPrivateEventsTemplates(await loadPrivateTemplates(user.uid) || {});
        }
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
            prices,
            sponsorImage,
            backgroundImage,
            gradientColors,
            appStringPrizes,
            instructionsToParticipate,
            streamerGameData,
            eventEntry,
            acceptAllUsers,
            participantNumber,
            featured,
        } = template;

        const title = {
            es: titles.es ? titles.es : template.title.es,
            en: titles.en ? titles.en : template.title.en
        };

        setTitle(title ? title : { 'es': '', 'en': '' });

        template.descriptions = {
            es: descriptions.es ? descriptions.es : template.descriptions.es,
            en: descriptions.en ? descriptions.en : template.descriptions.en
        };

        setDescriptions(template.descriptions ? template.descriptions : { 'es': '', 'en': '' });

        template.descriptionsTitle = {
            es: descriptionsTitle.es ? descriptionsTitle.es : template.descriptionsTitle.es,
            en: descriptionsTitle.en ? descriptionsTitle.en : template.descriptionsTitle.en
        };

        setDescriptionsTitle(template.descriptionsTitle ? template.descriptionsTitle : { 'es': '', 'en': '' });
        setPrizes(prices ? prices : {});
        setSponsorImage(sponsorImage ? sponsorImage : '');
        setBackgroundImage(backgroundImage ? backgroundImage : '');
        setGradientColors(gradientColors ? gradientColors : { primary: '', secondary: '' });
        setAppStringPrizes(appStringPrizes ? appStringPrizes : {});
        setInstructionsToParticipate(instructionsToParticipate ? instructionsToParticipate : {});
        setStreamerGameData(streamerGameData ? streamerGameData : {});
        setEventEntry(eventEntry ? eventEntry : 0);
        setAcceptAllUsers(acceptAllUsers ? acceptAllUsers : false);
        setParticipantNumber(participantNumber ? participantNumber : 0);
        setFeatured(featured ? featured : false);
    }

    return (
        <Container maxWidth='lg' className={styles.Container}>
            <Typography
                variant='h3'
                className={styles.EventTitle}>
                Evento: {titles['es']}
            </Typography>
            <Typography
                variant='h5'
                className={styles.ItalicFont}>
                Plantilla (opcional)
            </Typography>
            {publicEventsTemplates || privateEventsTemplates ?
                <QaplaSelect
                    label='Plantilla'
                    id='Template'
                    value={selectedTemplate}
                    onChange={setTemplate}>
                    <option aria-label='None' value='' />
                    {privateEventsTemplates && Object.keys(privateEventsTemplates).map((privateTemplateKey) => (
                        <option
                            key={privateTemplateKey}
                            value={privateTemplateKey}>{privateEventsTemplates[privateTemplateKey].templateName}</option>
                    ))}
                    {privateEventsTemplates && Object.keys(publicEventsTemplates).map((publicTemplateKey) => (
                        <option
                            key={publicTemplateKey}
                            value={publicTemplateKey}>{publicEventsTemplates[publicTemplateKey].templateName}</option>
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
            <form className={styles.MarginTop16}>
                <Typography
                    variant='h5'
                    className={styles.ItalicFont}>
                    Información del evento
                </Typography>
                <br/>
                <Grid container>
                    {!eventDuplicated &&
                        <Grid item md={12}>
                            <QaplaTextField
                                label='ID del evento'
                                value={eventId}
                                inputAdornment={<FileCopyIcon />}
                                onChange={() => {}}
                                onPressAdornment={copyEventId}
                                id='EventIdTextField' />
                        </Grid>
                    }
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
                    Colores del evento (app card)
                </Typography>
                <br/>
                <Grid container>
                    <Grid item md={4} key={`Gradient-Primary`}>
                        <QaplaTextField
                            label={'Primary Gradient (Hexadecimal)'}
                            variant='outlined'
                            placeholder='#FFFFFF'
                            value={gradientColors['primary'] || ''}
                            onChange={(value) => setGradient('primary', value)} />
                    </Grid>
                    <Grid item md={4} key={`Gradient-Secondary`}>
                        <QaplaTextField
                            label={'Secondary Gradient (Hexadecimal)'}
                            variant='outlined'
                            placeholder='#FFFFFF'
                            value={gradientColors['secondary'] || ''}
                            onChange={(value) => setGradient('secondary', value)} />
                    </Grid>
                    <br/>
                </Grid>
                <Typography
                    variant='h5'
                    className={styles.ItalicFont}>
                    Juego
                </Typography>
                <br/>
                <Grid container>
                    <Grid item md={4}>
                        <QaplaSelect
                            label='Juego'
                            id='Game'
                            disabled={!games['allGames']}
                            value={game}
                            onChange={setSelectedGame}>
                            <option aria-label='None' value='' />
                            {games && games['allGames'] && Object.keys(games['allGames']).map((gameKey) => (
                                <option key={gameKey} value={gameKey}>
                                    {games['allGames'][gameKey].gameName}
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
                    {game && games['allGames'] && games['allGames'][game] &&
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
                            label='Hora'
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
                <Typography
                    variant='h5'
                    className={styles.ItalicFont}>
                    Qoins a repartir
                </Typography>
                <br/>
                {prizes && sortPrizeObject().reverse().map((prizeKey, index) => (
                    <React.Fragment key={`Prize-${index}`}>
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
                    Fotos, multimedia y links del evento
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
                    label='Foto de patrocinador'
                    variant='outlined'
                    type='text'
                    value={sponsorImage}
                    onChange={setSponsorImage} />
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
                    {!eventDuplicated &&
                        <Button
                            variant='contained'
                            color='secondary'
                            className={styles.MarginRight16}
                            onClick={removeEventFromDatabase}>
                            Rechazar
                        </Button>
                    }
                    <Button
                        variant='contained'
                        color='primary'
                        className={styles.MarginRight16}
                        onClick={updateEventOnDatabase}>
                        {'Crear Evento'}
                    </Button>
                </div>
            </form>
        </Container>
    );
}

export default ApproveEventForm;