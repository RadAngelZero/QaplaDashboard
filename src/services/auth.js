import { auth, GoogleAuthProvider } from './firebase';
import { isDashboardUser } from './database';

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
                /* auth.signOut();
                alert('Usuario no autorizado, habla con el staff de Qapla para que autorizen tu cuenta'); */
            }
        } else {
            await callbackForUserNotAuthenticated();
        }
    });
}

/**
 * Allows the user to sign in with google
 */
export async function signInWithGoogle() {
    return await auth.signInWithPopup(GoogleAuthProvider);
}