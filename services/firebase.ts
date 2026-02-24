import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyAv9fXqqMsz65qBMHTae1y-QxEJdtU4fns",
    authDomain: "mnemo-bdbcc.firebaseapp.com",
    projectId: "mnemo-bdbcc",
    storageBucket: "mnemo-bdbcc.firebasestorage.app",
    messagingSenderId: "431870105361",
    appId: "1:431870105361:web:bf6c8ecbe2c955f9941eb0",
    measurementId: "G-K80LC6X4VG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
