import React, { useState, useEffect, useReducer } from 'react';
import {
    makeStyles,
    Container,
    Typography,
    Grid,
    Button
} from '@material-ui/core';

import { loadLeaderboardPrizes, updateLeaderboardPrizes } from '../../services/database';
import QaplaTextField from '../QaplaTextField/QaplaTextField';
import ContainedButton from '../ContainedButton/ContainedButton';

const useStyles = makeStyles(() => ({
    container: {
        marginTop: '1em',
        marginBottom: '1em'
    },
    marginTop: {
        marginTop: '1rem'
    },
    italicFont: {
        fontStyle: 'italic'
    }
}));

const LeaderboardPrizes = () => {
    const [prizes, setPrizes] = useState([]);
    const classes = useStyles();

    useEffect(() => {
        async function loadPrizes() {
            const prizes = await loadLeaderboardPrizes();
            if (prizes.exists()) {
                setPrizes(prizes.val());
            }
        }

        loadPrizes();
    }, []);

    const updatePrize = (index, field, value) => {
        const prizesCopy = [...prizes];

        prizesCopy[index][field] = value;

        setPrizes(prizesCopy);
    }

    const updateColors = (index, field, value) => {
        const prizesCopy = [...prizes];

        prizesCopy[index].backgroundColors[field] = value;

        setPrizes(prizesCopy);
    }

    const save = () => updateLeaderboardPrizes(prizes);

    return (
        <Container maxWidth='lg' className={classes.container}>
            {prizes.map((prize, index) => (
                <Grid container>
                    <Grid item md={12}>
                        <Typography
                            variant='h5'>
                            Premio {index + 1}
                        </Typography>
                    </Grid>
                    <Grid item md={6}>
                        <Typography
                            variant='h5'
                            className={classes.italicFont}>
                            Datos
                        </Typography>
                    </Grid>
                    <Grid item md={6}>
                        <Typography
                            variant='h5'
                            className={classes.italicFont}>
                            Colores
                        </Typography>
                    </Grid>
                    <Grid item md={3}>
                        <QaplaTextField
                            className={classes.marginTop}
                            variant='outlined'
                            label='Titulo'
                            value={prize.title}
                            onChange={(value) => updatePrize(index, 'title', value)} />
                    </Grid>
                    <Grid item md={3}>
                        <QaplaTextField
                            className={classes.marginTop}
                            variant='outlined'
                            label='Descripción'
                            value={prize.description}
                            onChange={(value) => updatePrize(index, 'description', value)} />
                    </Grid>
                    <Grid item md={3}>
                        <QaplaTextField
                            variant='outlined'
                            label='Color Primario'
                            value={prize.backgroundColors.primaryColor}
                            onChange={(value) => updateColors(index, 'primaryColor', value)} />
                    </Grid>
                    <Grid item md={3}>
                        <QaplaTextField
                            variant='outlined'
                            label='Color Secundario'
                            value={prize.backgroundColors.secondaryColor}
                            onChange={(value) => updateColors(index, 'secondaryColor', value)} />
                    </Grid>
                    <Grid item md={12}>
                        <Typography
                            variant='h5'
                            className={classes.italicFont}>
                            Imagen
                        </Typography>
                    </Grid>
                    <Grid item md={3} className={classes.marginTop}>
                        <QaplaTextField
                            variant='outlined'
                            label='Imagen de fondo'
                            value={prize.backgroundImage}
                            onChange={(value) => updatePrize(index, 'backgroundImage', value)} />
                    </Grid>
                </Grid>
            ))}
            <Button size='large' style={{ marginTop: '2rem' }} variant='contained' onClick={save} color='secondary'>
                Guardar Cambios
            </Button>
        </Container>
    );
}

export default LeaderboardPrizes;
