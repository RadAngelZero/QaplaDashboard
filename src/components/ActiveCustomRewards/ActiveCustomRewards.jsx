import React from 'react';
import { Container, List, ListItem, ListItemAvatar, Tooltip, Avatar, ListItemText } from '@material-ui/core';
import { useEffect } from 'react';
import { getAllActiveCustomRewards, getStreamerProfile } from '../../services/database';
import { useState } from 'react';

const ActiveCustomRewards = () => {
    const [customRewards, setCustomRewards] = useState({});

    useEffect(() => {
        async function getStreamerInfo(streamerUid) {
            return (await getStreamerProfile(streamerUid)).val();
        }

        async function loadActiveRewards() {
            let rewards = await getAllActiveCustomRewards();
            if (rewards.exists()) {
                const rewardsObject = {};
                rewards = Object.keys(rewards.val()).map((rewardId) => ({ ...rewards.val()[rewardId], key: rewardId}));

                for (let i = 0; i < rewards.length; i++) {
                    const reward = rewards[i];
                    const streamerInfo = await getStreamerInfo(reward.streamerUid);
                    rewardsObject[reward.key] = {...reward, streamerInfo};
                }

                setCustomRewards(rewardsObject);
            }
        }

        loadActiveRewards();
    }, []);

    return (
        <Container maxWidth='lg'>
            <List>
                {Object.keys(customRewards).map((streamId) => (
                    <ListItem>
                        <ListItemAvatar>
                            <Tooltip title={customRewards[streamId].streamerInfo.displayName} style={{ marginTop: 8 }}>
                                <Avatar src={customRewards[streamId].streamerInfo.photoUrl}
                                    alt={customRewards[streamId].streamerInfo.displayName} />
                            </Tooltip>
                        </ListItemAvatar>
                        <ListItemText primary={`Recompensa creada: ${(new Date(customRewards[streamId].timestamp).toLocaleString('es-mx'))}`} />
                    </ListItem>
                ))}
            </List>
        </Container>
    );
}

export default ActiveCustomRewards;
