import React, { useCallback, useState } from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import GetAppIcon from '@material-ui/icons/GetApp';

import { useDropzone } from 'react-dropzone';
import * as xlsx from 'xlsx';

import styles from './Leaderboard.module.css';
import { getLeaderboard } from '../../services/database';
import ApproveLeaderboardResetDialog from '../ApproveLeaderboardResetDialog/ApproveLeaderboardResetDialog';

const Leaderboard = () => {
    const [ users, setUsers ] = useState([]);
    const [openApproveDialog, setOpenApproveDialog] = useState(false);

    /**
     * Event called when a file enters on the dropzone, validates the excel document inserted
     * and handle the file
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
                            .filter((user) => user.experience)
                            .sort((a, b) => b.experience - a.experience)
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
     * Create an excel file for the user to download the template
     */
    const generateParticipantFormat = async () => {
        const users = await getLeaderboard();

        if (users) {
            const usersData = Object.keys(users).sort((a, b) => users[b].totalDonations - users[a].totalDonations).map((user) => {
                return {
                    Uid: user,
                    UserName: users[user].userName,
                    experience: users[user].totalDonations,
                    Qoins: null
                }
            });

            const dataToWrite = xlsx.utils.json_to_sheet(usersData);

            let newWorkBook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(newWorkBook, dataToWrite, 'Leaderboard');
            xlsx.writeFile(newWorkBook, 'Leaderboard.xlsx');
        }
    }

    return (
        <Container>
            <Grid container spacing={3} className={styles.container}>
                <Grid item sm={6} xs={12}>
                    <Paper onClick={generateParticipantFormat} className={styles.pointer}>
                        <GetAppIcon className={styles.downloadIcon} /> Descarga la plantilla
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
                                        Arrastra y suelta el documento aquí una vez que asignes los qoins en excel o
                                        cualquier otro software de hojas de cálculo (debe ser un formato de los siguientes xlsx o xls)
                                        <br />
                                        También se vale darle click y buscar el archivo en tu computadora
                                    </Typography>
                                }
                            </div>
                    </Paper>
                </Grid>
                <ApproveLeaderboardResetDialog
                    open={openApproveDialog}
                    users={users}
                    onClose={() => setOpenApproveDialog(false)} />
            </Grid>
        </Container>
    );
}

export default Leaderboard;
