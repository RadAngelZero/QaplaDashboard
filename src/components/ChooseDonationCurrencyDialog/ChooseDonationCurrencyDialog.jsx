import React, { useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Grid from '@material-ui/core/Grid';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const ChooseDonationCurrencyDialog = ({ donationInfo, closeDialog, completeDonation, open }) => {
    const [currency, setCurrency] = useState('bits');

    const finishDonation = () => {
        completeDonation(donationInfo, currency)
        closeDialog();
    }

    return (
        <Dialog
            maxWidth='sm'
            open={open}
            onClose={closeDialog}>
            <DialogTitle>
                Selecciona la moneda para la donación
            </DialogTitle>
            <DialogContent>
                <Grid container>
                    <Grid item md={12}>
                        <FormControl>
                            <InputLabel id="demo-simple-select-label">Moneda</InputLabel>
                            <Select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}>
                            <MenuItem value={'bits'}>Bits</MenuItem>
                            <MenuItem value={'stars'}>Estrellas</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button
                    variant='contained'
                    color='default'
                    onClick={closeDialog}>
                    Cancelar
                </Button>
                <Button
                    variant='contained'
                    color='primary'
                    onClick={finishDonation}>
                    Aceptar
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ChooseDonationCurrencyDialog;