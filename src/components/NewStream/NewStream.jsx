import React, { useState } from 'react';
import { makeStyles, Grid, FormControlLabel, Radio, RadioGroup, Button, InputAdornment, InputLabel } from '@material-ui/core';
import { MuiPickersUtilsProvider, KeyboardDatePicker, KeyboardTimePicker } from '@material-ui/pickers'
import { useHistory } from 'react-router-dom';
import DayJsUtils from '@date-io/dayjs';
import { createNewEvent } from './../../services/database';

import styles from './NewStream.module.css';
import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import StreamerSelect from '../StreamerSelect/StreamerSelect';
import { ReactComponent as CalendarIcon } from './../../assets/CalendarIcon.svg';
import { ReactComponent as ArrowIcon } from './../../assets/Arrow.svg';
import { ReactComponent as TimeIcon } from './../../assets/TimeIcon.svg';
import { ReactComponent as CheckedIcon } from './../../assets/CheckedIcon.svg';
import { ReactComponent as UncheckedIcon } from './../../assets/UncheckedIcon.svg';

const useStyles = makeStyles((theme) => ({
    label: {
        color: '#FFF',
        fontSize: '14px'
    },
    datePickerLabel: {
        fontSize: '12px',
        color: '#B2B3BD',
        lineHeight: '16px'
    },
    button: {
        color: '#FFF',
        backgroundColor: '#6C5DD3',
        borderRadius: '1rem',
        padding: '1rem 3rem 1rem 3rem'
    },
    dateInput: {
        color: '#FFF',
        marginTop: theme.spacing(1),
        paddingLeft: theme.spacing(2),
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        fontWeight: 'bold',
        backgroundColor: '#141833',
        borderRadius: '.5rem',
        fontSize: '14px',
    },
    popover: {
        backgroundColor: '#141833',
        color: 'white',
        padding: '15px',
        '& .MuiPickersCalendarHeader-switchHeader': {
            '& .MuiIconButton-root:hover': {
                backgroundColor: '#707070'
            }
        },

        '& .MuiButtonBase-root:hover:not(.MuiPickersDay-daySelected)': {
            backgroundColor: '#3f51b5',
        },
        '& .MuiPickersDay-day': {
            color: 'white'
        },
        '& .MuiPickersDay-daySelected': {
            backgroundColor: '#00beff',
            color: '#000'
        },
        '& .MuiPickersDay-dayDisabled': {
            color: 'gray'
        },
        '& .MuiPickersCalendarHeader-dayLabel': {
            color: 'white'
        },
        '& .MuiPickersClockNumber-clockNumber': {
            color: 'white'
        },
        '& .MuiPickersClockPointer-pointer': {
            backgroundColor: '#00beff',
            '& .MuiPickersClockPointer-noPoint': {
                borderColor: '#00beff',
            },
            '& .MuiPickersClockPointer-thumb': {
                borderColor: '#00beff',
            }
        },
        '& .MuiPickersClockNumber-clockNumberSelected': {
            color: '#000'
        }
    }
}));

