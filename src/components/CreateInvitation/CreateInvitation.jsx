import React, { useState } from 'react';
import { Container, Grid, Button } from '@material-ui/core';
import { getRandomString } from '../../utils/utils';
import { invitationCodeExists, saveInvitationCode } from '../../services/database';



const CreateInvitation = () => {
    const [invitationCode, setInvitationCode] = useState('');

    const generateCode = async () => {
        const invitationCode = getRandomString();
        if (!(await invitationCodeExists(invitationCode))) {
            saveInvitationCode(invitationCode);
            return setInvitationCode(`https://qapplaapp.web.app/createAccount/${invitationCode}`);
        } else {
            // If the code exists call this function until it generates a new valid code
            return generateCode();
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
                    <p>
                        {invitationCode}
                    </p>
                </Grid>
            </Grid>
        </Container>
    );
}

export default CreateInvitation;