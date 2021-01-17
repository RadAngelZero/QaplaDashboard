import React from 'react';
import { makeStyles, Grid, Checkbox, FormControlLabel, Radio, RadioGroup, Button } from '@material-ui/core';

import styles from './NewStream.module.css';
import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import StreamerTextInput from '../StreamerTextInput/StreamerTextInput';
import StreamerSelect from '../StreamerSelect/StreamerSelect';
import { ReactComponent as CalendarIcon } from './../../assets/CalendarIcon.svg';
import { ReactComponent as ArrowIcon } from './../../assets/Arrow.svg';
import { ReactComponent as TimeIcon } from './../../assets/TimeIcon.svg';
import { ReactComponent as CheckedIcon } from './../../assets/CheckedIcon.svg';
import { ReactComponent as UncheckedIcon } from './../../assets/UncheckedIcon.svg';

const useStyles = makeStyles({
    label: {
        color: '#FFF',
        fontSize: '14px'
    },
    button: {
        color: '#FFF',
        backgroundColor: '#6C5DD3',
        borderRadius: '1rem',
        padding: '1rem 3rem 1rem 3rem'
    }
});

const NewStream = ({ user }) => {
    const classes = useStyles();
    return (
        <StreamerDashboardContainer user={user}>
            <Grid container>
                <Grid item sm={8}>
                    <h1 className={styles.title}>
                        What are you playing?
                    </h1>
                    <StreamerSelect
                        Icon={ArrowIcon}
                        label='Select your game'>
                        <option value=''>Call of Duty: Warzone</option>
                        <option value='Otro'>dcnodisncvodisnviosdnbvoisd</option>
                    </StreamerSelect>
                    <h1 className={styles.title}>
                        When?
                    </h1>
                    <Grid container spacing={4}>
                        <Grid item sm={4}>
                            <StreamerTextInput
                                label='Date'
                                placeholder='31/12/2020'
                                Icon={CalendarIcon} />
                        </Grid>
                        <Grid item sm={4}>
                            <StreamerTextInput
                                label='Time'
                                placeholder='00:00'
                                Icon={TimeIcon} />
                        </Grid>
                    </Grid>
                    <h1 className={styles.title}>
                        Stream type
                    </h1>
                    <RadioGroup>
                        <Grid container>
                            <Grid item sm={2}>
                                <FormControlLabel
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
                                    classes={{ label: classes.label }}
                                    control={
                                        <Radio
                                            checked={false}
                                            checkedIcon={<CheckedIcon />}
                                            icon={<UncheckedIcon />}
                                            style={{ backgroundColor: 'transparent' }} />
                                    }
                                    label='Tournament' />
                            </Grid>
                        </Grid>
                    </RadioGroup>
                    <Button className={styles.button}>
                        Submit
                    </Button>
                </Grid>
            </Grid>
        </StreamerDashboardContainer>
    );
}

export default NewStream;