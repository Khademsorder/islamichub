/**
 * prayer-times.js
 * Handles fetching, caching, and displaying daily prayer times based on user's Geolocation.
 * Provides logic for Qibla Compass orientation using device sensors.
 */

const PrayerTimeModule = (function () {
    const CACHE_KEY = "islamic_prayer_times";

    const fallbackTimes = {
        Fajr: "05:00", Sunrise: "06:20", Dhuhr: "12:15",
        Asr: "16:30", Maghrib: "18:05", Isha: "19:30"
    };

    const getCachedTimes = () => {
        try {
            const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
            const today = new Date().toDateString();
            if (cached && cached.date === today) {
                return cached.timings;
            }
        } catch (e) { }
        return null;
    };

    const saveCachedTimes = (timings) => {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            date: new Date().toDateString(),
            timings: timings
        }));
    };

    const getNextPrayerInfo = () => {
        const timings = getCachedTimes() || fallbackTimes;
        let displayTimings = { ...timings };

        if (window.ProfileService && ProfileService.isCustomJamatEnabled()) {
            const custom = ProfileService.getCustomJamatTimes();
            // Normalize: force TitleCase (Fajr, Dhuhr, etc.) for all custom keys
            Object.keys(custom).forEach(k => {
                const normalized = k.charAt(0).toUpperCase() + k.slice(1).toLowerCase();
                if (custom[k] && custom[k].includes(':')) {
                    displayTimings[normalized] = custom[k];
                }
            });
        }

        const pTimes = [
            { id: 'fajr', key: 'Fajr', time: parseMins(displayTimings.Fajr) },
            { id: 'sunrise', key: 'Sunrise', time: parseMins(displayTimings.Sunrise) },
            { id: 'dhuhr', key: 'Dhuhr', time: parseMins(displayTimings.Dhuhr) },
            { id: 'asr', key: 'Asr', time: parseMins(displayTimings.Asr) },
            { id: 'maghrib', key: 'Maghrib', time: parseMins(displayTimings.Maghrib) },
            { id: 'isha', key: 'Isha', time: parseMins(displayTimings.Isha) }
        ];

        const now = new Date();
        const currentMins = now.getHours() * 60 + now.getMinutes();
        const currentSecs = now.getSeconds();

        let nextPrayer = pTimes[0];
        let isTomorrow = false;

        for (let i = pTimes.length - 1; i >= 0; i--) {
            if (currentMins >= pTimes[i].time) {
                nextPrayer = pTimes[i + 1] || pTimes[0];
                if (i === pTimes.length - 1) isTomorrow = true;
                break;
            }
        }

        let nextTimeMins = nextPrayer.time;
        if (isTomorrow || (currentMins >= nextTimeMins && nextPrayer.id === 'fajr')) {
            nextTimeMins += 24 * 60;
        }

        let diffSecs = (nextTimeMins * 60) - (currentMins * 60 + currentSecs);

        return {
            id: nextPrayer.id,
            name: getBanglaName(nextPrayer.id),
            time: displayTimings[nextPrayer.key],
            remainingSecs: Math.max(0, diffSecs)
        };
    };

    const updateUI = (timings) => {
        let displayTimings = timings || getCachedTimes() || fallbackTimes;

        // Custom Jamat Override
        if (window.ProfileService && ProfileService.isCustomJamatEnabled()) {
            const custom = ProfileService.getCustomJamatTimes();
            // Merge custom times into calculated ones (ensure key matching)
            const normalizedCustom = {};
            Object.keys(custom).forEach(k => {
                const normalized = k.charAt(0).toUpperCase() + k.slice(1).toLowerCase();
                if (custom[k] && custom[k].includes(':')) {
                    normalizedCustom[normalized] = custom[k];
                }
            });
            displayTimings = { ...displayTimings, ...normalizedCustom };
            document.body.classList.add('custom-jamat-active');

            // Update Home Screen UI
            const toggleDot = document.getElementById('jamatToggleDot');
            const toggleLabel = document.getElementById('jamatModeLabel');
            if (toggleDot) toggleDot.style.background = '#10b981';
            if (toggleLabel) toggleLabel.textContent = 'CUSTOM';

            const divSelect = document.getElementById('userDivisionSelect');
            if (divSelect) divSelect.value = 'custom';

            const container = document.getElementById('districtUpazilaContainer');
            if (container) container.style.display = 'none';
        } else {
            document.body.classList.remove('custom-jamat-active');
        }

        // Update Location Status Text
        const statusSpan = document.getElementById('locationText');
        if (statusSpan) {
            if (window.ProfileService && ProfileService.isCustomJamatEnabled()) {
                statusSpan.innerText = 'মোড: কাস্টম জামাত সময়';
            } else {
                const cached = getCachedTimes();
                if (cached && cached.locationTitle) {
                    statusSpan.innerText = `লোকেশন: ${cached.locationTitle}`;
                }
            }
        }

        // Re-schedule notifications to sync with current mode
        if (window.NotificationService && NotificationService.schedulePrayerNotifications) {
            NotificationService.schedulePrayerNotifications();
        }

        ['fajrTime', 'sunriseTime', 'dhuhrTime', 'asrTime', 'maghribTime', 'ishaTime'].forEach(id => {
            const el = document.getElementById(id);
            if (el && displayTimings) {
                const key = id.replace('Time', '');
                const timeKey = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
                if (displayTimings[timeKey]) {
                    el.innerText = convertToBanglaNumbers(format12Hour(displayTimings[timeKey]));
                }
            }
        });

        // Determine current/next prayer
        highlightCurrentPrayer(displayTimings);
    };

    const format12Hour = (time24) => {
        if (!time24 || typeof time24 !== 'string' || !time24.includes(':')) return "--:--";
        const [h, m] = time24.split(':');
        let hours = parseInt(h);
        if (isNaN(hours)) return "--:--";
        const suffix = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${m.padStart(2, '0')} ${suffix}`;
    };

    const convertToBanglaNumbers = (str) => {
        const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        return str.replace(/\d/g, d => bengaliDigits[d]);
    };

    let countdownInterval = null;

    const highlightCurrentPrayer = (timings) => {
        if (!timings) return;

        if (countdownInterval) clearInterval(countdownInterval);

        const pTimes = [
            { id: 'fajr', time: parseMins(timings.Fajr) },
            { id: 'sunrise', time: parseMins(timings.Sunrise) },
            { id: 'dhuhr', time: parseMins(timings.Dhuhr) },
            { id: 'asr', time: parseMins(timings.Asr) },
            { id: 'maghrib', time: parseMins(timings.Maghrib) },
            { id: 'isha', time: parseMins(timings.Isha) }
        ];

        const updateCountdown = () => {
            const now = new Date();
            const currentMins = now.getHours() * 60 + now.getMinutes();
            const currentSecs = now.getSeconds();

            // Reset highlights
            document.querySelectorAll('.prayer-card').forEach(el => el.classList.remove('active-prayer'));

            let nextPrayer = pTimes[0];
            let currentPrayer = null;

            for (let i = pTimes.length - 1; i >= 0; i--) {
                if (currentMins >= pTimes[i].time) {
                    currentPrayer = pTimes[i];
                    nextPrayer = pTimes[i + 1] || pTimes[0];
                    break;
                }
            }

            if (currentPrayer && document.getElementById(`card-${currentPrayer.id}`)) {
                document.getElementById(`card-${currentPrayer.id}`).classList.add('active-prayer');

                // Dynamic header color sync with current prayer
                if (typeof Logic !== 'undefined' && Logic.syncHeaderTheme && Logic.currentView === 'home') {
                    Logic.syncHeaderTheme('home'); // Logic.syncHeaderTheme will determine color based on current hour/prayer
                }
            }

            const nextStrEl = document.getElementById('nextPrayerStr');
            const countdownEl = document.getElementById('countdownTimer');
            const ringEl = document.getElementById('prayerProgressRing');

            if (nextStrEl && countdownEl && ringEl && nextPrayer) {
                let nextStrTime = convertToBanglaNumbers(format12Hour(timings[nextPrayer.id.charAt(0).toUpperCase() + nextPrayer.id.slice(1)]));
                let nameStr = getBanglaName(nextPrayer.id);
                nextStrEl.innerHTML = `${nameStr} <span style="font-size:12px; font-weight:600; opacity:0.8;">(${nextStrTime})</span>`;

                // Calculate Diff
                let nextTimeMins = nextPrayer.time;
                let isTomorrow = false;
                if (currentMins >= nextTimeMins) {
                    nextTimeMins += 24 * 60; // Next day
                    isTomorrow = true;
                }

                let diffMins = nextTimeMins - currentMins - 1;
                let diffSecs = 59 - currentSecs;

                let h = Math.floor(diffMins / 60);
                let m = diffMins % 60;
                let s = diffSecs;

                let hStr = h.toString().padStart(2, '0');
                let mStr = m.toString().padStart(2, '0');
                let sStr = s.toString().padStart(2, '0');

                countdownEl.innerText = convertToBanglaNumbers(`- ${hStr}:${mStr}:${sStr}`);

                // Calculate Progress
                let prevPrayer = currentPrayer || pTimes[pTimes.length - 1];
                let prevTimeMins = prevPrayer.time;
                if (isTomorrow && nextPrayer.id === 'fajr' && currentMins < prevTimeMins) {
                    prevTimeMins -= 24 * 60; // Handle midnight crossover properly
                }
                if (isTomorrow && currentPrayer && currentPrayer.id === 'isha') {
                    // prevTimeMins is fine
                }

                let totalDuration = nextTimeMins - prevTimeMins;
                let passedDuration = (currentMins - prevTimeMins) + (currentSecs / 60);

                // fallback safeguard
                if (totalDuration <= 0) totalDuration = 1;
                let progressPercent = passedDuration / totalDuration;
                if (progressPercent < 0) progressPercent = 0;
                if (progressPercent > 1) progressPercent = 1;

                const circumference = 144.5; // 2 * pi * 23
                const offset = circumference - (progressPercent * circumference);
                ringEl.style.strokeDashoffset = offset;
            }
        };

        updateCountdown();
        countdownInterval = setInterval(updateCountdown, 1000);
    };

    const parseMins = (time24) => {
        if (!time24 || typeof time24 !== 'string' || !time24.includes(':')) return 0;
        const [h, m] = time24.split(':');
        return (parseInt(h) || 0) * 60 + (parseInt(m) || 0);
    };

    const getBanglaName = (id) => {
        const names = { fajr: "ফজর", sunrise: "সূর্যোদয়", dhuhr: "যোহর", asr: "আসর", maghrib: "মাগরিব", isha: "এশা" };
        return names[id] || id;
    };

    const updateLocationHeader = (locationName) => {
        const locText = document.getElementById('locHeaderText');
        if (locText && locationName) {
            // Priority cleaning for header display
            let cleanName = locationName;
            if (cleanName.includes(' > ')) {
                const parts = cleanName.split(' > ');
                cleanName = parts[parts.length - 1]; // Just use Upazila/District name
            }
            locText.textContent = cleanName;

            // Sync with global storage for quran.html
            localStorage.setItem('userGeoDistrict', cleanName);
        }
    };

    const fetchTimes = async (params, title = null) => {
        try {
            const statusSpan = document.getElementById('locationText');
            const locationTitle = title || params.city || localStorage.getItem('userGeoDistrict') || 'আপনার লোকেশন';

            if (statusSpan) statusSpan.innerText = locationTitle ? `লোকেশন: ${locationTitle}` : 'আপনার বর্তমান লোকেশন অনুযায়ী';

            // Update header with real location
            updateLocationHeader(locationTitle);

            let url;
            if (params.lat && params.lng) {
                url = `https://api.aladhan.com/v1/timings?latitude=${params.lat}&longitude=${params.lng}&method=1`;
            } else if (params.city) {
                url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(params.city)}&country=Bangladesh&method=1`;
            }

            const res = await fetch(url);
            const data = await res.json();
            if (data && data.code === 200) {
                saveCachedTimes(data.data.timings);
                updateUI(data.data.timings);
                if (data.data.meta && data.data.meta.latitude) {
                    QiblaModule.setBaseLocation(data.data.meta.latitude, data.data.meta.longitude);
                }
            }
        } catch (e) {
            console.error("Failed to fetch prayer times:", e);
            if (!getCachedTimes()) {
                updateUI(fallbackTimes);
            }
        }
    };

    const requestLocationAndFetch = () => {
        const cached = getCachedTimes();
        if (cached) updateUI(cached);

        const saved = JSON.parse(localStorage.getItem('namazLocationPref')) || { type: 'auto' };

        // Populate UI from saved preference
        const divSelect = document.getElementById('userDivisionSelect');
        const container = document.getElementById('districtUpazilaContainer');

        if (!divSelect) return;

        if (saved.type === 'manual') {
            divSelect.value = saved.division;
            container.style.display = 'flex';
            populateDistricts(saved.division, saved.district);
            populateUpazilas(saved.division, saved.district, saved.upazila);
            fetchTimes({ city: saved.upazila }, `${saved.division} > ${saved.district} > ${saved.upazila}`);
        } else if (saved.type === 'custom' || (window.ProfileService && ProfileService.isCustomJamatEnabled())) {
            divSelect.value = 'custom';
            container.style.display = 'none';
            // Ensure flag is set correctly
            if (window.ProfileService && !ProfileService.isCustomJamatEnabled()) {
                ProfileService.setCustomJamatEnabled(true);
            }
            updateUI();
        } else {
            divSelect.value = 'auto';
            container.style.display = 'none';
            autoLocationFetch();
        }
    };

    const autoLocationFetch = () => {
        const fallbackToIP = async () => {
            try {
                const statusEl = document.getElementById('locationStatus');
                if (statusEl) statusEl.innerText = 'লোকেশন খোঁজা হচ্ছে (IP)...';
                const res = await fetch('https://ipapi.co/json/');
                const data = await res.json();
                if (data && data.latitude && data.longitude) {
                    fetchTimes({ lat: data.latitude, lng: data.longitude }, data.city || 'অটো (IP)');
                } else throw new Error("Invalid IP");
            } catch (e) {
                fetchTimes({ lat: 23.8103, lng: 90.4125 }, 'ঢাকা (ডিফল্ট)');
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => fetchTimes({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => fallbackToIP()
            );
        } else fallbackToIP();
    };

    const populateDistricts = (division, selectedDistrict = "") => {
        const distSelect = document.getElementById('userDistrictSelect');
        distSelect.innerHTML = '<option value="">জেলা সিলেক্ট করুন</option>';
        if (!division || division === 'auto' || !BANGLADESH_LOCATIONS[division]) return;

        Object.keys(BANGLADESH_LOCATIONS[division]).sort().forEach(dist => {
            const opt = document.createElement('option');
            opt.value = dist;
            opt.innerText = dist;
            opt.style.background = '#064e3b';
            opt.style.color = 'white';
            if (dist === selectedDistrict) opt.selected = true;
            distSelect.appendChild(opt);
        });
    };

    const populateUpazilas = (division, district, selectedUpazila = "") => {
        const upzSelect = document.getElementById('userUpazilaSelect');
        upzSelect.innerHTML = '<option value="">উপজেলা সিলেক্ট করুন</option>';
        if (!district || !BANGLADESH_LOCATIONS[division] || !BANGLADESH_LOCATIONS[division][district]) return;

        BANGLADESH_LOCATIONS[division][district].sort().forEach(upz => {
            const opt = document.createElement('option');
            opt.value = upz;
            opt.innerText = upz;
            opt.style.background = '#064e3b';
            opt.style.color = 'white';
            if (upz === selectedUpazila) opt.selected = true;
            upzSelect.appendChild(opt);
        });
    };

    const handleDivisionChange = (val) => {
        const container = document.getElementById('districtUpazilaContainer');
        if (val === 'custom') {
            if (container) container.style.display = 'none';
            if (window.ProfileService) {
                ProfileService.setCustomJamatEnabled(true);
            }
            localStorage.setItem('namazLocationPref', JSON.stringify({ type: 'custom' }));
            updateUI(); // immediately refresh prayer cards with custom times
            return;
        }

        // Disable custom if any other option is selected
        if (window.ProfileService && ProfileService.isCustomJamatEnabled()) {
            ProfileService.setCustomJamatEnabled(false);
        }

        if (val === 'auto') {
            localStorage.setItem('namazLocationPref', JSON.stringify({ type: 'auto' }));
            if (container) container.style.display = 'none';
            autoLocationFetch();
        } else {
            localStorage.setItem('namazLocationPref', JSON.stringify({ type: 'manual', division: val }));
            if (container) container.style.display = 'flex';
            populateDistricts(val);
            const upzSelect = document.getElementById('userUpazilaSelect');
            if (upzSelect) upzSelect.innerHTML = '<option value="">উপজেলা সিলেক্ট করুন</option>';
        }
    };

    const handleDistrictChange = (val) => {
        const division = document.getElementById('userDivisionSelect').value;
        populateDistricts(division, val); // Refresh with selected district
        populateUpazilas(division, val);
    };

    const handleUpazilaChange = (val) => {
        if (!val) return;
        const division = document.getElementById('userDivisionSelect').value;
        const district = document.getElementById('userDistrictSelect').value;
        const pref = { type: 'manual', division, district, upazila: val };
        localStorage.setItem('namazLocationPref', JSON.stringify(pref));
        fetchTimes({ city: val }, `${division} > ${district} > ${val}`);
    };

    const requestGPSLocation = async () => {
        const statusEl = document.getElementById('locationStatus');

        // Try Capacitor Geolocation first (for native Android/iOS)
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Geolocation) {
            try {
                if (statusEl) {
                    const span = statusEl.querySelector('span');
                    if (span) span.innerText = 'GPS লোকেশন নেওয়া হচ্ছে...';
                }

                const position = await window.Capacitor.Plugins.Geolocation.getCurrentPosition({
                    enableHighAccuracy: true,
                    timeout: 10000
                });

                if (position && position.coords) {
                    fetchTimes({ lat: position.coords.latitude, lng: position.coords.longitude }, 'GPS লোকেশন');
                    if (typeof UI !== 'undefined' && UI.showToast) UI.showToast('GPS লোকেশন সেট করা হয়েছে');
                    return;
                }
            } catch (e) {
                console.error('Capacitor Geolocation error:', e);
                // Fall through to web API
            }
        }

        // Fallback to web navigator.geolocation
        if (!navigator.geolocation) {
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast('আপনার ডিভাইসে GPS সাপোর্ট নেই');
            return;
        }

        if (statusEl) {
            const span = statusEl.querySelector('span');
            if (span) span.innerText = 'GPS লোকেশন নেওয়া হচ্ছে...';
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                fetchTimes({ lat: pos.coords.latitude, lng: pos.coords.longitude }, 'GPS লোকেশন');
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast('GPS লোকেশন সেট করা হয়েছে');
            },
            (err) => {
                console.error('GPS Error:', err);
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast('GPS লোকেশন পাওয়া যায়নি। অনুগ্রহ করে ম্যানুয়ালি সিলেক্ট করুন।');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    return {
        init: requestLocationAndFetch,
        updateUI,
        handleDivisionChange,
        handleDistrictChange,
        handleUpazilaChange,
        getTimes: () => getCachedTimes() || fallbackTimes,
        format12Hour,
        convertToBanglaNumbers,
        requestGPSLocation,
        getNextPrayerInfo
    };
})();


/** Qibla Compass Logic */
const QiblaModule = (function () {
    let isRunning = false;
    let qiblaAngle = 0; // The bearing from user to Mecca
    // Mecca coords
    const MECCA_LAT = 21.422487;
    const MECCA_LNG = 39.826206;

    const toRad = (deg) => deg * Math.PI / 180;
    const toDeg = (rad) => rad * 180 / Math.PI;

    const calculateQibla = (lat, lng) => {
        const latK = toRad(MECCA_LAT);
        const lngK = toRad(MECCA_LNG);
        const latU = toRad(lat);
        const lngU = toRad(lng);

        const deltaLng = lngK - lngU;
        const y = Math.sin(deltaLng);
        const x = Math.cos(latU) * Math.tan(latK) - Math.sin(latU) * Math.cos(deltaLng);

        let qibla = toDeg(Math.atan2(y, x));
        return (qibla + 360) % 360;
    };

    const setBaseLocation = (lat, lng) => {
        qiblaAngle = calculateQibla(lat, lng);
    };

    let checkTimeout = null;

    const startCompass = () => {
        if (isRunning) return;

        const handleSuccess = () => {
            window.addEventListener('deviceorientationabsolute', handleOrientation);
            window.addEventListener('deviceorientation', handleOrientation);
            isRunning = true;

            const statusEl = document.getElementById('qiblaStatus');
            if (statusEl) statusEl.innerHTML = '<span class="material-symbols-rounded" style="font-size:18px; vertical-align:middle; margin-right:4px;">info</span> কম্পাসটি সঠিকভাবে কাজ করার জন্য ফোনটিকে সমতল জায়গায় "8" আকৃতিতে কিছুক্ষণ ঘুরিয়ে ক্যালিব্রেট করুন এবং লোকেশন সার্ভিস চালু রাখুন।';

            // Check if orientation events actually yield data
            let hasData = false;
            const tempHandler = (e) => {
                if (e.alpha !== null || e.webkitCompassHeading !== undefined) {
                    hasData = true;
                }
            };
            window.addEventListener('deviceorientation', tempHandler, { once: true });

            checkTimeout = setTimeout(() => {
                if (!hasData) {
                    if (statusEl) statusEl.innerHTML = '<span class="material-symbols-rounded" style="font-size:18px; vertical-align:middle; margin-right:4px; color:#dc2626;">error</span> <b>দুঃখিত!</b> আপনার ডিভাইসে কম্পাস সেন্সর (Magnetometer) সাপোর্ট করে না অথবা পারমিশন নেই।';
                    if (statusEl) statusEl.style.background = '#fef2f2';
                    if (statusEl) statusEl.style.color = '#991b1b';
                    if (statusEl) statusEl.style.borderColor = '#fca5a5';
                }
            }, 2000);
        };

        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(response => {
                    if (response == 'granted') {
                        handleSuccess();
                    } else {
                        const statusEl = document.getElementById('qiblaStatus');
                        if (statusEl) {
                            statusEl.innerHTML = '<span class="material-symbols-rounded" style="font-size:18px; vertical-align:middle; margin-right:4px; color:#dc2626;">error</span> কম্পাস ব্যবহারের জন্য সেন্সর পারমিশন প্রয়োজন।';
                            statusEl.style.background = '#fef2f2';
                            statusEl.style.color = '#991b1b';
                            statusEl.style.borderColor = '#fca5a5';
                        }
                    }
                })
                .catch(console.error);
        } else {
            // Non-iOS 13+ devices
            handleSuccess();
        }
    };

    const stopCompass = () => {
        if (checkTimeout) clearTimeout(checkTimeout);
        window.removeEventListener('deviceorientation', handleOrientation);
        window.removeEventListener('deviceorientationabsolute', handleOrientation);
        isRunning = false;
    };

    const handleOrientation = (event) => {
        let alpha = event.alpha;
        let webkitAlpha = event.webkitCompassHeading;
        let heading = webkitAlpha || (360 - alpha); // Fallback for android

        if (heading == null || isNaN(heading)) return;

        // We want the Mecca needle to point to Qibla relative to the phone's heading
        // Compass dial rotation: 
        const compassDial = document.getElementById('compassDial');
        const meccaNeedle = document.getElementById('meccaNeedle');

        if (compassDial) {
            compassDial.style.transform = `rotate(${-heading}deg)`;
        }

        if (meccaNeedle) {
            // Mecca arrow points exactly to the Qibla Angle, accounting for phone rotation
            meccaNeedle.style.transform = `rotate(${qiblaAngle}deg)`;
        }
    };

    return { startCompass, stopCompass, setBaseLocation };
})();
