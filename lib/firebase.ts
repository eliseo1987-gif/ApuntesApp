import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyAKICmiX0e7E2p1k1kyBEKZLWmcy61FTyQ",
    authDomain: "apuntes-app-universal-2026.firebaseapp.com",
    projectId: "apuntes-app-universal-2026",
    storageBucket: "apuntes-app-universal-2026.firebasestorage.app",
    messagingSenderId: "495440635684",
    appId: "1:495440635684:web:a439ef172890a87ecff5b1"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let analytics;
if (typeof window !== 'undefined') {
    isSupported().then(supported => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

export { app, db, auth, analytics };
