/* Firebase configuration for Gordon Game Hub.
   Replace the placeholder values below with your real Firebase config
   from https://console.firebase.google.com */

const firebaseConfig = {
  apiKey: "AIzaSyDomlEcRZNQtJlm6On_pN1zAkJ3Wr9QtR0",
  authDomain: "gordon-game-hub.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "gordon-game-hub",
  storageBucket: "gordon-game-hub.firebasestorage.app",
  messagingSenderId: "525086027738",
  appId: "1:525086027738:web:ada6470da2422d1e3bdae3"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
