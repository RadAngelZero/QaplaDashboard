import React, { useState } from 'react';
import {
    makeStyles,
    Container,
    Button,
    Grid,
    LinearProgress
} from '@material-ui/core';

import QaplaTextField from '../QaplaTextField/QaplaTextField';
import { uploadImage } from '../../services/storage';
import { addGameToCategories, createGameCardsImages } from '../../services/database';

const useStyles = makeStyles(() => ({
    input: {
      display: 'none'
    },
}));

const AddGame = () => {
    const [gameName, setGameName] = useState('');
    const [images, setImages] = useState([]);
    const [uploadImageStatus, setUploadImageStatus] = useState(0);

    const classes = useStyles();

    const loadImage = (e) => {
        const images = [];

        for (let i = 0; i < e.target.files.length; i++) {
            const file = e.target.files[i];
            images.push(file);
        }

        setImages(images);
    }

    const cleanForm = () => {
        setGameName('');
        setImages([]);
        setUploadImageStatus(0);
    }

    const uploadGame = async () => {
        // Game but without blank spaces
        const gameKey = gameName.replace(/\s+/g, '');
        try {
            await addGameToCategories(gameKey, gameName);
            uploadImageByIndex(0, []);
        } catch (error) {
            alert('Hubo un error al agregar el juego en la base de datos');
            console.log(error);
        }
    }

    const uploadImageByIndex = (index, urlArray) => {
        uploadImage(
            images[index],
            '/gamesResourcesImages',
            (progressValue) => setUploadImageStatus(progressValue * 100),
            (error) => {
                alert(`Error al agregar la imagen Nº${index + 1}, las primeras ${index} imagenes se agregaron correctamente`);
                /**
                 * There was an error updating the images[index] image, that means all the images from images[0] to images[index - 1] were correctly
                 * uploaded, so we save them on the database
                 */
                createGameCardsImages(urlArray);
                alert('Juego agregado correctamente');
                cleanForm();
                console.log(error);
            },
            async (url) => {
                urlArray.push(url);

                if (index + 1 < images.length) {
                    uploadImageByIndex(index + 1, urlArray);
                } else {
                    const gameKey = gameName.replace(/\s+/g, '');
                    createGameCardsImages(gameKey, urlArray);
                    alert('Juego agregado correctamente');
                    cleanForm();
                }

                setUploadImageStatus(0);
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
                        multiple
                        onChange={loadImage}
                        type='file' />
                    <label htmlFor='contained-button-file'>
                        <Button variant='contained' color='primary' component='span'>
                            {!images.length > 0 ?
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
                                    Imágenes  guardadas correctamente
                                </p>
                                :
                                <>
                                    <p>
                                        Guardando imágenes
                                    </p>
                                    <LinearProgress variant='determinate' value={uploadImageStatus} />
                                </>
                            }
                        </>
                    }
                </Grid>
            </Grid>
        </Container>
    );
}

export default AddGame;
