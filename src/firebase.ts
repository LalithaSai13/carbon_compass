import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAiCqfvyGiPVR6O8dloPqoBvsTjJftBZLU",
    authDomain: "carbon-compass-c87a2.firebaseapp.com",
    projectId: "carbon-compass-c87a2",
    storageBucket: "carbon-compass-c87a2.appspot.com",
    messagingSenderId: "824193370480",
    appId: "1:824193370480:web:4f342849506b61fb20a7b5"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);
