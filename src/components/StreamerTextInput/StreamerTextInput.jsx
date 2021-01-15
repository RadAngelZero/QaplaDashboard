import React from 'react';
import {
    makeStyles,
    InputBase,
    InputAdornment,
    InputLabel
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    label: {
        fontSize: '12px',
        color: '#B2B3BD',
        lineHeight: '16px'
    },
    textInput: {
        marginTop: theme.spacing(1),
        paddingLeft: theme.spacing(2),
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        fontWeight: 'bold',
        backgroundColor: '#141833',
        borderRadius: '.5rem',
        color: '#FFF',
        fontSize: '14px'
    }
}));

const StreamerTextInput = ({ label, placeholder, value, onChange, fullWidth = false, Icon, type }) => {
    const classes = useStyles();

    return (
        <>
            <InputLabel className={classes.label}>
                {label}
            </InputLabel>
            <InputBase
                type={type}
                endAdornment={
                    <InputAdornment position='end' style={{ marginRight: 16 }}>
                        <Icon />
                    </InputAdornment>
                }
                variant='outlined'
                label={label}
                className={classes.textInput}
                fullWidth={fullWidth}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)} />
        </>
    );
}

export default StreamerTextInput;