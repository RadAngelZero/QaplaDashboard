import React from 'react';
import {
    makeStyles,
    FormControl,
    InputBase,
    NativeSelect,
    InputLabel
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    label: {
        fontSize: '12px',
        color: '#B2B3BD',
        lineHeight: '16px'
    },
    input: {
        marginTop: theme.spacing(1),
        paddingLeft: theme.spacing(2),
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        fontWeight: 'bold',
        backgroundColor: '#141833',
        borderRadius: '.5rem',
        color: '#FFF',
        fontSize: '14px'
    },
    icon: {
        color: 'transparent',
        marginTop: 8,
        marginRight: 8,
        marginLeft: 8
    }
}));

const StreamerSelect = ({ children, label, Icon, value, onChange }) => {
    const classes = useStyles();


    return (
        <>
            <InputLabel className={classes.label}>
                {label}
            </InputLabel>
            <NativeSelect
                onChange={onChange}
                value={value}
                IconComponent={Icon}
                classes={{ icon: classes.icon }}
                input={<InputBase className={classes.input} />}>
                {children}
            </NativeSelect>
        </>
    );
}

export default StreamerSelect;