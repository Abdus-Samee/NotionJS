import { useAuth0 } from "@auth0/auth0-react"

const Signup = () => {
    const { loginWithRedirect, isAuthenticated } = useAuth0();

    return (
        !isAuthenticated && (
            <div>
                <button onClick={() => loginWithRedirect({ screen_hint: 'signup' })}>Signup</button>
            </div>
        )
    )
}

export default Signup
