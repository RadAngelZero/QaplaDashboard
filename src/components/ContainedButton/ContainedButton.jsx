import React from 'react';
import { makeStyles, Button } from '@material-ui/core';

const useStyles = makeStyles({
    button: {
        color: '#FFF',
        backgroundColor: '#6C5DD3 !important',
        borderRadius: '1rem',
        padding: '1rem 3rem 1rem 3rem',
        textTransform: 'none',
        fontWeight: 'bold'
    }
});

const ContainedButton = ({ children, onClick, className = {}, startIcon }) => {
    const classes = useStyles();

    console.log(startIcon);
    return (
        <Button variant='contained'
            className={[classes.button, className]}
            startIcon={startIcon ?
                startIcon
                :
                null}
            onClick={onClick}>
            {children}
        </Button>
    );
}

export default ContainedButton;