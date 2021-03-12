import React, { useState, useEffect } from 'react';
import { Container, Grid, Button } from '@material-ui/core';
import QaplaTextField from '../QaplaTextField/QaplaTextField';
import { getLeaderboardWinnersNumber, setLeaderboardWinnersNumber } from '../../services/database';

const LeaderboardWinners = () => {
    const [numberOfWinners, setNumberOfWinners] = useState(0);

    useEffect(() => {
        async function getWinners() {
            const winners = await getLeaderboardWinnersNumber();
            return setNumberOfWinners(winners.exists() ? winners.val() : 0);
        }

        getWinners();
    }, []);

    const saveWinners = () => {
        if (parseInt(numberOfWinners)) {
            setLeaderboardWinnersNumber(parseInt(numberOfWinners));
            alert('Numero de ganadores guardado');
        } else {
            alert('Valor invalido');
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
                            label='Numero de ganadores'
                            value={numberOfWinners || ''}
                            onChange={setNumberOfWinners} />
                    </Grid>
                    <Button
                        onClick={saveWinners}
                        variant='contained'
                        color='primary'>
                        Guardar
                    </Button>
                </Grid>
            </Grid>
        </Container>
    );
}

export default LeaderboardWinners;