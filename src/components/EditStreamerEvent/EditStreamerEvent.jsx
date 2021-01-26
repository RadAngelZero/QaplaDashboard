import React from 'react';
import {
    makeStyles,
    Grid,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    withStyles,
    Avatar
} from '@material-ui/core';
import { useParams } from 'react-router';

import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import StreamerTextInput from '../StreamerTextInput/StreamerTextInput';
import { ReactComponent as CalendarIcon } from './../../assets/CalendarIcon.svg';
import { ReactComponent as TimeIcon } from './../../assets/TimeIcon.svg';
import { ReactComponent as ProfileIcon } from './../../assets/ProfileIcon.svg';
import { ReactComponent as EyeIcon } from './../../assets/EyeIcon.svg';
import { ReactComponent as DownloadIcon } from './../../assets/DownloadIcon.svg';

import ContainedButton from '../ContainedButton/ContainedButton';

const useStyles = makeStyles((theme) => ({
    title: {
        fontSize: '24px',
        color: '#FFF'
    },
    description: {
        fontSize: '12px',
        color: 'rgba(255,255,255,0.60)',
        lineHeight: '18px',
        paddingRight: '2rem',
        marginBottom: '2rem'
    },
    button: {
        marginTop: '2.5rem'
    },
    containerTextArea: {
        marginRight: '2.5rem'
    },
    textArea: {
        paddingTop: '1rem'
    },
    tableHead: {
        fontSize: '16px !important',
        color: '#808191 !important',
        fontWeight: 'bold'
    },
    participantsColumn: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center'
    },
    tableRow: {
        backgroundColor: 'rgba(20, 24, 51, .5)'
    },
    tableRowOdd: {
        backgroundColor: 'transparent'
    },
    firstCell: {
        borderRadius: '1rem 0 0 1rem',
    },
    lastCell: {
        borderRadius: '0 1rem 1rem 0',
    },
    avatar: {
        width: theme.spacing(3),
        height: theme.spacing(3),
        marginLeft: '.25rem'
    }
}));

const TableCellStyled = withStyles(() => ({
    root: {
        borderColor: 'transparent',
        paddingTop: '1rem',
        paddingBottom: '1rem',
        fontSize: '14px',
        color: '#FFFFFF'
    }
}))(TableCell);

const SectionHeader = ({ title, description }) => {
    const classes = useStyles();

    return (
        <>
            <p className={classes.title}>
                {title}
            </p>
            <p className={classes.description}>
                {description}
            </p>
        </>
    );
};

const EditStreamerEvent = ({ user }) => {
    // const { eventId } = useParams(); <= Get event id from router
    const classes = useStyles();

    return (
        <StreamerDashboardContainer user={user}>
            <Grid container>
                <Grid xs={6}>
                    <SectionHeader title='Edit'
                        description='A notification will be sent to the participants of any changes. We recommend not changing the date or time often tho, a consistent schedule drives more traffic to your live streams.' />
                    <Grid container>
                        <Grid item md={6}>
                            <StreamerTextInput label='Date'
                                placeholder='30/12/2020'
                                Icon={CalendarIcon} />
                            <ContainedButton className={classes.button}>
                                Save Changes
                            </ContainedButton>
                        </Grid>
                        <Grid item md={6}>
                            <StreamerTextInput label='Time'
                                placeholder='18:00 hrs'
                                Icon={TimeIcon} />
                        </Grid>
                    </Grid>
                    <Grid item md={12}>
                        <SectionHeader title='Notifications'
                            description='You can send participants two custom notifications to share any relevant information about your stream. Make them short and only send important notices. Spaming  can have a negative impact on your stream.' />
                        <StreamerTextInput placeholder='140 character limit'
                            multiline
                            rows={3}
                            fullWidth
                            textInputClassName={classes.textArea}
                            containerClassName={classes.containerTextArea} />
                        <br/>
                        <ContainedButton className={classes.button}>
                            Send
                        </ContainedButton>
                    </Grid>
                </Grid>
                <Grid xs={6}>
                    <SectionHeader title='Private Rooms'
                        description='If you are hosting a private room and want to give access to the participants of the event, you can share the ID with them directly in the Qapla app. Participants will get a notification to see the ID.' />
                    <StreamerTextInput label='ID'
                        placeholder='ID' />
                    <br/>
                    <ContainedButton className={classes.button}>
                        Send
                    </ContainedButton>
                </Grid>
                <Grid xs={12}>
                    <SectionHeader title='Participants' />
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCellStyled align='center' padding='checkbox'>
                                        <ProfileIcon />
                                    </TableCellStyled>
                                    <TableCellStyled className={classes.tableHead}>Twitch Username</TableCellStyled>
                                    <TableCellStyled className={classes.tableHead}>Game Username</TableCellStyled>
                                    <TableCellStyled className={classes.tableHead}>Qapla Username</TableCellStyled>
                                    <TableCellStyled className={classes.participantsColumn}>
                                        <EyeIcon /> <p>5 Participants</p>
                                    </TableCellStyled>
                                    <TableCellStyled className={classes.tableHead}>
                                        <ContainedButton
                                            startIcon={<DownloadIcon />}>
                                            Download List
                                        </ContainedButton>
                                    </TableCellStyled>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow className={classes.tableRow}>
                                    <TableCellStyled align='center' className={classes.firstCell}>
                                        <Avatar className={classes.avatar} />
                                    </TableCellStyled>
                                    <TableCellStyled>
                                        DHVS
                                    </TableCellStyled>
                                    <TableCellStyled>
                                        DHVS
                                    </TableCellStyled>
                                    <TableCellStyled className={classes.lastCell}>
                                        DHVS
                                    </TableCellStyled>
                                </TableRow>
                                <TableRow className={classes.tableRowOdd}>
                                    <TableCellStyled align='center' className={classes.firstCell}>
                                        <Avatar className={classes.avatar} />
                                    </TableCellStyled>
                                    <TableCellStyled>
                                        DHVS
                                    </TableCellStyled>
                                    <TableCellStyled>
                                        DHVS
                                    </TableCellStyled>
                                    <TableCellStyled className={classes.lastCell}>
                                        DHVS
                                    </TableCellStyled>
                                </TableRow>
                                <TableRow className={classes.tableRow}>
                                    <TableCellStyled align='center' className={classes.firstCell}>
                                        <Avatar className={classes.avatar} />
                                    </TableCellStyled>
                                    <TableCellStyled>
                                        DHVS
                                    </TableCellStyled>
                                    <TableCellStyled>
                                        DHVS
                                    </TableCellStyled>
                                    <TableCellStyled className={classes.lastCell}>
                                        DHVS
                                    </TableCellStyled>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </StreamerDashboardContainer>
    );
}

export default EditStreamerEvent;