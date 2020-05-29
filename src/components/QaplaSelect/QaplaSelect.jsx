import React from 'react';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';

const QaplaSelect = ({ id, children, value, label, onChange, disabled = false }) => (
    <FormControl variant='outlined' style={{ minWidth: '20vw', marginRight: 16, marginBottom: 12 }}>
        <InputLabel htmlFor={id}>
            {label}
        </InputLabel>
        <Select
            native
            variant='outlined'
            label={label}
            inputProps={{ id }}
            disabled={disabled}
            value={value}
            onChange={({ target }) => onChange(target.value)}>
            {children}
        </Select>
    </FormControl>
);

export default QaplaSelect;