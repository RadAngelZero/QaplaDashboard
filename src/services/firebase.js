import firebase from 'firebase/app';
import 'firebase/database';

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

firebase.initializeApp(firebaseConfig);

export const database = firebase.database();