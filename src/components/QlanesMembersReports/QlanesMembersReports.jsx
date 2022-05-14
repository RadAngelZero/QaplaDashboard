import React from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import GetAppIcon from '@material-ui/icons/GetApp';

import * as xlsx from 'xlsx';

import styles from './QlanesMembersReports.module.css';
import { getQlanesMembers } from '../../services/database';

const QlanesMembersReports = () => {

    const generateReport = async () => {
        const members = await getQlanesMembers();
        const membersData = [];
        Object.keys(members.val()).forEach((qlanId) => {
            const qlan = members.val()[qlanId];
            Object.keys(qlan).forEach((qlanMember) => {
                membersData.push({
                    uid: qlanMember,
                    ...qlan[qlanMember],
                    qlanId
                });
            });
        });

        const dataToWrite = xlsx.utils.json_to_sheet(membersData);

        let newWorkBook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(newWorkBook, dataToWrite, 'Qlanes Report');
        const date = new Date();
        const title = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}Qlanes Report`;
        xlsx.writeFile(newWorkBook, `${title}.xlsx`);
    }

    return (
        <Container maxWidth='lg' style={{ marginTop: '2em' }}>
            <Grid container spacing={3}>
                <Grid item sm={12} xs={12}>
                    <Paper onClick={generateReport} className={styles.pointer}>
                        <GetAppIcon className={styles.downloadIcon} /> Descargar archivo de miembros
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}

export default QlanesMembersReports;