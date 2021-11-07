import { useAuth0 } from '@auth0/auth0-react';

import User from './User';

const Profile = () => {
    const {  user, isAuthenticated } = useAuth0();

    return (
        isAuthenticated && (
            <div style={{paddingLeft: '10%', paddingRight: 'auto' }}>
                Viewing Profile of :
                <User user={user} />
            </div>
        )
    )
}

export default Profile;
