const NotificationService = (() => {
    const STORAGE_KEY = 'islamic_notifications';
    const PRAYER_NOTIF_KEY = 'prayer_notif_enabled';
    const DAILY_NOTIF_KEY = 'daily_notif_enabled';

    const NATIVE_PRAYER_IDS = [5101, 5102, 5103, 5104, 5105];
    const NATIVE_DAILY_ID = 5201;

    function isNative() {
        try {
            return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
        } catch (e) {
            return false;
        }
    }

    async function _ensureNativePerm() {
        try {
            const { LocalNotifications } = await import('@capacitor/local-notifications');
            const perm = await LocalNotifications.checkPermissions();
            if (perm && perm.display === 'granted') return true;
            const req = await LocalNotifications.requestPermissions();
            return !!(req && req.display === 'granted');
        } catch (e) {
            return false;
        }
    }

    function requestPermission() {
        if (typeof PermissionService !== 'undefined' && PermissionService.requestNotificationPermission) {
            return PermissionService.requestNotificationPermission().then(ok => ok ? 'granted' : 'denied');
        }

        if (!('Notification' in window)) {
            return Promise.resolve('unsupported');
        }

        if (Notification.permission === 'granted') {
            return Promise.resolve('granted');
        }

        if (Notification.permission !== 'denied') {
            return Notification.requestPermission();
        }

        return Promise.resolve('denied');
    }

    async function showNotification(title, body, icon = '📖') {
        if (isNative()) {
            const ok = await _ensureNativePerm();
            if (!ok) return;
            try {
                const { LocalNotifications } = await import('@capacitor/local-notifications');
                await LocalNotifications.schedule({
                    notifications: [{
                        id: Math.floor(Date.now() % 2147483647),
                        title,
                        body,
                        schedule: { at: new Date(Date.now() + 500) },
                        extra: { source: 'islamic-hub' }
                    }]
                });
                return;
            } catch (e) {
            }
        }

        const permission = await requestPermission();
        if (permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: icon,
                badge: '📖',
                tag: 'islamic-hub',
                requireInteraction: false
            });
        }
    }

    function enablePrayerNotifications() {
        localStorage.setItem(PRAYER_NOTIF_KEY, 'true');
        schedulePrayerNotifications();
    }

    function disablePrayerNotifications() {
        localStorage.setItem(PRAYER_NOTIF_KEY, 'false');
        cancelAllNativeSchedules();
    }

    function isPrayerNotifEnabled() {
        return localStorage.getItem(PRAYER_NOTIF_KEY) === 'true';
    }

    function enableDailyNotification() {
        localStorage.setItem(DAILY_NOTIF_KEY, 'true');
        scheduleDailyNotification();
    }

    function disableDailyNotification() {
        localStorage.setItem(DAILY_NOTIF_KEY, 'false');
        cancelAllNativeSchedules();
    }

    function isDailyNotifEnabled() {
        return localStorage.getItem(DAILY_NOTIF_KEY) === 'true';
    }

    function schedulePrayerNotifications() {
        if (!isPrayerNotifEnabled()) return;

        let prayerData = {
            Fajr: '05:00',
            Dhuhr: '12:30',
            Asr: '15:45',
            Maghrib: '18:15',
            Isha: '19:45'
        };

        if (typeof PrayerTimeModule !== 'undefined') {
            const times = PrayerTimeModule.getTimes();
            if (times) {
                // Check for custom override
                if (window.ProfileService && ProfileService.isCustomJamatEnabled()) {
                    const custom = ProfileService.getCustomJamatTimes();
                    prayerData = { ...times, ...custom };
                } else {
                    prayerData = times;
                }
            }
        }

        const prayers = [
            { id: NATIVE_PRAYER_IDS[0], name: 'ফজর', time: prayerData.Fajr },
            { id: NATIVE_PRAYER_IDS[1], name: 'যোহর', time: prayerData.Dhuhr },
            { id: NATIVE_PRAYER_IDS[2], name: 'আসর', time: prayerData.Asr },
            { id: NATIVE_PRAYER_IDS[3], name: 'মাগরিব', time: prayerData.Maghrib },
            { id: NATIVE_PRAYER_IDS[4], name: 'এশা', time: prayerData.Isha }
        ];

        if (isNative()) {
            (async () => {
                const ok = await _ensureNativePerm();
                if (!ok) return;
                try {
                    const { LocalNotifications } = await import('@capacitor/local-notifications');
                    const now = new Date();
                    const notifications = [];
                    prayers.forEach(p => {
                        const [hours, minutes] = p.time.split(':');
                        const at = new Date();
                        at.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                        if (at <= now) at.setDate(at.getDate() + 1);
                        notifications.push({
                            id: p.id,
                            title: `সময় হয়েছে ${p.name} নামাজের`,
                            body: 'মহান আল্লাহর উদ্দেশ্যে নামাজ আদায় করুন',
                            schedule: { at, repeats: true },
                            extra: { type: 'prayer', prayer: p.name, time: p.time }
                        });
                    });
                    await LocalNotifications.schedule({ notifications });
                } catch (e) {
                }
            })();
            return;
        }

        prayers.forEach(prayer => {
            const now = new Date();
            const [hours, minutes] = prayer.time.split(':');
            const prayerTime = new Date();
            prayerTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            if (prayerTime > now) {
                const delay = prayerTime - now;
                setTimeout(() => {
                    showNotification(
                        `সময় হয়েছে ${prayer.name} নামাজের`,
                        'মহান আল্লাহর উদ্দেশ্যে নামাজ আদায় করুন',
                        '🕌'
                    );
                }, delay);
            }
        });
    }

    function scheduleDailyNotification() {
        if (!isDailyNotifEnabled()) return;

        if (isNative()) {
            (async () => {
                const ok = await _ensureNativePerm();
                if (!ok) return;
                try {
                    const { LocalNotifications } = await import('@capacitor/local-notifications');
                    const at = new Date();
                    at.setHours(6, 0, 0, 0);
                    if (at <= new Date()) at.setDate(at.getDate() + 1);
                    await LocalNotifications.schedule({
                        notifications: [{
                            id: NATIVE_DAILY_ID,
                            title: 'দৈনিক দোয়া',
                            body: 'আজকের দোয়া/অনুপ্রেরণা দেখুন',
                            schedule: { at, repeats: true },
                            extra: { type: 'daily' }
                        }]
                    });
                } catch (e) {
                }
            })();
            return;
        }

        const now = new Date();
        const notifTime = new Date();
        notifTime.setHours(6, 0, 0, 0);

        if (notifTime <= now) {
            notifTime.setDate(notifTime.getDate() + 1);
        }

        const delay = notifTime - now;
        setTimeout(() => {
            showDailyContent();
            scheduleDailyNotification();
        }, delay);
    }

    function showDailyContent() {
        const contents = [
            { title: 'সকালের দোয়া', content: 'আল্লাহুম্মা ইন্নি আসআলুকা হুব্বা ওয়া হুব্বা মান ইউহিব্বুনি ওয়া আমলান মা ইউকার্রিবুনি ইলাইক।', meaning: 'হে আল্লাহ! আমি তোমার কাছে ভালোবাসা এবং এমন ব্যক্তির ভালোবাসা চাই যে আমাকে ভালোবাসে এবং এমন আমল চাই যা আমাকে তোমার কাছে নিয়ে যায়।' },
            { title: 'রাতের দোয়া', content: 'বিসমিল্লাহি তাওালা রাহাতু ওয়া নাউমাতু ফি মাইদানিশ শারীফ।', meaning: 'বিসমিল্লাহ দিয়ে শুরু করে ঘুমাতে যাই।' },
            { title: 'কুরআন তেলাওয়াত', content: 'আল্লাহ তাআলা বলেন: যে ব্যক্তি রাতের বেলা কুরআন তেলাওয়াত করে, তার গুনাহ মাফ করে দেওয়া হয়।', ref: 'সহিহ বুখারী' },
            { title: 'জিকির', content: 'সুবহানাল্লাহ, আলহামদুলিল্লাহ, আল্লাহু আকবার - প্রতিদিন ১০০ বার করে বলুন।' },
            { title: 'দোয়া কবুল', content: 'রাসূলুল্লাহ (সা.) বলেছেন: ফজরের নামাজের পর থেকে সূর্য উঠা পর্যন্ত দোয়া কবুল হয়।' }
        ];

        const randomContent = contents[Math.floor(Math.random() * contents.length)];

        showNotification(
            randomContent.title,
            randomContent.content.substring(0, 50) + '...',
            '📖'
        );
    }

    function showSettings() {
        const existingModal = document.getElementById('notifSettingsModal');
        if (existingModal) {
            existingModal.style.display = 'flex';
            return;
        }

        const prayerEnabled = isPrayerNotifEnabled();
        const dailyEnabled = isDailyNotifEnabled();

        const modal = document.createElement('div');
        modal.id = 'notifSettingsModal';
        modal.style.cssText = `
            position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:99999;
            display:flex;align-items:center;justify-content:center;padding:20px;
            font-family:'Noto Sans Bengali',sans-serif;
        `;

        modal.innerHTML = `
            <div style="background:var(--bg-surface);border-radius:20px;padding:24px;max-width:400px;width:100%;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                    <h2 style="margin:0;color:var(--text-primary);font-size:20px;">
                        <span class="material-symbols-rounded" style="vertical-align:middle;margin-right:8px;">notifications</span>
                        নোটিফিকেশন
                    </h2>
                    <button onclick="NotificationService.closeSettings()" style="background:none;border:none;font-size:24px;cursor:var(--text-secondary);">✕</button>
                </div>
                
                <div style="background:var(--bg-main);border-radius:12px;padding:16px;margin-bottom:12px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <div style="font-weight:700;color:var(--text-primary);">নামাজের সময় স্মারক</div>
                            <div style="font-size:12px;color:var(--text-secondary);">প্রতিটি নামাজের সময় নোটিফিকেশন</div>
                        </div>
                        <label style="position:relative;width:50px;height:28px;">
                            <input type="checkbox" id="prayerNotifToggle" style="opacity:0;width:0;height:0;" 
                                ${prayerEnabled ? 'checked' : ''} onchange="NotificationService.togglePrayerNotif()">
                            <span style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background:${prayerEnabled ? '#10b981' : '#ccc'};border-radius:28px;transition:0.3s;">
                                <span style="position:absolute;width:22px;height:22px;background:white;border-radius:50%;top:3px;left:${prayerEnabled ? '25px' : '3px'};transition:0.3s;"></span>
                            </span>
                        </label>
                    </div>
                </div>
                
                <div style="background:var(--bg-main);border-radius:12px;padding:16px;margin-bottom:16px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <div style="font-weight:700;color:var(--text-primary);">দৈনিক দোয়া</div>
                            <div style="font-size:12px;color:var(--text-secondary);">প্রতিদিন সকালে দৈনিক দোয়া</div>
                        </div>
                        <label style="position:relative;width:50px;height:28px;">
                            <input type="checkbox" id="dailyNotifToggle" style="opacity:0;width:0;height:0;" 
                                ${dailyEnabled ? 'checked' : ''} onchange="NotificationService.toggleDailyNotif()">
                            <span style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background:${dailyEnabled ? '#10b981' : '#ccc'};border-radius:28px;transition:0.3s;">
                                <span style="position:absolute;width:22px;height:22px;background:white;border-radius:50%;top:3px;left:${dailyEnabled ? '25px' : '3px'};transition:0.3s;"></span>
                            </span>
                        </label>
                    </div>
                </div>
                
                <button onclick="NotificationService.testNotification()" style="width:100%;padding:14px;background:var(--accent-primary);color:white;border:none;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;">
                    <span class="material-symbols-rounded" style="vertical-align:middle;margin-right:6px;">send</span>
                    টেস্ট নোটিফিকেশন পাঠান
                </button>
            </div>
        `;

        document.body.appendChild(modal);

        if (prayerEnabled) schedulePrayerNotifications();
        if (dailyEnabled) scheduleDailyNotification();
    }

    function togglePrayerNotif() {
        const enabled = document.getElementById('prayerNotifToggle').checked;
        if (enabled) {
            enablePrayerNotifications();
        } else {
            disablePrayerNotifications();
        }
        const slider = document.querySelector('#prayerNotifToggle + span');
        const knob = slider.querySelector('span');
        slider.style.background = enabled ? '#10b981' : '#ccc';
        knob.style.left = enabled ? '25px' : '3px';
    }

    function toggleDailyNotif() {
        const enabled = document.getElementById('dailyNotifToggle').checked;
        if (enabled) {
            enableDailyNotification();
        } else {
            disableDailyNotification();
        }
        const slider = document.querySelector('#dailyNotifToggle + span');
        const knob = slider.querySelector('span');
        slider.style.background = enabled ? '#10b981' : '#ccc';
        knob.style.left = enabled ? '25px' : '3px';
    }

    function testNotification() {
        showNotification(
            'ইসলামিক জ্ঞান Hub',
            'নোটিফিকেশন সফলভাবে কাজ করছে! 🎉',
            '📖'
        );
    }

    function closeSettings() {
        const modal = document.getElementById('notifSettingsModal');
        if (modal) modal.style.display = 'none';
    }

    async function cancelAllNativeSchedules() {
        if (!isNative()) return;
        try {
            const { LocalNotifications } = await import('@capacitor/local-notifications');
            const notifications = [...NATIVE_PRAYER_IDS, NATIVE_DAILY_ID].map(id => ({ id }));
            await LocalNotifications.cancel({ notifications });
        } catch (e) {
        }
    }

    return {
        requestPermission,
        showNotification,
        enablePrayerNotifications,
        disablePrayerNotifications,
        isPrayerNotifEnabled,
        enableDailyNotification,
        disableDailyNotification,
        isDailyNotifEnabled,
        showSettings,
        togglePrayerNotif,
        toggleDailyNotif,
        testNotification,
        closeSettings,
        schedulePrayerNotifications,
        scheduleDailyNotification,
        cancelAllNativeSchedules
    };
})();
