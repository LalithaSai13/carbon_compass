import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBqKmPmdGcgdpK3gIGTewx2LBidJKx1EtU',
  authDomain: 'carbon-compass-df0ef.firebaseapp.com',
  projectId: 'carbon-compass-df0ef',
  storageBucket: 'carbon-compass-df0ef.appspot.com',
  messagingSenderId: '215825993019',
  appId: '1:215825993019:web:eeb80e7c8d84858279fb1e',
  measurementId: 'G-6FQ3T1FSQV',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);
