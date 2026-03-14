/**
 * Islamic Hub — Profile Service (Upgraded)
 * Features: Google Login (Firebase), Glassmorphism UI, Cloud Sync (Firestore)
 * Author: Islamic Hub Team
 */

const ProfileService = (() => {
    // ---------- Firebase Configuration (from your JSON) ----------
    const firebaseConfig = {
        apiKey: "AIzaSyCLdhk8poZ9C1rLMM9l-KFbeXauvK7NIXc",
        authDomain: "islamic-9f925.firebaseapp.com",
        projectId: "islamic-9f925",
        storageBucket: "islamic-9f925.firebasestorage.app",
        messagingSenderId: "935632050383",
        appId: "1:935632050383:android:3d3fd01cdb031cada4ffba"
    };

    // Initialize Firebase (Safely)
    const initFirebase = () => {
        if (typeof firebase !== 'undefined') {
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            return true;
        }
        return false;
    };

    const getAuth = () => {
        if (initFirebase()) return firebase.auth();
        return null;
    };

    const getDb = () => {
        if (initFirebase()) return firebase.firestore();
        return null;
    };

    // ---------- Storage Keys ----------
    const STORAGE_KEYS = {
        USER: 'ih_user_profile',
        STATS: 'ih_user_stats',
        CHAT_HISTORY: 'ai_chat_history',
        SALAH_LOGS: 'salah_logs',
        QURAN_PROGRESS: 'quran_reading_progress',
        HADITH_READ: 'hadith_read_ids',
        QUESTIONS_ASKED: 'questions_asked_count',
        APP_LOCK: 'app_lock_enabled',
        CUSTOM_JAMAT_TIMES: 'ih_custom_jamat_times',
        USE_CUSTOM_JAMAT: 'ih_use_custom_jamat'
    };

    // ---------- Default Data ----------
    const getDefaultUser = () => ({
        uid: null,
        name: 'Guest',
        email: '',
        photo: null,
        isLoggedIn: false,
        loginMethod: null,
        createdAt: Date.now(),
        lastLogin: null
    });

    const getDefaultStats = () => ({
        totalChats: 0,
        totalQuestions: 0,
        quranAyahsRead: 0,
        quranSurahsCompleted: 0,
        hadithRead: 0,
        salahCompleted: 0,
        salahStreak: 0,
        duaRead: 0,
        daysActive: 0,
        joinDate: Date.now(),
        lastActiveDate: null
    });

    // ---------- Theme (Soft Green + Glass) ----------
    const THEME = {
        primary: '#0A5438',
        primaryLight: '#059669',
        accent: '#10b981',
        gold: '#f59e0b',
        purple: '#7c3aed',
        softGreenStart: '#E8F5E9',
        softGreenEnd: '#C8E6C9',
        glassWhite: 'rgba(255, 255, 255, 0.25)',
        glassBorder: 'rgba(255, 255, 255, 0.2)',
        glassShadow: '0 8px 32px rgba(10, 84, 56, 0.1)'
    };

    // ---------- Helper: Show Toast ----------
    function showToast(message, type = 'info') {
        // Use custom toast to avoid navbar conflicts
        const toast = document.createElement('div');
        const bgColor = type === 'error' ? '#ef4444' : (type === 'success' ? '#10b981' : THEME.primary);
        toast.style.cssText = `
            position: fixed; top: 80px; left: 50%; transform: translateX(-50%);
            background: ${bgColor}; color: white; padding: 12px 24px;
            border-radius: 30px; z-index: 999999; font-size: 14px;
            font-weight: 600; box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            max-width: 90%; text-align: center;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // ---------- Check Network ----------
    function isOnline() {
        return navigator.onLine;
    }

    // ---------- Local Storage Helpers ----------
    function getUser() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.USER);
            return data ? JSON.parse(data) : getDefaultUser();
        } catch (e) {
            return getDefaultUser();
        }
    }

    function saveUser(user) {
        try {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        } catch (e) {
            console.error('Error saving user:', e);
        }
    }

    // ---------- Custom Jamat Time Helpers ----------
    function getCustomJamatTimes() {
        const times = localStorage.getItem(STORAGE_KEYS.CUSTOM_JAMAT_TIMES);
        return times ? JSON.parse(times) : {
            Fajr: "05:00",
            Dhuhr: "13:30",
            Asr: "16:30",
            Maghrib: "18:15",
            Isha: "20:00"
        };
    }

    function saveCustomJamatTimes(times) {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_JAMAT_TIMES, JSON.stringify(times));
        const db = getDb();
        if (db && getUser().uid) {
            db.collection('users').doc(getUser().uid).set({
                customJamatTimes: times
            }, { merge: true });
        }
    }

    function isCustomJamatEnabled() {
        return localStorage.getItem(STORAGE_KEYS.USE_CUSTOM_JAMAT) === 'true';
    }

    function setCustomJamatEnabled(enabled) {
        localStorage.setItem(STORAGE_KEYS.USE_CUSTOM_JAMAT, enabled ? 'true' : 'false');

        // Sync with namazLocationPref
        const locationPref = JSON.parse(localStorage.getItem('namazLocationPref')) || { type: 'auto' };
        if (enabled) {
            locationPref.type = 'custom';
        } else if (locationPref.type === 'custom') {
            locationPref.type = 'auto'; // Fallback to auto if disabling custom
        }
        localStorage.setItem('namazLocationPref', JSON.stringify(locationPref));

        // Update home screen dropdown if it exists
        const divSelect = document.getElementById('userDivisionSelect');
        const container = document.getElementById('districtUpazilaContainer');
        if (divSelect) {
            divSelect.value = enabled ? 'custom' : (locationPref.type === 'manual' ? locationPref.division : 'auto');
        }
        if (container) {
            container.style.display = (divSelect && divSelect.value !== 'auto' && divSelect.value !== 'custom') ? 'flex' : 'none';
        }

        // Update profile modal toggle if it exists
        const toggle = document.getElementById('useCustomJamatToggle');
        if (toggle) toggle.checked = enabled;

        if (window.PrayerTimeModule && window.PrayerTimeModule.updateUI) {
            window.PrayerTimeModule.updateUI();
        }

        // Specifically for Profile Modal, we might need a small delay to ensure DOM is updated if changing from dropdown
        setTimeout(() => {
            const toggle = document.getElementById('useCustomJamatToggle');
            if (toggle) toggle.checked = enabled;
        }, 100);
    }

    function getStats() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.STATS);
            const stats = data ? JSON.parse(data) : getDefaultStats();
            stats.totalChats = getChatCount();
            stats.salahCompleted = getSalahCount();
            stats.salahStreak = getSalahStreak();
            stats.hadithRead = getHadithCount();
            stats.totalQuestions = getQuestionCount();
            return stats;
        } catch (e) {
            return getDefaultStats();
        }
    }

    function saveStats(stats) {
        try {
            localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
        } catch (e) { }
    }

    // ---------- Real Google Login (Firebase) ----------
    async function googleLogin() {
        if (!isOnline()) {
            showToast('ইন্টারনেট সংযোগ নেই', 'error');
            return { success: false, error: 'No internet' };
        }

        // Check if running in browser without https
        if (typeof window !== 'undefined' && !window.location.protocol.startsWith('https') && !window.location.protocol.startsWith('file')) {
            showToast('Google Login এর জন্য HTTPS বা Native App প্রয়োজন', 'error');
            return { success: false, error: 'HTTPS required' };
        }

        try {
            const isNative = window.Capacitor?.isNativePlatform?.() || false;
            let userCredential;

            if (isNative) {
                const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
                const result = await GoogleAuth.signIn();
                userCredential = {
                    user: {
                        uid: result.id,
                        displayName: result.name,
                        email: result.email,
                        photoURL: result.imageUrl
                    }
                };
            } else {
                // Web mode - only works with https
                if (window.location.protocol === 'file:') {
                    showToast('Native App এ Google Login ব্যবহার করুন', 'error');
                    return { success: false, error: 'File protocol' };
                }
                const provider = new firebase.auth.GoogleAuthProvider();
                const auth = getAuth();
                if (!auth) {
                    showToast('Firebase initialization failed', 'error');
                    return { success: false, error: 'Auth failed' };
                }
                userCredential = await auth.signInWithPopup(provider);
            }

            const { user } = userCredential;
            const currentUser = getUser();

            const profile = {
                uid: user.uid,
                name: user.displayName || 'Islamic User',
                email: user.email || '',
                photo: user.photoURL || null,
                isLoggedIn: true,
                loginMethod: 'google',
                createdAt: currentUser.createdAt || Date.now(),
                lastLogin: Date.now()
            };

            saveUser(profile);
            await syncUserToCloud(profile);
            await updateStatsOnLogin();

            if (window.SyncService) {
                await SyncService.syncAll();
            }

            closeProfileView();
            showProfileView();
            syncSidebarUser();

            showToast('লগইন সফল হয়েছে', 'success');
            return { success: true, user: profile };
        } catch (error) {
            console.error('Google login error:', error);
            showToast('লগইন ব্যর্থ: ' + error.message, 'error');
            return { success: false, error };
        }
    }

    // ---------- Firestore Sync ----------
    async function syncUserToCloud(user) {
        try {
            const db = getDb();
            if (!db) return;
            const userRef = db.collection('users').doc(user.uid);
            await userRef.set({
                name: user.name,
                email: user.email,
                photo: user.photo,
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        } catch (e) {
            console.warn('Cloud sync failed', e);
        }
    }

    async function syncStatsToCloud(stats) {
        const user = getUser();
        if (!user.isLoggedIn) return;
        try {
            const db = getDb();
            if (!db) return;
            const statsRef = db.collection('stats').doc(user.uid);
            await statsRef.set(stats, { merge: true });
        } catch (e) {
            console.warn('Stats sync failed', e);
        }
    }

    // ---------- Logout ----------
    async function logout() {
        try {
            const auth = getAuth();
            if (auth) await auth.signOut();
        } catch (e) {
            console.warn('Firebase sign out error:', e);
        }
        const defaultUser = getDefaultUser();
        saveUser(defaultUser);
        showToast('লগআউট সম্পন্ন', 'info');
        closeProfileView();
        syncSidebarUser();
        return true;
    }

    // ---------- Update Profile ----------
    function updateProfile(updates) {
        const user = getUser();
        const updated = { ...user, ...updates };
        saveUser(updated);
        if (user.isLoggedIn) {
            syncUserToCloud(updated);
        }
        return updated;
    }

    // ---------- Stats Management ----------
    function updateStats(updates) {
        const stats = getStats();
        const today = new Date().toDateString();
        if (stats.lastActiveDate !== today) {
            updates.daysActive = (stats.daysActive || 0) + 1;
            updates.lastActiveDate = today;
        }
        const updated = { ...stats, ...updates };
        saveStats(updated);
        const user = getUser();
        if (user.isLoggedIn) {
            syncStatsToCloud(updated);
        }
        return updated;
    }

    async function updateStatsOnLogin() {
        const stats = getStats();
        stats.lastActiveDate = new Date().toDateString();
        saveStats(stats);
        const user = getUser();
        if (user.isLoggedIn) {
            await syncStatsToCloud(stats);
        }
    }

    // ---------- Counter Helpers ----------
    function getChatCount() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
            return data ? JSON.parse(data).length : 0;
        } catch { return 0; }
    }

    function getSalahCount() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.SALAH_LOGS);
            const logs = data ? JSON.parse(data) : {};
            let total = 0;
            Object.values(logs).forEach(log => {
                if (log.prayers) total += Object.values(log.prayers).filter(v => v === true).length;
            });
            return total;
        } catch { return 0; }
    }

    function getSalahStreak() {
        try {
            const streak = localStorage.getItem('salah_streak');
            return streak ? JSON.parse(streak).current || 0 : 0;
        } catch { return 0; }
    }

    function getHadithCount() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.HADITH_READ);
            if (!data) return 0;
            const read = JSON.parse(data);
            return Array.isArray(read) ? read.length : Object.keys(read).length;
        } catch { return 0; }
    }

    function getQuestionCount() {
        try {
            return parseInt(localStorage.getItem(STORAGE_KEYS.QUESTIONS_ASKED)) || getChatCount();
        } catch { return getChatCount(); }
    }

    // ---------- Trackers ----------
    function trackQuranReading(surah, ayah) {
        updateStats({ quranAyahsRead: (getStats().quranAyahsRead || 0) + 1 });
    }

    function trackHadithRead(hadithId) {
        try {
            let read = JSON.parse(localStorage.getItem(STORAGE_KEYS.HADITH_READ) || '[]');
            if (!read.includes(hadithId)) {
                read.push(hadithId);
                localStorage.setItem(STORAGE_KEYS.HADITH_READ, JSON.stringify(read));
                updateStats({ hadithRead: read.length });
            }
        } catch (e) { }
    }

    function trackQuestionAsked() {
        try {
            const current = parseInt(localStorage.getItem(STORAGE_KEYS.QUESTIONS_ASKED) || '0');
            localStorage.setItem(STORAGE_KEYS.QUESTIONS_ASKED, (current + 1).toString());
            updateStats({ totalQuestions: current + 1 });
        } catch (e) { }
    }

    // ---------- App Lock ----------
    function isAppLockEnabled() {
        return localStorage.getItem(STORAGE_KEYS.APP_LOCK) === 'true';
    }

    function toggleAppLock(enabled) {
        localStorage.setItem(STORAGE_KEYS.APP_LOCK, enabled);
        showToast(enabled ? 'App Lock সক্রিয়' : 'App Lock নিষ্ক্রিয়', 'info');
    }

    // ---------- UI: Profile Modal with Glassmorphism ----------
    function showProfileView() {
        closeProfileView();
        const user = getUser();
        const stats = getStats();

        const modal = document.createElement('div');
        modal.id = 'profileModal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            z-index: 99999; font-family: 'Noto Sans Bengali', sans-serif;
            background: url('img/profile-premium-bg.png') center/cover no-repeat;
            overflow: hidden;
        `;

        const glassCardStyle = `
            background: rgba(255, 255, 255, 0.45);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(10, 84, 56, 0.1);
            border-radius: 24px;
            box-shadow: 0 8px 32px rgba(10, 84, 56, 0.05);
        `;

        modal.innerHTML = `
            <!-- Fixed White Premium Shaded Overlay -->
            <div style="position:absolute; inset:0; background: rgba(255, 255, 255, 0.65); backdrop-filter: blur(3px); -webkit-backdrop-filter:blur(3px); z-index: 1;"></div>

            <div style="position:relative; z-index:2; height: 100%; overflow-y: auto;">
                <div style="position: sticky; top: 0; background:rgba(255,255,255,0.5); backdrop-filter:blur(10px); padding: 20px 16px; padding-top: max(20px, env(safe-area-inset-top)); border-radius: 0 0 24px 24px; border-bottom:1px solid rgba(10, 84, 56, 0.1); z-index: 10; box-shadow:0 8px 32px rgba(10, 84, 56, 0.05);">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                        <button onclick="ProfileService.closeProfileView()" style="background: rgba(10, 84, 56, 0.08); border: 1px solid rgba(10, 84, 56, 0.1); width: 44px; height: 44px; border-radius: 14px; cursor: pointer; color: ${THEME.primary}; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);">
                            <span class="material-symbols-rounded" style="font-size: 26px;">arrow_back</span>
                        </button>
                        <h1 style="margin: 0; font-size: 22px; color: ${THEME.primary}; font-weight: 800;">প্রোফাইল</h1>
                    </div>

                    <div style="display: flex; align-items: center; gap: 16px;">
                        <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, white, rgba(255,255,255,0.7)); display: flex; align-items: center; justify-content: center; border: 4px solid rgba(255,255,255,0.6); overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                            ${user.photo ? `<img src="${user.photo}" style="width:100%;height:100%;object-fit:cover;">` : `<span class="material-symbols-rounded" style="font-size: 40px; color: ${THEME.primary};">person</span>`}
                        </div>
                        <div style="flex:1;">
                            <h2 style="margin:0; font-size: 22px; color: ${THEME.primary}; font-weight: 800;">${user.name}</h2>
                            <p style="margin:4px 0 0; font-size: 13px; color: ${THEME.primary}aa; font-weight:600;">${user.isLoggedIn ? '✓ সংযুক্ত' : 'গেস্ট মোড'}</p>
                            ${user.email ? `<p style="margin:4px 0 0; font-size: 12px; color: ${THEME.primary}80;">${user.email}</p>` : ''}
                        </div>
                        <button onclick="ProfileService.showEditProfile()" style="background: rgba(10, 84, 56, 0.08); border: 1px solid rgba(10, 84, 56, 0.1); width: 40px; height: 40px; border-radius: 12px; cursor: pointer; color: ${THEME.primary}; backdrop-filter: blur(5px);">
                            <span class="material-symbols-rounded">edit</span>
                        </button>
                    </div>
                </div>

                <div style="padding: 16px;">
                <!-- Live Prayer Countdown Section -->
                <div id="profilePrayerCountdown" style="${glassCardStyle}; padding: 16px; margin-bottom: 20px; text-align: center; border: 1.5px solid ${THEME.primary}20;">
                    <div style="font-size: 13px; color: ${THEME.primary}aa; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 6px;">
                        <span class="material-symbols-rounded" style="font-size: 18px;">schedule</span>
                        <span id="profNextPrayerName">পরবর্তী জামাত</span>
                    </div>
                    <div id="profCountdownTimer" style="font-size: 32px; font-weight: 900; color: ${THEME.primary}; margin: 5px 0; font-variant-numeric: tabular-nums;">--:--:--</div>
                    <div id="profNextPrayerTime" style="font-size: 12px; color: ${THEME.primary}80; font-weight: 600;">সময়: --:--</div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
                    <div style="${glassCardStyle}; padding: 16px; text-align: center;">
                        <div style="font-size: 28px; font-weight: 900; color: ${THEME.primary};">${stats.daysActive}</div>
                        <div style="font-size: 11px; color: ${THEME.primary}80;">দিন সক্রিয়</div>
                    </div>
                    <div style="${glassCardStyle}; padding: 16px; text-align: center;">
                        <div style="font-size: 28px; font-weight: 900; color: ${THEME.gold};">${stats.salahStreak}</div>
                        <div style="font-size: 11px; color: ${THEME.primary}80;">দিন স্ট্রিক</div>
                    </div>
                    <div style="${glassCardStyle}; padding: 16px; text-align: center;">
                        <div style="font-size: 28px; font-weight: 900; color: ${THEME.purple};">${stats.totalChats}</div>
                        <div style="font-size: 11px; color: ${THEME.primary}80;">AI চ্যাট</div>
                    </div>
                </div>

                <div style="${glassCardStyle}; padding: 20px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 16px; font-size: 16px; color: ${THEME.primary}; display: flex; align-items: center; gap: 8px;">
                        <span class="material-symbols-rounded" style="font-size: 22px;">insights</span>
                        বিস্তারিত পরিসংখ্যান
                    </h3>
                    <div onclick="ProfileService.openQuranTracker()" style="cursor:pointer; transition: transform 0.2s;" onmousedown="this.style.transform='scale(0.98)'" onmouseup="this.style.transform='scale(1)'">
                        ${renderStatItem('কুরআন পাঠ', `${stats.quranAyahsRead} আয়াত`, stats.quranAyahsRead, THEME.primary, 'menu_book')}
                    </div>
                    ${renderStatItem('হাদিস পাঠ', `পড়েছেন ${stats.hadithRead}টি`, stats.hadithRead, THEME.purple, 'auto_stories')}
                    <div onclick="ProfileService.openSalatTracker()" style="cursor:pointer; transition: transform 0.2s;" onmousedown="this.style.transform='scale(0.98)'" onmouseup="this.style.transform='scale(1)'">
                        ${renderStatItem('নামাজ ট্র্যাকার', `মোট ${stats.salahCompleted} ওয়াক্ত`, stats.salahCompleted, THEME.gold, 'mosque')}
                    </div>
                    ${renderStatItem('প্রশ্ন-উত্তর', `${stats.totalQuestions}টি প্রশ্ন`, stats.totalQuestions, '#3b82f6', 'quiz')}
                </div>

                <!-- Custom Jamat Times Section -->
                <div style="${glassCardStyle}; padding: 20px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 16px; font-size: 16px; color: ${THEME.primary}; display: flex; align-items: center; gap: 8px;">
                        <span class="material-symbols-rounded" style="font-size: 22px;">schedule</span>
                        জামাতের সময় (ম্যানুয়াল)
                    </h3>
                    <p style="font-size: 12px; color: ${THEME.primary}aa; margin-bottom: 15px; font-weight: 600;">মসজিদের জামাতের সাথে মিলাতে সময়গুলো সেট করুন।</p>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                        ${Object.entries(getCustomJamatTimes()).map(([prayer, time]) => `
                            <div style="background: rgba(255,255,255,0.3); padding: 10px; border-radius: 12px; border: 1px solid rgba(10, 84, 56, 0.05);">
                                <label style="display:block; font-size: 11px; color: ${THEME.primary}80; margin-bottom: 4px; font-weight: 700;">${prayer === 'Fajr' ? 'ফজর' : prayer === 'Dhuhr' ? 'যোহর' : prayer === 'Asr' ? 'আসর' : prayer === 'Maghrib' ? 'মাগরিব' : 'এশা'}</label>
                                <input type="time" id="jamat-${prayer}" value="${time}" style="width:100%; border:none; background:transparent; font-size: 16px; font-weight: 800; color: ${THEME.primary}; outline:none;">
                            </div>
                        `).join('')}
                    </div>

                    <button onclick="ProfileService.saveManualJamatTimes()" style="width:100%; padding: 12px; border-radius: 12px; border: none; background: ${THEME.primary}; color: white; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <span class="material-symbols-rounded" style="font-size: 20px;">save</span>
                        সেভ করুন
                    </button>
                    
                    <div style="margin-top: 15px; display: flex; align-items: center; justify-content: space-between; padding-top: 15px; border-top: 1px dashed rgba(10, 84, 56, 0.1);">
                        <div style="font-weight: 700; font-size: 13px; color: ${THEME.primary};">কাস্টম মোড ব্যবহার করুন</div>
                        <label class="switch" style="position:relative; display:inline-block; width:44px; height:24px;">
                            <input type="checkbox" id="useCustomJamatToggle" onchange="ProfileService.setCustomJamatEnabled(this.checked); ProfileService.showToast(this.checked ? 'কাস্টম সময় সক্রিয়' : 'অটোমেটিক সময় সক্রিয়', 'info')" style="opacity:0; width:0; height=0;" ${isCustomJamatEnabled() ? 'checked' : ''}>
                            <span style="position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background-color:#ccc; transition:0.3s; border-radius:34px;"></span>
                        </label>
                    </div>
                </div>

                <div style="${glassCardStyle}; padding: 16px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #6b7280, #4b5563); display: flex; align-items: center; justify-content: center;">
                            <span class="material-symbols-rounded" style="color: white; font-size: 24px;">fingerprint</span>
                        </div>
                        <div>
                            <div style="font-weight: 700; color: ${THEME.primary};">App Lock</div>
                            <div style="font-size: 12px; color: ${THEME.primary}80;">বায়োমেট্রিক/পিন দিয়ে আনলক</div>
                        </div>
                    </div>
                    <label class="switch" style="position:relative; display:inline-block; width:52px; height:28px;">
                        <input type="checkbox" id="profileAppLockToggle" onchange="ProfileService.toggleAppLock(this.checked)" style="opacity:0; width:0; height=0;" ${isAppLockEnabled() ? 'checked' : ''}>
                        <span style="position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background-color:#ccc; transition:0.3s; border-radius:28px;"></span>
                        <style>
                            .switch input:checked + span { background-color: ${THEME.primary}; }
                            .switch input:checked + span:before { transform: translateX(24px); }
                            .switch span:before {
                                position: absolute; content: ""; height: 22px; width: 22px;
                                left: 3px; bottom: 3px; background-color: white;
                                transition: 0.3s; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                            }
                        </style>
                    </label>
                </div>

                ${!user.isLoggedIn ? `
                    <button onclick="ProfileService.handleLoginClick()" style="width:100%; padding:16px; border:none; border-radius:20px; background: linear-gradient(135deg, ${THEME.primary}, ${THEME.primaryLight}); color:white; font-size:16px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:12px; backdrop-filter: blur(10px); box-shadow: 0 4px 15px rgba(10,84,56,0.3);">
                        <span class="material-symbols-rounded">login</span>
                        Google দিয়ে লগইন করুন
                    </button>
                ` : `
                    <button onclick="ProfileService.logout(); ProfileService.showProfileView();" style="width:100%; padding:16px; border:2px solid #ef4444; border-radius:20px; background:rgba(255,255,255,0.3); backdrop-filter:blur(10px); color:#ef4444; font-size:16px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:8px;">
                        <span class="material-symbols-rounded">logout</span>
                        লগআউট করুন
                    </button>
                `}
                <p style="text-align:center; font-size:12px; color:${THEME.primary}80;">আপনার ডাটা ক্লাউডে সুরক্ষিত</p>
                <div style="height: 40px;"></div>
                </div><!-- /padding wrapper -->
            </div>
        </div>
        `;

        document.body.appendChild(modal);

        // Start live update
        startProfileCountdown();
    }

    let profileCountdownInterval = null;
    function startProfileCountdown() {
        if (profileCountdownInterval) clearInterval(profileCountdownInterval);

        const update = () => {
            if (!document.getElementById('profilePrayerCountdown')) {
                clearInterval(profileCountdownInterval);
                return;
            }

            if (window.PrayerTimeModule && window.PrayerTimeModule.getNextPrayerInfo) {
                const info = PrayerTimeModule.getNextPrayerInfo();
                const nameEl = document.getElementById('profNextPrayerName');
                const timerEl = document.getElementById('profCountdownTimer');
                const timeEl = document.getElementById('profNextPrayerTime');

                if (nameEl) nameEl.textContent = info.name + ' জামাত';
                if (timeEl) timeEl.textContent = 'সময়: ' + PrayerTimeModule.convertToBanglaNumbers(PrayerTimeModule.format12Hour(info.time));

                if (!info || !info.time) {
                    timerEl.textContent = "--:--:--";
                    return;
                }

                const h = Math.floor(info.remainingSecs / 3600);
                const m = Math.floor((info.remainingSecs % 3600) / 60);
                const s = info.remainingSecs % 60;

                if (isNaN(h) || isNaN(m) || isNaN(s)) {
                    timerEl.textContent = "--:--:--";
                    return;
                }

                const hStr = h.toString().padStart(2, '0');
                const mStr = m.toString().padStart(2, '0');
                const sStr = s.toString().padStart(2, '0');

                timerEl.textContent = PrayerTimeModule.convertToBanglaNumbers(`${hStr}:${mStr}:${sStr}`);

                // Visual feedback
                if (info.remainingSecs < 300) {
                    timerEl.style.color = '#ef4444';
                } else {
                    timerEl.style.color = THEME.primary;
                }
            }
        };

        update();
        profileCountdownInterval = setInterval(update, 1000);
    }

    function renderStatItem(label, subtitle, value, color, icon) {
        return `
            <div style="display: flex; align-items: center; padding: 14px; background: rgba(255,255,255,0.3); border-radius: 16px; margin-bottom: 10px; backdrop-filter: blur(5px);">
                <div style="width:44px; height:44px; border-radius:12px; background: linear-gradient(135deg, ${color}, ${color}dd); display:flex; align-items:center; justify-content:center;">
                    <span class="material-symbols-rounded" style="color:white; font-size:24px;">${icon}</span>
                </div>
                <div style="flex:1; margin-left:12px;">
                    <div style="font-weight:700; color:${THEME.primary};">${label}</div>
                    <div style="font-size:12px; color:${THEME.primary}80;">${subtitle}</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:20px; font-weight:900; color:${color};">${value}</div>
                </div>
            </div>
        `;
    }

    function closeProfileView() {
        const modal = document.getElementById('profileModal');
        if (modal) modal.remove();
        if (profileCountdownInterval) clearInterval(profileCountdownInterval);
    }

    function showEditProfile() {
        const user = getUser();
        const modal = document.createElement('div');
        modal.id = 'editProfileModal';
        modal.style.cssText = `
            position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5);
            display:flex; align-items:center; justify-content:center; z-index:999999;
            backdrop-filter: blur(8px);
        `;
        modal.innerHTML = `
            <div style="background: ${THEME.glassWhite}; backdrop-filter: blur(20px); border:1px solid ${THEME.glassBorder}; border-radius:24px; padding:24px; max-width:360px; width:90%; color: ${THEME.primary};">
                <h3 style="margin:0 0 20px; font-size:20px;">প্রোফাইল সম্পাদনা</h3>
                <div style="margin-bottom:16px;">
                    <label style="display:block; font-size:12px; margin-bottom:6px;">নাম</label>
                    <input id="editNameInput" type="text" value="${user.name}" style="width:100%; padding:14px 16px; border:2px solid ${THEME.glassBorder}; border-radius:12px; font-size:15px; outline:none; background:rgba(255,255,255,0.5); backdrop-filter:blur(5px);" onfocus="this.style.borderColor='${THEME.primary}'" onblur="this.style.borderColor='${THEME.glassBorder}'">
                </div>
                <div style="margin-bottom:20px;">
                    <label style="display:block; font-size:12px; margin-bottom:6px;">ইমেইল (ঐচ্ছিক)</label>
                    <input id="editEmailInput" type="email" value="${user.email || ''}" style="width:100%; padding:14px 16px; border:2px solid ${THEME.glassBorder}; border-radius:12px; font-size:15px; outline:none; background:rgba(255,255,255,0.5); backdrop-filter:blur(5px);">
                </div>
                <div style="display:flex; gap:12px;">
                    <button onclick="document.getElementById('editProfileModal').remove();" style="flex:1; padding:14px; border:2px solid ${THEME.glassBorder}; border-radius:12px; background:transparent; cursor:pointer; font-weight:600; color:${THEME.primary};">বাতিল</button>
                    <button onclick="ProfileService.saveEditProfile()" style="flex:1; padding:14px; border:none; border-radius:12px; background:linear-gradient(135deg, ${THEME.primary}, ${THEME.primaryLight}); color:white; cursor:pointer; font-weight:600;">সেভ</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    }

    function saveEditProfile() {
        const nameInput = document.getElementById('editNameInput');
        const emailInput = document.getElementById('editEmailInput');
        if (nameInput && nameInput.value.trim()) {
            updateProfile({
                name: nameInput.value.trim(),
                email: emailInput ? emailInput.value.trim() : ''
            });
            document.getElementById('editProfileModal')?.remove();
            closeProfileView();
            showProfileView();
            showToast('প্রোফাইল আপডেট হয়েছে', 'success');
        }
    }

    function syncSidebarUser() {
        const user = getUser();
        const sbName = document.getElementById('sbUserName');
        const heroName = document.getElementById('heroUserName');
        if (sbName) sbName.textContent = user.name || 'Guest';
        if (heroName) heroName.textContent = user.name || 'Guest';
    }

    function saveManualJamatTimes() {
        const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        const times = {};
        prayers.forEach(p => {
            const val = document.getElementById(`jamat-${p}`)?.value;
            if (val) times[p] = val;
        });
        saveCustomJamatTimes(times);
        showToast('জামাতের সময় আপডেট হয়েছে', 'success');

        // Trigger UI update if PrayerTimeModule exists
        if (window.PrayerTimeModule && isCustomJamatEnabled()) {
            PrayerTimeModule.updateUI();
        }
    }

    function handleLoginClick() {
        googleLogin().catch(e => console.error(e));
    }

    function openQuranTracker() {
        closeProfileView();

        // If we're already on quran.html and IslamicModule exists, show it directly.
        if (window.location.pathname.includes('quran.html') && typeof IslamicModule !== 'undefined' && IslamicModule.Quran && IslamicModule.Quran.showKhatamView) {
            IslamicModule.Quran.showKhatamView();
        } else {
            // Otherwise, we are likely on islamic.html, we must redirect to quran.html
            window.location.href = 'quran.html?open=khatam';
        }
    }

    function openSalatTracker() {
        closeProfileView();
        if (typeof SalahTrackerService !== 'undefined' && SalahTrackerService.showView) {
            SalahTrackerService.showView();
        } else {
            window.location.href = 'islamic.html?open=salah';
        }
    }

    // ---------- Initialize ----------
    function init() {
        syncSidebarUser();

        // Wait for Firebase to be ready if needed
        const trySetObserver = () => {
            const auth = getAuth();
            if (auth) {
                auth.onAuthStateChanged(async (firebaseUser) => {
                    const localUser = getUser();
                    if (firebaseUser && !localUser.isLoggedIn) {
                        const profile = {
                            uid: firebaseUser.uid,
                            name: firebaseUser.displayName || 'Islamic User',
                            email: firebaseUser.email,
                            photo: firebaseUser.photoURL,
                            isLoggedIn: true,
                            loginMethod: 'google',
                            createdAt: localUser.createdAt || Date.now(),
                            lastLogin: Date.now()
                        };
                        saveUser(profile);
                        syncSidebarUser();
                        if (window.SyncService) SyncService.syncAll();
                    } else if (!firebaseUser && localUser.isLoggedIn) {
                        saveUser(getDefaultUser());
                        syncSidebarUser();
                    }
                });
            } else {
                // If firebase not ready yet, retry in 500ms
                setTimeout(trySetObserver, 500);
            }
        };
        trySetObserver();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        getUser,
        saveUser,
        isLoggedIn: () => getUser().isLoggedIn,
        googleLogin,
        handleLoginClick,
        logout,
        updateProfile,
        getStats,
        updateStats,
        trackQuranReading,
        trackHadithRead,
        trackQuestionAsked,
        showToast,
        showProfileView,
        closeProfileView,
        showEditProfile,
        saveEditProfile,
        syncSidebarUser,
        isAppLockEnabled,
        toggleAppLock,
        getCustomJamatTimes,
        saveCustomJamatTimes,
        isCustomJamatEnabled,
        setCustomJamatEnabled,
        saveManualJamatTimes,
        openQuranTracker,
        openSalatTracker,
        init,
        THEME
    };
})();
