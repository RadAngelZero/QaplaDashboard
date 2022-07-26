import React, { useState } from 'react';
import { makeStyles, Container, Button, Grid, LinearProgress, Radio, RadioGroup, FormControlLabel } from '@material-ui/core';

import { uploadImage } from '../../services/storage';
import { uploadMediaToQaplaInteractions } from '../../services/database';
import { EMOTES, MEME } from '../../utilities/Constants';

const useStyles = makeStyles(() => ({
    input: {
      display: 'none'
    },
}));

const AddMemes = () => {
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [uploadFileStatus, setUploadFileStatus] = useState(0);
    const [fileDimensions, setFileDimensions] = useState({ width: 0, height: 0 });
    const [type, setType] = useState(MEME);

    const classes = useStyles();

    const loadImage = (e) => {
        setFile(e.target.files[0]);

        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setFilePreview(reader.result);
        });

        reader.readAsDataURL(e.target.files[0]);
    }

    const cleanForm = () => {
        setFile(null);
        setFilePreview(null);
        setUploadFileStatus(0);
    }

    const uploadFile = async () => {
        uploadImage(
            file,
            `/QaplaInteractions/${type}`,
            (progressValue) => setUploadFileStatus(progressValue * 100),
            (error) => { alert('Error al agregar imagen'); console.log(error); },
            async (url) => {
                try {
                    await uploadMediaToQaplaInteractions(url, fileDimensions.height, fileDimensions.width, type);
                    alert('Multimedia agregada correctamente');
                    cleanForm();
                } catch (error) {
                    alert('Hubo un error al guardar el archivo en la base de datos');
                    console.log(error);
                }
            }
        );
    }

    return (
        <Container maxWidth='lg' style={{ marginTop: '2em' }}>
            <Grid container>
                <Grid item xs={12} sm={6}>
                    <RadioGroup value={type} onChange={(event) => setType(event.target.value)}>
                        <FormControlLabel value={MEME} control={<Radio />} label='Meme' />
                        <FormControlLabel value={EMOTES} control={<Radio />} label='Emote' />
                    </RadioGroup>
                    <br />
                    <input
                        accept='image/*'
                        className={classes.input}
                        id='contained-button-file'
                        onChange={loadImage}
                        type='file' />
                    <label htmlFor='contained-button-file'>
                        <Button variant='contained' color='primary' component='span'>
                            {!file ?
                                'Cargar Imagen'
                            :
                                'Cambiar Imagen'
                            }
                        </Button>
                    </label>
                    <br />
                    <br />
                    <Button variant='contained' color='primary' onClick={uploadFile}>
                        Guardar
                    </Button>
                    <br /><br />
                    {uploadFileStatus > 0 &&
                        <>
                            {uploadFileStatus === 100 ?
                                <p>
                                    Imagen guardada correctamente
                                </p>
                                :
                                <>
                                    <p>
                                        Guardando imagen
                                    </p>
                                    <LinearProgress variant='determinate' value={uploadFileStatus} />
                                </>
                            }
                        </>
                    }
                </Grid>
                <Grid item xs={12} sm={6}>
                    {filePreview &&
                        <img style={{ maxHeight: '50vh', maxWidth: '50vw' }}
                            src={filePreview}  />
                    }
                </Grid>
                <img style={{ display: 'none' }} src={filePreview} onLoad={({ target: img }) => setFileDimensions({ width: img.naturalWidth, height: img.naturalHeight })}  />
            </Grid>
        </Container>
    );
}

export default AddMemes;