/* Firebase configuration for Gordon Game Hub.
   Loaded from local untracked file: js/firebase-config.local.js */

const firebaseConfig = window.GORDON_FIREBASE_CONFIG || null;

if (!firebaseConfig || !firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
  throw new Error('Missing GORDON_FIREBASE_CONFIG. Copy js/firebase-config.local.example.js to js/firebase-config.local.js');
}

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
