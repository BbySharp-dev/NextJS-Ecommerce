importScripts('https://www.gstatic.com/firebasejs/8.8.0/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/8.8.0/firebase-messaging.js')

const firebaseConfig = {
  apiKey: 'AIzaSyA1EYibGd3to70_B6iCmAA0ZJvFGxBp8Y8',
  authDomain: 'shop-ecomerce.firebaseapp.com',
  projectId: 'shop-ecomerce',
  storageBucket: 'shop-ecomerce.appspot.com',
  messagingSenderId: '473863276840',
  appId: '1:473863276840:web:dc32e31c4174c0be72a81d',
  measurementId: 'G-1YLCLBHYZC'
}
// eslint-disable-next-line no-undef
firebase.initializeApp(firebaseConfig)
// eslint-disable-next-line no-undef
const messaging = firebase.messaging()

messaging.onBackgroundMessage(payload => {
  const notificationTitle = payload.notification.title
  const notificationOptions = {
    body: payload.notification.body,
    icon: './logo.png'
  }
  self.registration.showNotification(notificationTitle, notificationOptions)
})
