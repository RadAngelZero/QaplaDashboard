import React from 'react';
import { Drawer, List, ListItem, ListItemIcon } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { ReactComponent as EventsIcon } from './../../assets/EventIcon.svg';
import { ReactComponent as CommunityIcon } from './../../assets/CommunityIcon.svg';
import { ReactComponent as AnalyticsIcon } from './../../assets/AnalyticsIcon.svg';
import { ReactComponent as CogIcon } from './../../assets/CogIcon.svg';
import { ReactComponent as QaplaLogo } from './../../assets/QaplaLogo.svg';

const useStyles = makeStyles((theme) => ({
  drawer: {
    flexShrink: 0,
    whiteSpace: 'nowrap'
  },
  drawerClose: {
    background: '#2906A4',
    overflowX: 'hidden',
    width: theme.spacing(7.75) + 1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(7.75) + 1,
    }
  }
}));

const StreamerSideBar = ({ user }) => {
    const classes = useStyles();

    return (
        <Drawer
            className={[classes.drawer, classes.drawerClose]}
            classes={{ paper: classes.drawerClose }}
            variant='permanent'
            anchor='left'>
            <List style={{ marginTop: '1rem' }}>
                <ListItem>
                    <ListItemIcon><EventsIcon height={32} width={32} /></ListItemIcon>
                </ListItem>
                <ListItem style={{ marginTop: '.5rem' }}>
                    <ListItemIcon><CommunityIcon height={32} width={32} /></ListItemIcon>
                </ListItem>
                <ListItem style={{ marginTop: '.5rem' }}>
                    <ListItemIcon><AnalyticsIcon height={32} width={32} /></ListItemIcon>
                </ListItem>
            </List>
            <div style={{ flexGrow: 1 }} />
            <List>
                <ListItem style={{ marginTop: '.5rem' }}>
                    <ListItemIcon><CogIcon height={32} width={32} /></ListItemIcon>
                </ListItem>
                <ListItem style={{ marginTop: '.5rem' }}>
                    <ListItemIcon><QaplaLogo height={32} width={32} /></ListItemIcon>
                </ListItem>
            </List>
        </Drawer>
    );
}

export default StreamerSideBar;