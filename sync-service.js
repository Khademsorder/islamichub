/**
 * Islamic Hub — Cloud Sync Service
 * Synchronizes reading progress, bookmarks, and settings with Firestore.
 */

const SyncService = (() => {
    let _db = null;
    const getDb = () => {
        if (!_db && window.firebase && firebase.apps.length > 0) {
            _db = firebase.firestore();
        }
        return _db;
    };

    const SYNC_KEYS = {
        KHATAM_PROGRESS: 'khatam_last_playback',
        KHATAM_HISTORY: 'khatam_read_ayahs',
        BOOKMARKS: 'islamic_bookmarks',
        LAST_PLAYBACK: 'islamic_last_playback'
    };

    /**
     * Pushes a specific key from localStorage to Firestore
     */
    async function pushToCloud(key) {
        const db = getDb();
        if (!db) return;

        const user = ProfileService.getUser();
        if (!user || !user.isLoggedIn || !user.uid) return;

        try {
            const data = localStorage.getItem(key);
            if (!data) return;

            const parsedData = JSON.parse(data);
            await db.collection('user_sync').doc(user.uid).collection('data').doc(key).set({
                payload: parsedData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            console.log(`[Sync] Pushed ${key} to cloud.`);
        } catch (e) {
            console.error(`[Sync] Failed to push ${key}:`, e);
        }
    }

    /**
     * Pulls a specific key from Firestore to localStorage
     */
    async function pullFromCloud(key) {
        const db = getDb();
        if (!db) return null;

        const user = ProfileService.getUser();
        if (!user || !user.isLoggedIn || !user.uid) return null;

        try {
            const doc = await db.collection('user_sync').doc(user.uid).collection('data').doc(key).get();
            if (doc.exists) {
                const cloudData = doc.data().payload;
                localStorage.setItem(key, JSON.stringify(cloudData));
                console.log(`[Sync] Pulled ${key} from cloud.`);
                return cloudData;
            }
        } catch (e) {
            console.error(`[Sync] Failed to pull ${key}:`, e);
        }
        return null;
    }

    /**
     * Synchronizes all core data
     */
    async function syncAll() {
        const user = ProfileService.getUser();
        if (!user || !user.isLoggedIn) return;

        console.log("[Sync] Starting full synchronization...");
        for (const key of Object.values(SYNC_KEYS)) {
            await pullFromCloud(key);
            await pushToCloud(key);
        }
    }

    return {
        SYNC_KEYS,
        pushToCloud,
        pullFromCloud,
        syncAll
    };
})();
