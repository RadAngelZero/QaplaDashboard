import React from 'react';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';

const QaplaTextField = ({ autoFocus = false, value, label, multiline = false, rows = 1, onChange, type = 'text', mini = false, disabled = false, inputAdornment = null, onPressAdornment = () => {}, id = '', placeholder = '', required = false, fullWidth = false, error = false, helperText = '' }) => (
    <TextField
        autoFocus={autoFocus}
        required={required}
        fullWidth={fullWidth}
        style={{
            marginRight: 16,
            marginBottom: 12,
            minWidth: mini ? '14vw' : '20vw',
            maxWidth: mini ? '14vw' : undefined
        }}
        error={error}
        helperText={helperText}
        label={label}
        variant='outlined'
        value={value}
        multiline={multiline}
        rows={rows}
        type={type}
        disabled={disabled}
        InputProps={{
            endAdornment:
                <InputAdornment style={{ cursor: 'pointer' }} position='end'>
                    <div onClick={onPressAdornment}>
                        {inputAdornment}
                    </div>
                </InputAdornment>
        }}
        id={id}
        onChange={({ target }) => onChange(target.value)}
        placeholder={placeholder} />
);

export default QaplaTextField;