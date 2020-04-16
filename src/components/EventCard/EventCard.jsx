import React from 'react';
import { Link } from 'react-router-dom';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';

import styles from './EventCard.module.css';

const EventCard = ({ eventKey, photoUrl, title, description }) => {
    return (
        <Link style={{ textDecoration: 'none' }} to={`/event/details/${eventKey}`}>
            <Card className={styles.EventCard}>
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
            </Card>
        </Link>
    );
}

export default EventCard;
