import React, { useState } from 'react';
import { Container, Grid, Button, FormControlLabel, Checkbox } from '@material-ui/core';
import FileCopyIcon from '@material-ui/icons/FileCopy';

import { getRandomString } from '../../utils/utils';
import { invitationCodeExists, saveInvitationCode } from '../../services/database';
import QaplaTextField from '../QaplaTextField/QaplaTextField';

const CreateInvitation = () => {
    const [invitationCode, setInvitationCode] = useState('');
    const [freeTrial, setFreeTrial] = useState(false);
    const [streamsIncluded, setStreamsIncluded] = useState(8);
    const [redemptionsPerStream, setRedemptionsPerStream] = useState(40);

    const generateCode = async () => {
        const invitationCode = getRandomString();
        if (!(await invitationCodeExists(invitationCode))) {
            try {
                await saveInvitationCode(invitationCode, freeTrial, { streamsIncluded, redemptionsPerStream });
                setFreeTrial(false);
                return setInvitationCode(invitationCode);
            } catch (error) {
                console.log(error);
                alert('Error al generar el codigo');
            }
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
            field.setSelectionRange(0, 99999);
            navigator.clipboard.writeText(field.value);
            alert('Texto copiado');
        }
    }

    return (
        <Container>
            <Grid container>
                <Grid item md='6'>
                    <br/>
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
                        <FormControlLabel
                            control={<Checkbox checked={freeTrial} onChange={() => setFreeTrial(!freeTrial)} />}
                            label='Free Trial' />
                        {freeTrial &&
                            <>
                                <QaplaTextField
                                    label='Numero de streams'
                                    value={streamsIncluded}
                                    onChange={setStreamsIncluded} />
                                <QaplaTextField
                                    label='Numero de streams'
                                    value={redemptionsPerStream}
                                    onChange={setRedemptionsPerStream} />
                            </>
                        }
                    </Grid>
                    <Button disabled={invitationCode !== ''}
                        variant='contained'
                        color='primary'
                        onClick={generateCode}>
                        Generar link de invitación
                    </Button>
                </Grid>
            </Grid>
        </Container>
    );
}

export default CreateInvitation;