import React, { useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Grid from '@material-ui/core/Grid';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';

import QaplaTextField from '../QaplaTextField/QaplaTextField';
import Languages from '../../utilities/Languages';
import { notificateToTopic } from '../../services/functions';

const SendPushNotificationDialog = ({ topic, open, onClose }) => {
    const [titles, setTitle] = useState({ 'es': '', 'en': '' });
    const [descriptions, setDescription] = useState({ 'es': '', 'en': '' });

    const closeDialog = () => {
        setTitle('');
        setDescription('');

        onClose();
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
     * Send the push notification to the given topic and close the modal
     */
    const sendPushNotification = () => {
        notificateToTopic(topic, titles, descriptions);
        closeDialog();
    }

    return (
        <Dialog
            fullWidth={true}
            maxWidth='md'
            open={open}
            onClose={closeDialog}>
            <DialogTitle>
                Enviar push notification
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Ingresa la información para la notificación a enviar
                </DialogContentText>
                <Grid container>
                    {Object.keys(Languages).map((language) => (
                        <React.Fragment key={`PushNotificationTitle-${language}`}>
                            <Grid item md={5}>
                                <QaplaTextField
                                    fullWidth
                                    label={`Titulo en ${Languages['es'].names[language]}`}
                                    placeholder={`Titulo de la notificación en ${Languages['es'].names[language]}`}
                                    value={titles[language] || ''}
                                    onChange={(title) => setTitleByLanguage(language, title)} />
                            </Grid>
                            <Grid item md={1} />
                        </React.Fragment>
                    ))}
                    {Object.keys(Languages).map((language) => (
                        <React.Fragment key={`PushNotificationDescription-${language}`}>
                            <Grid item md={5}>
                                <QaplaTextField
                                    fullWidth
                                    label={`Descripción en ${Languages['es'].names[language]}`}
                                    placeholder={`Descripción de la notificación en ${Languages['es'].names[language]}`}
                                    multiline
                                    rows={5}
                                    value={descriptions[language] || ''}
                                    onChange={(description) => setDescriptionByLanguage(language, description)} />
                                <div style={{ width: 16 }} />
                            </Grid>
                            <Grid item md={1} />
                        </React.Fragment>
                    ))}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button
                    variant='contained'
                    color='default'
                    onClick={closeDialog}>
                    Cancelar
                </Button>
                <Button
                    variant='contained'
                    color='primary'
                    onClick={sendPushNotification}>
                    Aceptar
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default SendPushNotificationDialog;
