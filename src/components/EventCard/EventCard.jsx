import React, { useState } from 'react';
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

const EventCard = ({ eventKey, streamerPhoto, streamerName, title, description, setSelectedEvent }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const history = useHistory();

    const openMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const closeMenu = () => {
        setAnchorEl(null);
    };

    const goToEventDetails = () => history.push(`/event/details/${eventKey}`);

    const duplicateEvent = () => history.push(`/event/duplicate/${eventKey}`);

    return (
            <Card className={styles.EventCard}>
                <CardActionArea onClick={goToEventDetails}>
                    <div className={styles.EventCardDetailsContainer}>
                        <CardContent className={styles.EventCardDetailsContent}>
                            <Typography component='h5' variant='h5'>
                                {title}
                            </Typography>
                            <Typography variant='subtitle1' color='textSecondary'>
                                {description}
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
                    <Tooltip title={streamerName} style={{ marginTop: 8 }}>
                        <Avatar
                            alt={streamerName}
                            src={streamerPhoto} />
                    </Tooltip>
                </div>
                <Menu
                    id='long-menu'
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={closeMenu}
                    keepMounted>
                    <MenuItem onClick={goToEventDetails}>Ver detalles</MenuItem>
                    <MenuItem onClick={() => setSelectedEvent(eventKey)}>Enviar notificación</MenuItem>
                    <MenuItem onClick={duplicateEvent}>Duplicar</MenuItem>
                    <MenuItem disabled>Eliminar</MenuItem>
                </Menu>
            </Card>
    );
}

export default EventCard;