const NewStream = ({ user, games }) => {

    const classes = useStyles();
    const history = useHistory();

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedGame, setSelectedGame] = useState('aClash');
    const [selectedEvent, setSelectedEvent] = useState('exp');

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };
    const handleGameChange = (game) => {
        setSelectedGame(game.target.value);
    };
    const handleEventChange = (event) => {
        setSelectedEvent(event.target.value);
    };

    const submitEvent = () => {
        if (selectedDate.$d == undefined) {
            return
        }
        let UTCDate = `${selectedDate.$d.getUTCDate()}-${selectedDate.$d.getUTCMonth()}-${selectedDate.$d.getUTCFullYear()}`;
        let UTCTime = `${selectedDate.$d.getUTCHours()}:${selectedDate.$d.getUTCMinutes()}`;
        let timestamp = Math.floor(Date.now() / 1000);
        createNewEvent(user, selectedGame, UTCDate, UTCTime, selectedEvent, timestamp)

        history.push('/success');
    }

    return (
        <StreamerDashboardContainer user={user}>
            <Grid container>
                <Grid item sm={8}>
                    <h1 className={styles.title}>
                        What are you playing?
                    </h1>
                    <StreamerSelect
                        value={selectedGame}
                        onChange={(game) => handleGameChange(game)}
                        Icon={ArrowIcon}
                        label='Select your game'>
                        {Object.entries(games.allGames).map((game) => {
                            if (!game[1].name.toLowerCase().includes('twitch')) {
                                return <option style={{
                                    backgroundColor: '#141833',
                                    fontSize: '14px'
                                }} value={game[0]}>{game[1].name}</option>
                            }
                        })}
                    </StreamerSelect>
                    <h1 className={styles.title}>
                        When?
                    </h1>
                    <MuiPickersUtilsProvider utils={DayJsUtils}>
                        <Grid container spacing={4}>
                            <Grid item sm={4}>
                                <InputLabel className={classes.datePickerLabel}>
                                    Date
                                </InputLabel>
                                <KeyboardDatePicker
                                    clearable
                                    disablePast
                                    disableToolbar
                                    autoOk
                                    value={selectedDate}
                                    placeholder="10/10/2021"
                                    onChange={date => handleDateChange(date)}
                                    minDate={new Date()}
                                    format="DD / MM / YY  ddd"
                                    keyboardIcon={
                                        <InputAdornment position='end' >
                                            <CalendarIcon />
                                        </InputAdornment>
                                    }
                                    InputProps={{
                                        disableUnderline: true,
                                        className: classes.dateInput
                                    }}
                                    variant={'inline'}
                                    PopoverProps={{
                                        PaperProps: {
                                            className: classes.popover,
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item sm={4}>
                                <InputLabel className={classes.datePickerLabel}>
                                    Time
                                </InputLabel>
                                <KeyboardTimePicker
                                    ampm={false}
                                    disableToolbar
                                    autoOk
                                    value={selectedDate}
                                    placeholder="08:00 AM"
                                    onChange={date => setSelectedDate(date)}
                                    mask="__:__"
                                    keyboardIcon={
                                        <InputAdornment position='end' >
                                            <TimeIcon />
                                        </InputAdornment>
                                    }
                                    InputProps={{
                                        disableUnderline: true,
                                        className: classes.dateInput
                                    }}
                                    variant={'inline'}
                                    PopoverProps={{
                                        PaperProps: {
                                            className: classes.popover,
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </MuiPickersUtilsProvider>
                    <h1 className={styles.title}>
                        Stream type
                    </h1>
                    <RadioGroup name={'eventType'} value={selectedEvent} onChange={(event) => {handleEventChange(event)}}>
                        <Grid container>
                            <Grid item sm={2}>
                                <FormControlLabel
                                    value={'exp'}
                                    classes={{ label: classes.label }}
                                    control={
                                        <Radio defaultChecked
                                            checkedIcon={<CheckedIcon />}
                                            icon={<UncheckedIcon />}
                                            style={{ backgroundColor: 'transparent' }} />
                                    }
                                    label='Casual (XQ)' />
                            </Grid>
                            <Grid item sm={2}>
                                <FormControlLabel
                                    value={'tournament'}
                                    classes={{ label: classes.label }}
                                    control={
                                        <Radio
                                            checkedIcon={<CheckedIcon />}
                                            icon={<UncheckedIcon />}
                                            style={{ backgroundColor: 'transparent' }} />
                                    }
                                    label='Tournament' />
                            </Grid>
                        </Grid>
                    </RadioGroup>
                    <Button
                        className={styles.button}
                        onClick={submitEvent}>
                        Submit
                    </Button>
                </Grid>
            </Grid>
        </StreamerDashboardContainer>
    );
}

export default NewStream;