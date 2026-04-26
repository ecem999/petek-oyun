// Firebase Yapılandırması
const firebaseConfig = {
  apiKey: 'AIzaSyAQAZ9d_7TlNyNkO6bqyqMbgpcGynwB1f0',
  authDomain: 'petek-oyun-da5f2.firebaseapp.com',
  databaseURL: 'https://petek-oyun-da5f2-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'petek-oyun-da5f2',
  storageBucket: 'petek-oyun-da5f2.firebasestorage.app',
  messagingSenderId: '826480009401',
  appId: '1:826480009401:web:762429550988c544bf7b68',
  measurementId: 'G-WS99PG9R73'
};

// Firebase'i başlat
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
