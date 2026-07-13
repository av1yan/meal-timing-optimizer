import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDMvhqpsyshHNpNHqc3S8QhSssssILJAu4',
  authDomain: 'meal-timing-optimizer.firebaseapp.com',
  projectId: 'meal-timing-optimizer',
  storageBucket: 'meal-timing-optimizer.firebasestorage.app',
  messagingSenderId: '919215581144',
  appId: '1:919215581144:web:7dfb2374b97c58c63ef4ad',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
