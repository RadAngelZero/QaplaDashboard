import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, Divider } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';

import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import { ReactComponent as EventsIcon } from './../../assets/EventIcon.svg';
import { ReactComponent as CommunityIcon } from './../../assets/CommunityIcon.svg';
import { ReactComponent as AnalyticsIcon } from './../../assets/AnalyticsIcon.svg';
import { ReactComponent as CogIcon } from './../../assets/CogIcon.svg';
import { ReactComponent as QaplaLogo } from './../../assets/QaplaLogo.svg';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerClose: {
    background: '#2906A4',
    overflowX: 'hidden',
    width: theme.spacing(7.75) + 1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(7.75) + 1,
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

const StreamerSideBar = ({ user }) => {
    const classes = useStyles();
    const theme = useTheme();

    return (
        <StreamerDashboardContainer user={user}>
            <Drawer
                className={[classes.drawer, classes.drawerClose]}
                classes={{ paper: classes.drawerClose }}
                variant='permanent'>
                <List style={{ marginTop: '1rem' }}>
                    <ListItem>
                        <ListItemIcon style={{ color: '#FFF' }}><EventsIcon height={32} width={32} /></ListItemIcon>
                    </ListItem>
                    <ListItem style={{ marginTop: '.5rem' }}>
                        <ListItemIcon><CommunityIcon height={32} width={32} /></ListItemIcon>
                    </ListItem>
                    <ListItem style={{ marginTop: '.5rem' }}>
                        <ListItemIcon style={{ color: '#FFF' }}><AnalyticsIcon height={32} width={32} /></ListItemIcon>
                    </ListItem>
                </List>
                <Divider />
                <div style={{ flexGrow: 1 }}></div>
                <List>
                    <ListItem style={{ marginTop: '.5rem' }}>
                        <ListItemIcon style={{ color: '#FFF' }}><CogIcon height={32} width={32} /></ListItemIcon>
                    </ListItem>
                    <ListItem style={{ marginTop: '.5rem' }}>
                        <ListItemIcon style={{ color: '#FFF' }}><QaplaLogo height={32} width={32} /></ListItemIcon>
                    </ListItem>
                </List>
            </Drawer>
        </StreamerDashboardContainer>
    );
}

export default StreamerSideBar;