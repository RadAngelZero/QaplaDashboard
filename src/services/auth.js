import { auth, FacebookAuthProvider, GoogleAuthProvider } from './firebase';
import { isDashboardUser } from './database';
import { createUserWithTwitch } from './functions';
import { TWITCH_CLIENT_ID, TWITCH_SECRET_ID } from '../utilities/Constants';

/**
 * Listens for changes on the user authentication status
 * @param {callback} callbackForAuthenticatedUser Handler for users correctly authenticated
 * @param {callback} callbackForUserNotAuthenticated Handler for users without account
 */
export function handleUserAuthentication(callbackForAuthenticatedUser, callbackForUserNotAuthenticated) {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            if (await isDashboardUser(user.uid)) {
                await callbackForAuthenticatedUser(user);
            } else {
                auth.signOut();
                alert('Usuario no autorizado, habla con el staff de Qapla para que autorizen tu cuenta');
            }
        } else {
            await callbackForUserNotAuthenticated();
        }
    });
}

/**
 * Allows the user to sign in with facebook
 */
export async function signInWithFacebook() {
    return await auth.signInWithPopup(FacebookAuthProvider);
}


/**
 * Allows the user to sign in with google
 */
export async function signInWithGoogle() {
    return await auth.signInWithPopup(GoogleAuthProvider);
}

/**
 * Allows the user to sign in with twitch
 */
export async function signInWithTwitch() {
    const code = await LoginWithTwitch();
    return createTwitchUser(code);
}

/**
 * Login the user with twitch and return their user code
 */
function LoginWithTwitch() {
    const redirectUri = 'http://localhost:3000';
    const uri =
        `https://id.twitch.tv/oauth2/authorize?` +
        `client_id=${TWITCH_CLIENT_ID}&` +
        `redirect_uri=${redirectUri}&` +
        `response_type=code&` +
        `scope=user:read:email%20user:edit%20bits:read%20user:edit%20channel:read:subscriptions%20channel:manage:redemptions`;
    return new Promise((resolve, reject) => {
      const authWindow = window.open(
            uri,
            "_blank",
            "toolbar=yes,scrollbars=yes,resizable=yes,width=500,height=500"
      );

      let url;
      setInterval(async () => {
        try {
            url = authWindow && authWindow.location && authWindow.location.search;
        } catch (e) {}
        if (url) {
            const urlBueno = `https://algo.com${url}`;
            let url2 = new URL(urlBueno);
            const code = url2.searchParams.get('code');
            authWindow.close();
            resolve(code);
        }
      }, 500);
    });
};

/**
 * Get the user auth token and create/update the user in
 * our auth system
 * @param {string} code Twitch user code
 */
async function createTwitchUser(code) {
    try {
        const result = await fetch(`https://id.twitch.tv/oauth2/token?` +
            `client_id=${TWITCH_CLIENT_ID}&` +
            `client_secret=${TWITCH_SECRET_ID}&` +
            `code=${code}&` +
            `grant_type=authorization_code&` +
            `redirect_uri=http://localhost:3000`, { method: 'POST' });

        const resultData = await result.json()
        let user = await getTwitchUserData(resultData.access_token);
        user.id = `${user.id}-${user.display_name}`
        const userToken = (await createUserWithTwitch(user.id, user.display_name)).data;
        auth.signInWithCustomToken(userToken);
    } catch (err) {
        console.error(err);
    }
}

/**
 * Get the info of the given twitch user
 * @param {string} access_token Twitch user access token
 */
async function getTwitchUserData(access_token) {
    const response = await fetch('https://api.twitch.tv/helix/users', {
        method: 'GET',
        headers: {
            "Client-Id": TWITCH_CLIENT_ID,
            Authorization: `Bearer ${access_token}`
        }
    });
    const user = (await response.json()).data[0];

    return user;
};