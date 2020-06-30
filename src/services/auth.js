import { auth, FacebookAuthProvider, GoogleAuthProvider } from './firebase';

/**
 * Listens for changes on the user authentication status
 * @param {callback} callbackForAuthenticatedUser Handler for users correctly authenticated
 * @param {callback} callbackForUserNotAuthenticated Handler for users without account
 */
export function handleUserAuthentication(callbackForAuthenticatedUser, callbackForUserNotAuthenticated) {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            await callbackForAuthenticatedUser(user);
        } else {
            await callbackForUserNotAuthenticated();
        }
    });
}

/**
 * Allows the user to sign in with their email and password
 * @param {string} email User email
 * @param {string} password User password
 */
export async function signInWithFacebook() {
    return await auth.signInWithPopup(FacebookAuthProvider);
}


/**
 * Allows the user to sign in with their email and password
 * @param {string} email User email
 * @param {string} password User password
 */
export async function signInWithGoogle() {
    return await auth.signInWithPopup(GoogleAuthProvider);
}