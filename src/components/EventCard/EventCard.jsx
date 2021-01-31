import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Tooltip from '@material-ui/core/Tooltip';

import styles from './EventCard.module.css';

const EventCard = ({ games, setEventToApprove, newEvent = false, eventKey, event, setSelectedEvent }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [title, setTitle] = useState('');
    const history = useHistory();

    useEffect(() => {
        if (newEvent) {
            setTitle(`Evento de ${games.allGames[event.game].name}`);
        }
    }, []);

    const openMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const closeMenu = () => {
        setAnchorEl(null);
    };

    const goToEventDetails = () => {
        if (!newEvent) {
            history.push(`/event/details/${eventKey}`);
        } else {
            setEventToApprove(event);
            history.push(`/new/event/${eventKey}`);
        }
    }

    const duplicateEvent = () => history.push(`/event/duplicate/${eventKey}`);

    return (
            <Card className={styles.EventCard}>
                <CardActionArea onClick={goToEventDetails}>
                    <div className={styles.EventCardDetailsContainer}>
                        <CardContent className={styles.EventCardDetailsContent}>
                            <Typography component='h5' variant='h5'>
                                {event.title && event.title['es'] ? event.title['es'] : title}
                            </Typography>
                            <Typography variant='subtitle1' color='textSecondary'>
                                {event.descriptions && event.descriptions['es'] ? event.descriptions['es'] : ''}
                            </Typography>
                        </CardContent>
                    </div>
                </CardActionArea>
                <div onClick={openMenu}>
                    <IconButton
                        aria-label='more'
                        aria-controls='long-menu'
                        aria-haspopup='true'
                        style={{ height: 48, width: 48 }}>
                        <MoreVertIcon />
                    </IconButton>
                    <Tooltip title={event.streamerName} style={{ marginTop: 8 }}>
                        <Avatar
                            alt={event.streamerName}
                            src={event.streamerPhoto} />
                    </Tooltip>
                </div>
                <Menu
                    id='long-menu'
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={closeMenu}
                    keepMounted>
                    <MenuItem onClick={goToEventDetails}>Ver detalles</MenuItem>
                    {!newEvent &&
                        <>
                            <MenuItem onClick={() => setSelectedEvent(eventKey)}>Enviar notificación</MenuItem>
                            <MenuItem onClick={duplicateEvent}>Duplicar</MenuItem>
                        </>
                    }
                    <MenuItem disabled>Eliminar</MenuItem>
                </Menu>
            </Card>
    );
}

export default EventCard;
