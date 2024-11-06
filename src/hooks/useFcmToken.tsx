import { useEffect, useState } from 'react';
import { getMessaging, getToken } from 'firebase/messaging';
import firebaseApp from 'src/configs/firebase';
import { clearLocalDeviceToken, getLocalDeviceToken, setLocalDeviceToken } from 'src/helpers/storage';

const useFcmToken = () => {
    const [token, setToken] = useState('');

    useEffect(() => {
        const retrieveToken = async () => {
            try {
                if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                    const messaging = getMessaging(firebaseApp);

                    // Retrieve the notification permission status
                    const permission = await Notification.requestPermission();

                    const currentToken = await getToken(messaging, {
                        vapidKey:
                            process.env.FIREBASE_KEY_PAIR,
                    });
                    if (currentToken) {
                        setToken(currentToken);
                    }
                }
            } catch (error) {
            }
        };

        retrieveToken();
    }, []);
    if(token && token !== getLocalDeviceToken()) {
        clearLocalDeviceToken()
        setLocalDeviceToken(token)
    }
    
    return { fcmToken: token };
};

export default useFcmToken;