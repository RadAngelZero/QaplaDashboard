import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import CancelIcon from '@material-ui/icons/Cancel';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import styles from './CreateEvent.module.css';
import QaplaTextField from '../QaplaTextField/QaplaTextField';
import QaplaSelect from '../QaplaSelect/QaplaSelect';
import { createEvent, updateEvent } from '../../services/database';
import Languages from '../../utilities/Languages';
import { createEventInvitationDeepLink } from '../../services/links';

const CreateEvent = ({ games, platforms }) => {
    const [titles, setTitle] = useState({ 'es': '', 'en': '' });
    const [date, setDate] = useState();
    const [hour, setHour] = useState();
    const [photoUrl, setPhotoUrl] = useState('');
    const [discordLink, setDiscordLink] = useState('');
    const [platform, setPlatform] = useState('');
    const [game, setGame] = useState('');
    const [descriptions, setDescription] = useState({ 'es': '', 'en': '' });
    const [prizes, setPrizes] = useState();
    const [eventLinks, setEventLinks] = useState([]);
    const [isMatchesEvent, setIsMatchesEvent] = useState(true);

    /**
     * Format the dates and save the event on the database
     */
    const saveEventOnDatabase = async () => {
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

        createEvent({
                title: titles,
                titulo: titles['es'], // <- Temporary field, remove it later
                dateUTC: `${UTCDay}-${UTCMonth}-${selectedDate.getUTCFullYear()}`,
                hourUTC: `${UTCHour}:${UTCMinutes}`,
                tiempoLimite: `${day}-${month}-${year}`,
                hour,
                photoUrl,
                discordLink,
                platform,
                prices: isMatchesEvent ? prizes : null,
                game,
                /**
                 * At this point we use the tipoLogro field for the game, in the future we must change it
                 * for the game field
                 */
                tipoLogro: game,
                descriptions,
                description: descriptions['es'] // <- Temporary field, remove it later
            },
            async (error, key) => {
                if (error) {
                    console.error(error)
                } else {
                    const links = {};

                    /**
                     * We create one link for every language we support
                     */
                    for (let i = 0; i < Object.keys(Languages).length; i++) {
                        const language = Object.keys(Languages)[i];
                        links[language] = await createEventInvitationDeepLink(key, titles[language], descriptions[language], photoUrl);
                    }

                    setEventLinks(links);
                    updateEvent(key, { eventLinks: links });
                }
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
        setDescription({ ...descriptions, [language]: value });
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

    return (
        <Container maxWidth='lg' className={styles.Container}>
            <Typography variant='h3' component='h3'>
                Evento: {titles['es']}
            </Typography>
            <form className={styles.MarginTop16}>
                {Object.keys(Languages['es'].names).map((availableLanguage) => (
                    <QaplaTextField
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
                        <option value={platformKey}>{platforms[platformKey].name}</option>
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
                        label={`Descripción ${Languages['es'].names[availableLanguage]}`}
                        multiline
                        rows={4}
                        value={descriptions[availableLanguage]}
                        onChange={(value) => setDescriptionByLanguage(availableLanguage, value)} />
                ))}
                <Typography>
                    Links
                </Typography>
                {eventLinks && Object.keys(eventLinks).map((linkKey) => (
                    <p>
                        {`${linkKey}.-`} <a href={eventLinks[linkKey]}>{`${eventLinks[linkKey]}`}</a>
                    </p>
                ))}
                <FormControlLabel
                    control={<Checkbox checked={isMatchesEvent} onChange={() => setIsMatchesEvent(!isMatchesEvent)} name="checkedA" color='primary' />}
                    label='Evento de retas' />
                {isMatchesEvent &&
                    <>
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
                    </>
                }
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
