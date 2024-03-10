// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCu8l-cipCG5eYI6-RaR_82QTSvkXl4QqI",
    authDomain: "online-chess-da447.firebaseapp.com",
    projectId: "online-chess-da447",
    storageBucket: "online-chess-da447.appspot.com",
    messagingSenderId: "836749234958",
    appId: "1:836749234958:web:ec45bb8521c3355de77d5f",
    measurementId: "G-RNTZ8H9DR2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
