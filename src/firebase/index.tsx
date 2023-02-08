// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDvUpm2GOSLMpSpbhBTg9sSPUauw2UYHz0",
  authDomain: "stream-video-74228.firebaseapp.com",
  projectId: "stream-video-74228",
  storageBucket: "stream-video-74228.appspot.com",
  messagingSenderId: "364568176761",
  appId: "1:364568176761:web:61c9d786e235ae791acca8",
  measurementId: "G-K0CKN9CP9F",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Cloud Storage and get a reference to the service
export const storageFB = getStorage(app);
