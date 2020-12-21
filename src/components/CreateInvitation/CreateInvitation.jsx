import React, { useState } from 'react';
import { Container, Grid, Button } from '@material-ui/core';
import FileCopyIcon from '@material-ui/icons/FileCopy';

import { getRandomString } from '../../utils/utils';
import { invitationCodeExists, saveInvitationCode } from '../../services/database';
import QaplaTextField from '../QaplaTextField/QaplaTextField';

const CreateInvitation = () => {
    const [invitationCode, setInvitationCode] = useState('');

    const generateCode = async () => {
        const invitationCode = getRandomString();
        if (!(await invitationCodeExists(invitationCode))) {
            saveInvitationCode(invitationCode);
            return setInvitationCode(invitationCode);
        } else {
            // If the code exists call this function until it generates a new valid code
            return generateCode();
        }
    }

    /**
     * Save the invitation code on the user clipboard
     */
    const copyInvitationCode = () => {
        if (invitationCode !== '') {
            const field = document.getElementById('InvitationCodeTextField');
            field.value = invitationCode;
            field.select();
            document.execCommand('copy');
            alert('Texto copiado');
        }
    }

    return (
        <Container>
            <Grid container>
                <Grid item md='6'>
                    <br/>
                    <Button disabled={invitationCode !== ''}
                        variant='contained'
                        color='primary'
                        onClick={generateCode}>
                        Generar link de invitación
                    </Button>
                    <Grid item md={12}>
                        <br/>
                        <QaplaTextField
                            disabled={invitationCode === ''}
                            label='Codigo de invitación'
                            value={invitationCode}
                            inputAdornment={<FileCopyIcon />}
                            onChange={() => {}}
                            onPressAdornment={copyInvitationCode}
                            id='InvitationCodeTextField' />
                    </Grid>
                </Grid>
            </Grid>
        </Container>
    );
}

export default CreateInvitation;