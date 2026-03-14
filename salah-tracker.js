const SalahTrackerService = (() => {
    const STORAGE_KEY = 'salah_logs';
    const STREAK_KEY = 'salah_streak';
    const PRAYERS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Witr'];

    const THEME = {
        primary: '#0A5438',
        primaryLight: '#2D6A4F',
        accent: '#40916C',
        gold: '#C49A2B',
        softGreenStart: '#E8F5E9',
        softGreenEnd: '#C8E6C9',
        glassWhite: 'rgba(255, 255, 255, 0.25)',
        glassBorder: 'rgba(255, 255, 255, 0.2)',
        glassShadow: '0 8px 32px rgba(10, 84, 56, 0.1)'
    };

    const glassCardStyle = `
        background: ${THEME.glassWhite};
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid ${THEME.glassBorder};
        border-radius: 20px;
        box-shadow: ${THEME.glassShadow};
    `;

    const PRAYER_INFO = {
        'Fajr': { name: 'ফজর', icon: 'wb_twilight', color: '#f59e0b', time: 'ভোর' },
        'Sunrise': { name: 'ইশরাক', icon: 'wb_sunny', color: '#f97316', time: 'সূর্যোদয়' },
        'Dhuhr': { name: 'যোহর', icon: 'light_mode', color: '#3b82f6', time: 'দুপুর' },
        'Asr': { name: 'আসর', icon: 'wb_sunny', color: '#8b5cf6', time: 'বিকাল' },
        'Maghrib': { name: 'মাগরিব', icon: 'wb_twilight', color: '#ec4899', time: 'সন্ধ্যা' },
        'Isha': { name: 'এশা', icon: 'nightlight', color: '#6366f1', time: 'রাত' },
        'Witr': { name: 'বিতর', icon: 'star', color: '#14b8a6', time: 'রাত' }
    };

    function getTodayDateStr() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function emptyPrayers() {
        const log = {};
        PRAYERS.forEach(p => log[p] = false);
        return log;
    }

    function loadAllLogs() {
        try {
            const logsJson = localStorage.getItem(STORAGE_KEY);
            return logsJson ? JSON.parse(logsJson) : {};
        } catch (e) {
            console.error("Error loading Salah logs:", e);
            return {};
        }
    }

    function saveAllLogs(logs) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
        } catch (e) {
            console.error("Error saving Salah logs:", e);
        }
    }

    function getOrInitLog(dateStr = getTodayDateStr()) {
        const logs = loadAllLogs();
        if (logs[dateStr]) {
            const existingLog = logs[dateStr];
            const finalPrayers = { ...emptyPrayers(), ...existingLog.prayers };
            return { date: dateStr, prayers: finalPrayers };
        }
        return { date: dateStr, prayers: emptyPrayers() };
    }

    function togglePrayer(dateStr, prayer) {
        if (!PRAYERS.includes(prayer)) {
            console.warn(`Invalid prayer: ${prayer}`);
            return getOrInitLog(dateStr);
        }

        const logs = loadAllLogs();
        const currentLog = logs[dateStr] || { date: dateStr, prayers: emptyPrayers() };

        currentLog.prayers = { ...emptyPrayers(), ...currentLog.prayers };
        const currentStatus = currentLog.prayers[prayer] || false;
        currentLog.prayers[prayer] = !currentStatus;

        logs[dateStr] = currentLog;
        saveAllLogs(logs);

        updateStreak();

        return currentLog;
    }

    function updateStreak() {
        const logs = loadAllLogs();
        let streak = 0;
        const today = new Date();

        for (let i = 0; i < 365; i++) {
            const date = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
            const dateStr = date.toISOString().split('T')[0];

            if (logs[dateStr]) {
                const log = logs[dateStr];
                const fardPrayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
                const allCompleted = fardPrayers.every(p => log.prayers[p] === true);

                if (allCompleted) {
                    streak++;
                } else if (i > 0) {
                    break;
                }
            } else if (i > 0) {
                break;
            }
        }

        try {
            localStorage.setItem(STREAK_KEY, JSON.stringify({ current: streak, lastUpdated: Date.now() }));
        } catch (e) { }

        return streak;
    }

    function getStreak() {
        try {
            const streakData = localStorage.getItem(STREAK_KEY);
            return streakData ? JSON.parse(streakData).current || 0 : 0;
        } catch { return 0; }
    }

    function getStats(range = 7) {
        const logs = loadAllLogs();
        let totalPrays = 0;
        let perfectDays = 0;
        const dailyStats = [];
        const today = new Date();
        const fardPrayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

        for (let i = range - 1; i >= 0; i--) {
            const date = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
            const dateStr = date.toISOString().split('T')[0];
            const possiblePrays = 5;
            let dayCount = 0;

            if (logs[dateStr]) {
                const log = logs[dateStr];
                fardPrayers.forEach(p => {
                    if (log.prayers[p] === true) {
                        dayCount++;
                        totalPrays++;
                    }
                });
                if (dayCount >= 5) perfectDays++;
            }

            const dayName = date.toLocaleDateString('bn-BD', { weekday: 'short' });
            dailyStats.push({ day: dayName, count: dayCount, date: dateStr });
        }

        const percentage = (totalPrays / (perfectDays * 5)) * 100;

        return {
            percentage: percentage || 0,
            totalCount: totalPrays,
            daysTracked: perfectDays,
            dailyStats: dailyStats,
            streak: getStreak()
        };
    }

    function showView() {
        const existingModal = document.getElementById('salahTrackerModal');
        if (existingModal) {
            existingModal.style.display = 'flex';
            updateUI();
            return;
        }

        const todayLog = getOrInitLog();
        const stats = getStats(7);

        const modal = document.createElement('div');
        modal.id = 'salahTrackerModal';
        modal.style.cssText = `
            position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999;
            background: url('img/salah-premium-bg.png') center/cover no-repeat;
            display:flex;flex-direction:column;
            font-family:'Noto Sans Bengali',sans-serif;
            overflow: hidden;
        `;

        modal.innerHTML = `
            <!-- Fixed White Premium Shaded Overlay -->
            <div style="position:absolute; inset:0; background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(8px); -webkit-backdrop-filter:blur(8px); z-index: 1;"></div>

            <div style="position:relative; z-index:2; background:rgba(255,255,255,0.4); backdrop-filter:blur(10px); padding:20px 16px; padding-top:max(20px, env(safe-area-inset-top)); border-radius:0 0 30px 30px; border-bottom:1px solid rgba(10,84,56,0.11); box-shadow:0 8px 32px rgba(10,84,56,0.05); flex-shrink: 0;">
                <div style="display:flex;align-items:center;gap:12px;">
                    <button onclick="SalahTrackerService.closeView()" style="background:rgba(10,84,56,0.08); border:1px solid rgba(10,84,56,0.1); width:44px; height:44px; border-radius:14px; cursor:pointer; color:${THEME.primary}; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(5px);">
                        <span class="material-symbols-rounded" style="font-size:26px;">arrow_back</span>
                    </button>
                    <div>
                        <h2 style="margin:0;font-size:22px;color:${THEME.primary};font-weight:800;display:flex;align-items:center;gap:8px;">
                            <span class="material-symbols-rounded" style="font-size:26px;color:${THEME.primary};">mosque</span>
                            সালাত ট্র্যাকার
                        </h2>
                        <p style="margin:4px 0 0;font-size:13px;color:${THEME.primary}aa;font-weight:600;">দৈনিক নামাজ ট্র্যাকিং</p>
                    </div>
                </div>
            </div>
            
            <div style="padding:20px;flex:1;overflow-y:auto;position:relative;z-index:2; padding-bottom: 40px;">
                <!-- Content ... -->
                <!-- Stats Cards -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px;">
                    <div style="${glassCardStyle};padding:20px;text-align:center;">
                        <div style="font-size:12px;color:#666;margin-bottom:4px;">গত ৭ দিন</div>
                        <div style="font-size:38px;font-weight:900;color:${THEME.primary};">${Math.round(stats.percentage)}%</div>
                        <div style="font-size:11px;color:#888;">${stats.totalCount}/35 ওয়াক্ত</div>
                    </div>
                    <div style="${glassCardStyle};padding:20px;text-align:center;">
                        <div style="font-size:12px;color:#666;margin-bottom:4px;">🔥 স্ট্রিক</div>
                        <div style="font-size:38px;font-weight:900;color:${THEME.gold};">${stats.streak}</div>
                        <div style="font-size:11px;color:#888;">দিন ধারাবাহিক</div>
                    </div>
                </div>
                
                <!-- Weekly Progress -->
                <div style="${glassCardStyle};padding:20px;margin-bottom:20px;">
                    <div style="font-size:15px;font-weight:700;margin-bottom:16px;color:${THEME.primary};display:flex;align-items:center;gap:8px;">
                        <span class="material-symbols-rounded" style="font-size:22px;">insights</span>
                        সাপ্তাহিক প্রগতি
                    </div>
                    <div style="display:flex;justify-content:space-between;gap:6px;">
                        ${stats.dailyStats.map(d => `
                            <div style="flex:1;text-align:center;">
                                <div style="width:100%;height:70px;background:rgba(255,255,255,0.5);border-radius:12px;position:relative;overflow:hidden;margin-bottom:6px;backdrop-filter:blur(5px);">
                                    <div style="position:absolute;bottom:0;width:100%;height:${(d.count / 5) * 100}%;background:linear-gradient(180deg,${THEME.primary},${THEME.accent});border-radius:12px;transition:height 0.3s;"></div>
                                </div>
                                <div style="font-size:11px;color:#666;font-weight:600;">${d.day}</div>
                                <div style="font-size:12px;font-weight:700;color:${THEME.primary};">${d.count}/5</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Today's Prayers -->
                <div style="${glassCardStyle};padding:20px;">
                    <div style="font-size:16px;font-weight:700;margin-bottom:18px;color:${THEME.primary};display:flex;align-items:center;gap:8px;">
                        <span class="material-symbols-rounded" style="font-size:24px;">today</span>
                        আজকের নামাজ
                    </div>
                    <div id="salahPrayerList" style="display:flex;flex-direction:column;gap:10px;">
                        ${PRAYERS.map(prayer => {
            const info = PRAYER_INFO[prayer];
            const isDone = todayLog.prayers[prayer];
            return `
                                <div onclick="SalahTrackerService.togglePrayerUI('${prayer}')" 
                                     style="display:flex;align-items:center;justify-content:space-between;padding:16px;border-radius:16px;cursor:pointer;transition:all 0.2s;
                                     background:${isDone ? 'linear-gradient(135deg,' + info.color + '25,' + info.color + '10)' : 'rgba(255,255,255,0.6)'};
                                     border:2px solid ${isDone ? info.color : 'rgba(255,255,255,0.5)'};
                                     box-shadow:${isDone ? '0 4px 15px ' + info.color + '40' : '0 2px 8px rgba(0,0,0,0.05)'};">
                                    <div style="display:flex;align-items:center;gap:14px;">
                                        <div style="width:52px;height:52px;border-radius:16px;background:${isDone ? info.color : 'rgba(255,255,255,0.8)'};display:flex;align-items:center;justify-content:center;transition:all 0.2s;box-shadow:0 2px 8px ${info.color}40;">
                                            <span class="material-symbols-rounded" style="color:${isDone ? 'white' : info.color};font-size:26px;">${isDone ? 'check' : info.icon}</span>
                                        </div>
                                        <div>
                                            <div style="font-weight:700;font-size:16px;color:${THEME.primary};">${info.name}</div>
                                            <div style="font-size:12px;color:#888;">${info.time}</div>
                                        </div>
                                    </div>
                                    <div style="width:32px;height:32px;border-radius:50%;border:3px solid ${isDone ? info.color : '#ddd'};background:${isDone ? info.color : 'transparent'};display:flex;align-items:center;justify-content:center;transition:all 0.2s;">
                                        ${isDone ? '<span style="color:white;font-size:16px;font-weight:900;">✓</span>' : ''}
                                    </div>
                                </div>
                            `;
        }).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    function updateUI() {
        const todayLog = getOrInitLog();
        const stats = getStats(7);

        const listContainer = document.getElementById('salahPrayerList');
        if (listContainer) {
            listContainer.innerHTML = PRAYERS.map(prayer => {
                const info = PRAYER_INFO[prayer];
                const isDone = todayLog.prayers[prayer];
                return `
                    <div onclick="SalahTrackerService.togglePrayerUI('${prayer}')" 
                         style="display:flex;align-items:center;justify-content:space-between;padding:16px;border-radius:16px;cursor:pointer;transition:all 0.2s;
                         background:${isDone ? 'linear-gradient(135deg,' + info.color + '25,' + info.color + '10)' : 'rgba(255,255,255,0.6)'};
                         border:2px solid ${isDone ? info.color : 'rgba(255,255,255,0.5)'};
                         box-shadow:${isDone ? '0 4px 15px ' + info.color + '40' : '0 2px 8px rgba(0,0,0,0.05)'};">
                        <div style="display:flex;align-items:center;gap:14px;">
                            <div style="width:52px;height:52px;border-radius:16px;background:${isDone ? info.color : 'rgba(255,255,255,0.8)'};display:flex;align-items:center;justify-content:center;transition:all 0.2s;box-shadow:0 2px 8px ${info.color}40;">
                                <span class="material-symbols-rounded" style="color:${isDone ? 'white' : info.color};font-size:26px;">${isDone ? 'check' : info.icon}</span>
                            </div>
                            <div>
                                <div style="font-weight:700;font-size:16px;color:${THEME.primary};">${info.name}</div>
                                <div style="font-size:12px;color:#888;">${info.time}</div>
                            </div>
                        </div>
                        <div style="width:32px;height:32px;border-radius:50%;border:3px solid ${isDone ? info.color : '#ddd'};background:${isDone ? info.color : 'transparent'};display:flex;align-items:center;justify-content:center;transition:all 0.2s;">
                            ${isDone ? '<span style="color:white;font-size:16px;font-weight:900;">✓</span>' : ''}
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    function togglePrayerUI(prayer) {
        const todayStr = getTodayDateStr();
        togglePrayer(todayStr, prayer);

        // Update UI
        const listContainer = document.getElementById('salahPrayerList');
        if (listContainer) {
            updateUI();
        }

        // Show toast
        const updatedLog = getOrInitLog(todayStr);
        const info = PRAYER_INFO[prayer];
        const isDone = updatedLog.prayers[prayer];

        const toast = document.createElement('div');
        toast.style.cssText = `
            position:fixed; top:80px; left:50%; transform:translateX(-50%);
            background:${isDone ? '#10b981' : '#ef4444'}; color:white; padding:12px 24px;
            border-radius:30px; z-index:999999; font-size:14px;
            font-weight:600; box-shadow:0 4px 20px rgba(0,0,0,0.2);
        `;
        toast.textContent = `${info.name} ${isDone ? '✓ সম্পন্ন' : 'বাতিল'}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }

    function closeView() {
        const modal = document.getElementById('salahTrackerModal');
        if (modal) modal.remove();
    }

    return {
        showView,
        closeView,
        togglePrayerUI,
        getStats
    };
})();
