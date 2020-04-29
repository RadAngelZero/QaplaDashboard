import React, { useCallback, useState } from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { useDropzone } from 'react-dropzone';
import { useParams } from 'react-router-dom';
import * as xlsx from 'xlsx';
import GetAppIcon from '@material-ui/icons/GetApp';

import styles from './AssignPrizesForEvent.module.css';
import { getEventParticipants } from '../../services/database';
import ApproveQoinsDistributionDialog from './../ApproveQoinsDistributionDialog/ApproveQoinsDistributionDialog';

const AssignPrizesForEvent = () => {
    const [ users, setUsers ] = useState([]);
    const [openApproveDialog, setOpenApproveDialog] = useState(false);
    const { eventId } = useParams();

    const onDrop = useCallback((uploadedFiles) => {
        if (uploadedFiles.length === 1) {
            uploadedFiles.forEach((file) => {
                if ((/^^[\w() -]+(.xls|.xlsx)$/).test(file.name.toLowerCase())) {
                    const reader = new FileReader();

                    reader.readAsArrayBuffer(file);

                    reader.onabort = () => console.log('file reading was aborted');
                    reader.onerror = () => console.log('file reading has failed');
                    reader.onloadend = async (e) => {
                        const data = new Uint8Array(e.target.result);
                        const workBook = xlsx.read(data, { type: 'array' });
                        const usersArray = [];

                        workBook.SheetNames.forEach((sheetName) => {
                            xlsx.utils.sheet_to_json(workBook.Sheets[sheetName])
                            // Sort users by prize (just because we need to show this data after)
                            .sort((a, b) => b['Qoins'] - a['Qoins'])
                            .forEach((row) => {
                                usersArray.push(row);
                            });
                        });

                        setUsers(usersArray);
                        setOpenApproveDialog(true);
                    };
                } else {
                    alert('Tipo de archivo invalido');
                }
            });
        } else {
            alert('Solo se permite subir maximo un archivo');
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const generateParticipantFormat = async () => {
        const participants = await getEventParticipants(eventId);

        const participantsData = Object.keys(participants).map((participant) => {
            const { email, gamerTag, userName } = participants[participant];
            return {
                Uid: participant,
                Email: email,
                GamerTag: gamerTag,
                UserName: userName,
                Qoins: 0
            }
        });

        const dataToWrite = xlsx.utils.json_to_sheet(participantsData);

        let newWorkBook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(newWorkBook, dataToWrite, 'Participants');
        xlsx.writeFile(newWorkBook, `${eventId}.xlsx`);
    }

    return (
        <Container>
            <Grid container spacing={3} className={styles.container}>
                <Grid item sm={6} xs={12}>
                    <Paper onClick={generateParticipantFormat} style={{ cursor: 'pointer' }}>
                        <GetAppIcon className={styles.downloadIcon} /> Descarga el archivo de participantes
                    </Paper>
                </Grid>
                <Grid item sm={6} xs={12}>
                    <Paper {...getRootProps()} className={styles.dropzoneContainer}>
                        <input {...getInputProps()} />
                            <div style={{ textAlign: 'center' }}>
                                {isDragActive ?
                                    <Typography>
                                        Dejalo caer aqui
                                    </Typography>
                                    :
                                    <Typography>
                                        Arrastra y suelta el documento aqui una vez que asignes los premios en excel o
                                        cualquier otro software de hojas de calculo (debe ser un formato de los siguientes xlsx o xls)
                                        <br />
                                        Tambien se vale darle click y buscar el archivo en tu computadora
                                    </Typography>
                                }
                            </div>
                    </Paper>
                </Grid>
                <ApproveQoinsDistributionDialog
                    open={openApproveDialog}
                    users={users}
                    onClose={() => setOpenApproveDialog(false)} />
            </Grid>
        </Container>
    );
}

export default AssignPrizesForEvent;
