const PermissionService = (() => {
    async function openAppSettings() {
        try {
            if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
                const { App } = await import('@capacitor/app');
                await App.openSettings();
                return true;
            }
        } catch (e) {
        }
        return false;
    }

    function showDeniedMessage(message) {
        try {
            if (typeof window.showNativeToast !== 'undefined') {
                window.showNativeToast(message);
                return;
            }
        } catch (e) {
        }

        try {
            if (typeof UI !== 'undefined' && UI.showToast) {
                UI.showToast(message);
                return;
            }
        } catch (e) {
        }

        alert(message);
    }

    async function requestLocationPermission() {
        try {
            const { Geolocation } = await import('@capacitor/geolocation');
            const perm = await Geolocation.checkPermissions();
            if (perm.location === 'granted') return true;

            const result = await Geolocation.requestPermissions();
            return result.location === 'granted';
        } catch (e) {
            return false;
        }
    }

    async function requestCameraPermission() {
        try {
            const { Camera } = await import('@capacitor/camera');
            const perm = await Camera.checkPermissions();
            if (perm.camera === 'granted') return true;

            const result = await Camera.requestPermissions();
            return result.camera === 'granted';
        } catch (e) {
            return false;
        }
    }

    async function requestNotificationPermission() {
        try {
            const { PushNotifications } = await import('@capacitor/push-notifications');
            const perm = await PushNotifications.checkPermissions();

            if (perm.receive === 'granted') return true;
            if (perm.receive === 'denied') return false;

            const result = await PushNotifications.requestPermissions();
            return result.receive === 'granted';
        } catch (e) {
            try {
                if ('Notification' in window) {
                    if (Notification.permission === 'granted') return true;
                    if (Notification.permission === 'denied') return false;
                    const result = await Notification.requestPermission();
                    return result === 'granted';
                }
            } catch (e2) {
            }
            return false;
        }
    }

    async function ensureLocationOrExplain() {
        const ok = await requestLocationPermission();
        if (!ok) {
            showDeniedMessage('লোকেশন পারমিশন দেওয়া হয়নি। কিবলা/নামাজের সময় সঠিকভাবে পেতে Settings থেকে Location চালু করুন।');
        }
        return ok;
    }

    async function ensureCameraOrExplain() {
        const ok = await requestCameraPermission();
        if (!ok) {
            showDeniedMessage('ক্যামেরা পারমিশন দেওয়া হয়নি। স্ক্যানার ব্যবহার করতে Settings থেকে Camera চালু করুন।');
        }
        return ok;
    }

    async function ensureNotificationsOrExplain() {
        const ok = await requestNotificationPermission();
        if (!ok) {
            showDeniedMessage('নোটিফিকেশন পারমিশন দেওয়া হয়নি। Settings থেকে Notification চালু করুন।');
        }
        return ok;
    }

    async function requestMicrophonePermission() {
        try {
            // Try Capacitor first
            if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
                const { Permissions } = await import('@capacitor/permissions');
                const perm = await Permissions.query({ permission: 'microphone' });
                if (perm.state === 'granted') return true;
                const result = await Permissions.request({ permission: 'microphone' });
                return result.state === 'granted';
            }
        } catch (e) {}

        // Browser fallback
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (e) {
            return false;
        }
    }

    async function ensureMicrophoneOrExplain() {
        const ok = await requestMicrophonePermission();
        if (!ok) {
            showDeniedMessage('মাইক্রোফোন পারমিশন দেওয়া হয়নি। তাজবিদ চেকার ব্যবহার করতে Settings থেকে Microphone চালু করুন।');
        }
        return ok;
    }

    return {
        openAppSettings,
        showDeniedMessage,
        requestLocationPermission,
        requestCameraPermission,
        requestNotificationPermission,
        requestMicrophonePermission,
        ensureLocationOrExplain,
        ensureCameraOrExplain,
        ensureNotificationsOrExplain,
        ensureMicrophoneOrExplain
    };
})();
