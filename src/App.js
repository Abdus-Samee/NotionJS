import { useAuth0 } from '@auth0/auth0-react';

import Login from './components/Login';
import Logout from './components/Logout';
import Signup from './components/Signup';
import Profile from './components/Profile';

const App = () => {
    const { isLoading, isAuthenticated } = useAuth0();

    if(isLoading){
        return <div>Loading...</div>
    }

    return(
        <>
            <div style={{paddingLeft: '50%', paddingRight: 'auto' }}>
              <Login />
              <br />
              <Signup />
            </div>
            <Logout />
            <Profile />
        </>
    )
}

export default App;