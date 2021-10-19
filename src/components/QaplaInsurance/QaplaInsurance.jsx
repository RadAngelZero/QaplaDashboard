import React, { useState, useEffect } from 'react';
import { Container, Button, Typography, Grid } from '@material-ui/core';

import QaplaTextField from '../QaplaTextField/QaplaTextField';
import { getUserUserName, giveQoinsAndXQToUser } from '../../services/database';

const QaplaInsurance = () => {
    const [uid, setUid] = useState('');
    const [userName, setUserName] = useState('');
    const [userExists, setUserExists] = useState(false);
    const [userWasValidated, setUserWasValidated] = useState(false);
    const [XQToGive, setXQToGive] = useState(0);
    const [qoinsToGive, setQoinsToGive] = useState(0);

    const validateUser = async () => {
        setUserWasValidated(false);

        const userName = await getUserUserName(uid);
        if (userName.exists()) {
            setUserName(userName.val());
            setUserExists(true);
        } else {
            setUserExists(false);
        }

        setUserWasValidated(true);
    }

    const sendRewardsToUser = async () => {
        const xq = parseInt(XQToGive);
        const qoins = parseInt(qoinsToGive)
        if (userExists && userWasValidated) {
            if (!isNaN(xq) && !isNaN(qoins) && xq > 0 && qoins > 0) {
                const error = await giveQoinsAndXQToUser(uid, xq, qoins, (errorString) => alert(errorString));

                if (!error) {
                    alert('La XQ y los Qoins fueron repartidos exitosamente');
                    setUid('');
                    setUserName('');
                    setUserExists(false);
                    setUserWasValidated(false);
                } else {
                    alert(error);
                    console.log(error);
                }

            } else {
                alert('El valor de XQ o Qoins no es valido, debe ser un numero mayor a 0');
            }
        } else {
            alert('El usuario no fue validado correctamente, recarga la pagina e intenta de nuevo');
        }
    }

    return (
        <Container maxWidth='lg' style={{ marginTop: '2em' }}>
            <Grid container>
                <Grid item xs={6}>
                    <QaplaTextField autoFocus
                        label='User ID'
                        value={uid}
                        onChange={setUid}
                        error={userWasValidated && !userExists}
                        helperText={userWasValidated && !userExists ? 'Usuario no encontrado' : ''} />
                    <br />
                    {userExists &&
                        <>
                            <QaplaTextField
                                label='XQ'
                                value={XQToGive}
                                onChange={setXQToGive}
                                type='number' />
                            <br />
                            <QaplaTextField
                                label='Qoins'
                                value={qoinsToGive}
                                onChange={setQoinsToGive}
                                type='number' />
                            <br />
                            <Typography>
                                {`${userName} recibira ${parseInt(XQToGive)} XQ y ${parseInt(qoinsToGive)} Qoins`}
                            </Typography>
                            <br />
                        </>
                    }
                </Grid>
                <Grid item xs={6}></Grid>
            </Grid>
            <Button
                variant='contained'
                color='primary'
                style={{ marginRight: 16 }}
                onClick={!userExists ? validateUser : sendRewardsToUser}>
                {!userExists ?
                    'Validar usuario'
                    :
                    'Dar XQ y Qoins'
                }
            </Button>
        </Container>
    );
}

export default QaplaInsurance;