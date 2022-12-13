import React, { useEffect, useState } from 'react';
import { Button, Chip, CircularProgress, Container, Dialog, DialogActions, DialogContent, GridList, GridListTile } from '@material-ui/core';

import { deleteMemeModerationRequest, getMemesToModerate } from '../../services/database';
import { deleteImage } from '../../services/storage';
import { addMemeToQaplaLibrary } from '../../services/functions';

const AddMemes = () => {
    const [memes, setMemes] = useState([]);
    const [selectedMeme, setSelectedMeme] = useState(null);
    const [aprobing, setAprobing] = useState(false);

    useEffect(() => {
        async function loadMemes() {
            const memes = await getMemesToModerate();

            if (memes.exists()) {
                const memesArray = Object.keys(memes.val()).map((meme) => ({ id: meme, ...memes.val()[meme] }))
                setMemes(memesArray);
            }
        }

        loadMemes();
    }, []);

    const removeMemeTag = (index) => {
        const selectedMemeCopy = {...selectedMeme};
        selectedMemeCopy.tags.splice(index, 1);

        setSelectedMeme(selectedMemeCopy);
    }

    const rejectMeme = async () => {
        if (window.confirm('Estas seguro que desas rechazar este meme?')) {
            // Remove meme from storage and database
            await deleteImage(selectedMeme.id);
            await deleteMemeModerationRequest(selectedMeme.id);

            // Remove meme from UI
            const memesCopy = [...memes];
            const index = memesCopy.findIndex((meme) => {
                return meme.id === selectedMeme.id
            });
            memesCopy.splice(index, 1);
            setMemes(memesCopy);

            // Close dialog
            setSelectedMeme(null);
        }
    }

    const approveMeme = async () => {
        try {
            setAprobing(true);
            // Index meme
            await addMemeToQaplaLibrary(
                selectedMeme.uid,
                selectedMeme.tags,
                selectedMeme.mediaType,
                selectedMeme.imageUrl,
                selectedMeme.width,
                selectedMeme.height,
                selectedMeme.userLanguage
            );
            await deleteMemeModerationRequest(selectedMeme.id);

            // Remove meme from UI
            const memesCopy = [...memes];
            const index = memesCopy.findIndex((meme) => {
                return meme.id === selectedMeme.id
            });
            memesCopy.splice(index, 1);
            setMemes(memesCopy);

            // Close dialog
            setSelectedMeme(null);
            setAprobing(false);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <Container maxWidth='lg' style={{ marginTop: '2em' }}>
            <GridList cols={3} spacing={10}>
                {memes.map((meme) => (
                    <GridListTile key={meme.imageUrl}>
                        <img src={meme.imageUrl} style={{
                                height: 200,
                                maxWidth: window.innerWidth / 3,
                                objectFit: 'contain',
                                cursor: 'pointer'
                            }}
                            onClick={() => setSelectedMeme(meme)} />
                    </GridListTile>
                ))}
            </GridList>
            <Dialog open={selectedMeme}
                onClose={() => setSelectedMeme(null)}>
                <DialogContent style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                    {selectedMeme &&
                        <>
                        <img src={selectedMeme.imageUrl} style={{
                                height: 200,
                                maxWidth: window.innerWidth / 3,
                                objectFit: 'contain',
                                alignSelf: 'center'
                            }} />
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            flexWrap: 'wrap',
                            listStyle: 'none',
                            margin: 0,
                            marginTop: 16
                        }}>
                            {selectedMeme.tags.map((tag, index) => (
                                <li key={tag}>
                                    <Chip label={tag}
                                        onDelete={() => removeMemeTag(index)}
                                        style={{
                                            margin: 2
                                        }} />
                                </li>
                            ))}
                        </div>
                        </>
                    }
                </DialogContent>
                <DialogActions>
                    <Button variant='contained'
                        color='secondary'
                        onClick={rejectMeme}>
                        Rechazar
                    </Button>
                    <Button variant='contained'
                        color='primary'
                        onClick={approveMeme}>
                        {aprobing ?
                            <CircularProgress size={30} />
                        :
                            'Aceptar'
                        }
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default AddMemes;