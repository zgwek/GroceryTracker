import {initializeApp} from 'firebase/app';
import {getFirestore} from 'firebase/firestore';
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAksNF5-fzAUfoV_11y3_IIKGlBiRPvibQ",
    authDomain: "my-grocery-tracker.firebaseapp.com",
    projectId: "my-grocery-tracker",
    storageBucket: "my-grocery-tracker.appspot.com",
    messagingSenderId: "1096135942210",
    appId: "1:1096135942210:web:8e4a7191f452443e52cddb"
  };
  // Init Firebase
const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIRESTORE_DB = getFirestore(FIREBASE_APP)