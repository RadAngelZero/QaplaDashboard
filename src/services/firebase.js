import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/functions';
import 'firebase/auth';
import 'firebase/storage';

//Uncomment for testing
/* const firebaseTESTConfig = {
    apiKey: "AIzaSyAe5CB9vnrEsqxv39UkymWB90T1Pc4LDkw",
    authDomain: "qaplatesting.firebaseapp.com",
    databaseURL: "https://qaplatesting.firebaseio.com",
    projectId: "qaplatesting",
    storageBucket: "qaplatesting.appspot.com",
    messagingSenderId: "66587586976",
    appId: "1:66587586976:web:42d29e7511e74e995b34c5",
    measurementId: "G-4ZS9YZFXLW"
};

firebase.initializeApp(firebaseTESTConfig); */

 // Comment for testing
const firebaseConfig = {
    apiKey: "AIzaSyAwrwwTRiyYV7-SzOvE6kEteE0lmYhBe8c",
    authDomain: "qapplaapp.firebaseapp.com",
    databaseURL: "https://qapplaapp.firebaseio.com",
    projectId: "qapplaapp",
    storageBucket: "qapplaapp.appspot.com",
    messagingSenderId: "779347879760",
    appId: "1:779347879760:web:fa92ef4d26d99c8420ee55",
    measurementId: "G-RQLFYC5MPF"
};

// Comment for testing
firebase.initializeApp(firebaseConfig);

export const database = firebase.database();
export const functions = firebase.functions();
export const auth = firebase.auth();
export const storage = firebase.storage();

/**
 * Auth providers
 */
export const FacebookAuthProvider = new firebase.auth.FacebookAuthProvider();
export const GoogleAuthProvider = new firebase.auth.GoogleAuthProvider();