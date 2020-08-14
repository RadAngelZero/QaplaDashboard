import React, { useCallback, useState } from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import GetAppIcon from '@material-ui/icons/GetApp';

import { useDropzone } from 'react-dropzone';
import { useParams } from 'react-router-dom';
import * as xlsx from 'xlsx';

import styles from './AssignPrizesForEvent.module.css';
import { getEventParticipantsOnce } from '../../services/database';
import ApproveQoinsDistributionDialog from './../ApproveQoinsDistributionDialog/ApproveQoinsDistributionDialog';

const AssignPrizesForEvent = ({ events }) => {
    const [ users, setUsers ] = useState([]);
    const [openApproveDialog, setOpenApproveDialog] = useState(false);
    const { eventId } = useParams();

    /**
     * Event called when a file enters on the dropzone, validates the excel document inserted
     * and handle the file to check the prizes to assign to the users
     *
     * @param {Array} uploadedFiles Array of files
     */
    const onDrop = useCallback((uploadedFiles) => {
        if (uploadedFiles.length === 1) {
            uploadedFiles.forEach((file) => {
                /**
                 * First part (before the + symbol) check if the document has a valid name
                 * The second part check if the extension is xls or xlsx files (excel files)
                 */
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
                            .sort((a, b) => a['Place'] - b['Place'])
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

    /**
     * Create an excel file for the user to download it with the list of
     * participants
     */
    const generateParticipantFormat = async () => {
        const participants = await getEventParticipantsOnce(eventId);

        const participantsData = Object.keys(participants).map((participant) => {
            const { email, userName } = participants[participant];
            delete participants[participant].eventEntry;
            delete participants[participant].timeStamp;
            delete participants[participant].token;
            delete participants[participant].matchesPlayed;
            delete participants[participant].priceQaploins;
            delete participants[participant].victories;
            delete participants[participant].firebaseUserIdentifier;
            delete participants[participant].email;
            delete participants[participant].userName;
            return {
                'Qapla ID': participant,
                Email: email,
                UserName: userName,
                ...participants[participant],
                Place: null,
                Experience: 0
            }
        });

        const dataToWrite = xlsx.utils.json_to_sheet(participantsData);

        let newWorkBook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(newWorkBook, dataToWrite, 'Participants');
        xlsx.writeFile(newWorkBook, `${events[eventId].title['es']}.xlsx`);
    }

    return (
        <Container>
            <Grid container spacing={3} className={styles.container}>
                <Grid item sm={6} xs={12}>
                    <Paper onClick={generateParticipantFormat} className={styles.pointer}>
                        <GetAppIcon className={styles.downloadIcon} /> Descarga el archivo de participantes
                    </Paper>
                </Grid>
                <Grid item sm={6} xs={12}>
                    <Paper {...getRootProps()} className={styles.dropzoneContainer}>
                        <input {...getInputProps()} />
                            <div className={styles.alignTextCenter}>
                                {isDragActive ?
                                    <Typography>
                                        Dejalo caer aquí
                                    </Typography>
                                    :
                                    <Typography>
                                        Arrastra y suelta el documento aquí una vez que asignes los premios en excel o
                                        cualquier otro software de hojas de cálculo (debe ser un formato de los siguientes xlsx o xls)
                                        <br />
                                        También se vale darle click y buscar el archivo en tu computadora
                                    </Typography>
                                }
                            </div>
                    </Paper>
                </Grid>
                <ApproveQoinsDistributionDialog
                    open={openApproveDialog}
                    users={users}
                    eventId={eventId}
                    eventChatUrl={events[eventId] ? events[eventId].eventChatUrl : ''}
                    onClose={() => setOpenApproveDialog(false)} />
            </Grid>
        </Container>
    );
}

export default AssignPrizesForEvent;
