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

const StreamerTextInput = ({ label, placeholder, value, onChange, fullWidth = false, Icon, type, multiline = false, rows = 1, containerClassName = {}, textInputClassName = {} }) => {
    const classes = useStyles();

    return (
        <div className={containerClassName}>
            <InputLabel className={classes.label}>
                {label}
            </InputLabel>
            <InputBase
                rows={rows}
                multiline={multiline}
                type={type}
                endAdornment={Icon ?
                    <InputAdornment position='end' style={{ marginRight: 16 }}>
                        <Icon />
                    </InputAdornment>
                    :
                    null
                }
                variant='outlined'
                label={label}
                className={[textInputClassName, classes.textInput]}
                fullWidth={fullWidth}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)} />
        </div>
    );
}

export default StreamerTextInput;