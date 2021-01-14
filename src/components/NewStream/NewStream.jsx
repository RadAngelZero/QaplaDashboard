import React from 'react';

import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';

const NewStream = ({ user }) => {
    console.log(user);
    return (
        <StreamerDashboardContainer user={user}>
            <h1>Algo</h1>
        </StreamerDashboardContainer>
    );
}

export default NewStream;