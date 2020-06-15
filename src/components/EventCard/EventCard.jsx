import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import styles from './EventCard.module.css';

const EventCard = ({ eventKey, photoUrl, title, description, setSelectedEvent }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const history = useHistory();

    const openMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const closeMenu = () => {
        setAnchorEl(null);
    };

    const goToEventDetails = () => history.push(`/event/details/${eventKey}`);

    return (
            <Card
                className={styles.EventCard}>
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
                    <CardMedia
                        className={styles.EventCardImage}
                        image={photoUrl}
                        title='Live from space album cover' />
                </CardActionArea>
                <div onClick={openMenu}>
                    <IconButton
                        aria-label='more'
                        aria-controls='long-menu'
                        aria-haspopup='true'
                        style={{ height: 48, width: 48 }}>
                        <MoreVertIcon />
                    </IconButton>
                </div>
                <Menu
                    id='long-menu'
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={closeMenu}
                    keepMounted>
                    <MenuItem onClick={goToEventDetails}>Ver detalles</MenuItem>
                    <MenuItem onClick={() => setSelectedEvent(eventKey)}>Enviar notificación</MenuItem>
                    <MenuItem disabled>Eliminar</MenuItem>
                </Menu>
            </Card>
    );
}

export default EventCard;
