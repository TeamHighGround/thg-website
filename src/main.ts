import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

const firebaseConfig = {
  apiKey: "AIzaSyCGOJeCzw70QUU-x_gfzLXGdvQVlQF44fQ",
  authDomain: "thg-esport.firebaseapp.com",
  projectId: "thg-esport",
  storageBucket: "thg-esport.firebasestorage.app",
  messagingSenderId: "362864662279",
  appId: "1:362864662279:web:2463879fc4b1c9cc3f17a2",
  measurementId: "G-Z3QZ2KFZLN"
};

// 1. Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// 2. Initialisation de Google Analytics
// C'est cette ligne qui active la collecte de données Analytics !
const analytics = getAnalytics(app);
console.log("AFTER getAnalytics(app)")

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

