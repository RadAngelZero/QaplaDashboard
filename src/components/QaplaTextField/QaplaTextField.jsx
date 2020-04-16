import React from 'react';
import TextField from '@material-ui/core/TextField';

const QaplaTextField = ({ value, label, multiline = false, rows = 1, onChange, type = 'text', mini = false }) => (
    <TextField
        style={{ marginRight: 16, marginBottom: 12, minWidth: mini ? '10vw' : '20vw', maxWidth: mini ? '10vw' : undefined }}
        label={label}
        variant='outlined'
        value={value}
        multiline={multiline}
        rows={rows}
        type={type}
        onChange={({ target }) => onChange(target.value)} />
);

export default QaplaTextField;