// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: 'AIzaSyA1EYibGd3to70_B6iCmAA0ZJvFGxBp8Y8',
  authDomain: 'shop-ecomerce.firebaseapp.com',
  projectId: 'shop-ecomerce',
  storageBucket: 'shop-ecomerce.appspot.com',
  messagingSenderId: '473863276840',
  appId: '1:473863276840:web:dc32e31c4174c0be72a81d',
  measurementId: 'G-1YLCLBHYZC'
}

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig)

export default firebaseApp
