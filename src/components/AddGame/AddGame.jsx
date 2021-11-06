import React, { useState } from 'react';
import { makeStyles, Container, Button, Grid, LinearProgress } from '@material-ui/core';

import QaplaTextField from '../QaplaTextField/QaplaTextField';
import { uploadImage } from '../../services/storage';
import { addGameToCategories } from '../../services/database';

const useStyles = makeStyles(() => ({
    input: {
      display: 'none'
    },
}));

const AddGame = () => {
    const [gameName, setGameName] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadImageStatus, setUploadImageStatus] = useState(0);

    const classes = useStyles();

    const loadImage = (e) => {
        setImage(e.target.files[0]);

        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setImagePreview(reader.result);
        });

        reader.readAsDataURL(e.target.files[0]);
    }

    const cleanForm = () => {
        setGameName('');
        setImage(null);
        setImagePreview(null);
        setUploadImageStatus(0);
    }

    const uploadGame = async () => {
        // Game but without blank spaces
        const gameKey = gameName.replace(/\s+/g, '');
        uploadImage(
            image,
            '/gamesResourcesImages',
            (progressValue) => setUploadImageStatus(progressValue * 100),
            (error) => { alert('Error al agregar imagen'); console.log(error); },
            async (url) => {
                try {
                    await addGameToCategories(gameKey, gameName, url);
                    alert('Juego agregado correctamente');
                    cleanForm();
                } catch (error) {
                    alert('Hubo un error al agregar el juego en la base de datos');
                    console.log(error);
                }
            }
        );
    }

    return (
        <Container maxWidth='lg' style={{ marginTop: '2em' }}>
            <Grid container>
                <Grid item xs={12} sm={6}>
                    <QaplaTextField
                        label='Nombre del juego'
                        value={gameName}
                        onChange={setGameName} />
                    <br />
                    <input
                        accept='image/*'
                        className={classes.input}
                        id='contained-button-file'
                        onChange={loadImage}
                        type='file' />
                    <label htmlFor='contained-button-file'>
                        <Button variant='contained' color='primary' component='span'>
                            {!image ?
                                'Cargar Imagen'
                            :
                                'Cambiar Imagen'
                            }
                        </Button>
                    </label>
                    <br />
                    <br />
                    <Button variant='contained' color='primary' onClick={uploadGame}>
                        Guardar
                    </Button>
                    <br /><br />
                    {uploadImageStatus > 0 &&
                        <>
                            {uploadImageStatus === 100 ?
                                <p>
                                    Imagen guardada correctamente
                                </p>
                                :
                                <>
                                    <p>
                                        Guardando imagen
                                    </p>
                                    <LinearProgress variant='determinate' value={uploadImageStatus} />
                                </>
                            }
                        </>
                    }
                </Grid>
                <Grid item xs={12} sm={6}>
                    {imagePreview &&
                        <img style={{ maxHeight: '50vh', maxWidth: '50vw' }} src={imagePreview} />
                    }
                </Grid>
            </Grid>
        </Container>
    );
}

export default AddGame;
