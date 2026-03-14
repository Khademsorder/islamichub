const QiblaService = (() => {
    const MECCA_LAT = 21.422487;
    const MECCA_LNG = 39.826206;

    function toRad(deg) {
        return deg * Math.PI / 180;
    }

    function toDeg(rad) {
        return rad * 180 / Math.PI;
    }

    function calculateQiblaDirection(lat, lng) {
        const latK = toRad(MECCA_LAT);
        const lngK = toRad(MECCA_LNG);
        const latU = toRad(lat);
        const lngU = toRad(lng);

        const deltaLng = lngK - lngU;
        const y = Math.sin(deltaLng);
        const x = Math.cos(latU) * Math.tan(latK) - Math.sin(latU) * Math.cos(deltaLng);

        let qibla = toDeg(Math.atan2(y, x));
        return (qibla + 360) % 360;
    }

    function showQiblaView() {
        const existingModal = document.getElementById('qiblaModal');
        if (existingModal) {
            existingModal.style.display = 'flex';
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'qiblaModal';
        modal.style.cssText = `
            position:fixed;top:0;left:0;width:100%;height:100%;background:linear-gradient(135deg,#0a5438,#059669);z-index:99999;
            display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;
            font-family:'Noto Sans Bengali',sans-serif;
        `;

        modal.innerHTML = `
            <div style="position:absolute;top:20px;right:20px;">
                <button onclick="QiblaService.closeQibla()" style="background:rgba(255,255,255,0.2);border:none;width:40px;height:40px;border-radius:50%;font-size:20px;cursor:pointer;color:white;">✕</button>
            </div>
            
            <div style="text-align:center;color:white;margin-bottom:30px;">
                <span class="material-symbols-rounded" style="font-size:48px;">explore</span>
                <h2 style="margin:12px 0 4px;font-size:24px;">কিবলা কম্পাস</h2>
                <p style="opacity:0.8;font-size:14px;">মক্কার দিক নির্ণয়</p>
            </div>
            
            <div style="position:relative;width:280px;height:280px;margin-bottom:30px;">
                <div id="compassRing" style="width:100%;height:100%;border-radius:50%;background:rgba(255,255,255,0.1);border:4px solid rgba(255,255,255,0.3);position:relative;transition:transform 0.5s ease-out;">
                    <div style="position:absolute;top:10px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:12px solid transparent;border-right:12px solid transparent;border-bottom:20px solid #fbbf24;"></div>
                    <div style="position:absolute;bottom:10px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:12px solid transparent;border-right:12px solid transparent;border-top:20px solid rgba(255,255,255,0.6);"></div>
                    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:16px;height:16px;background:white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>
                    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(0deg);width:4px;height:100px;background:linear-gradient(to top,transparent,rgba(255,255,255,0.8));transform-origin:bottom center;"></div>
                </div>
                
                <div style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:#fbbf24;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:700;color:#000;">উত্তর</div>
            </div>
            
            <div id="qiblaInfo" style="background:rgba(255,255,255,0.15);padding:20px 30px;border-radius:16px;text-align:center;backdrop-filter:blur(10px);">
                <div style="font-size:48px;font-weight:700;margin-bottom:8px;" id="qiblaDegree">--°</div>
                <div style="font-size:16px;opacity:0.9;" id="qiblaStatus">লোড হচ্ছে...</div>
            </div>
            
            <div style="margin-top:20px;color:white;font-size:12px;opacity:0.7;text-align:center;">
                <span id="locationStatus">📍 অবস্থান খুঁজছি...</span>
            </div>
            
            <button onclick="QiblaService.requestLocation()" style="margin-top:16px;padding:12px 24px;background:white;color:#0a5438;border:none;border-radius:25px;font-weight:600;cursor:pointer;">
                <span class="material-symbols-rounded" style="vertical-align:middle;margin-right:6px;">my_location</span>
                আবার চেষ্টা করুন
            </button>
        `;

        document.body.appendChild(modal);
        QiblaService.requestLocation();
    }

    function requestLocation() {
        document.getElementById('qiblaStatus').textContent = 'লোড হচ্ছে...';
        document.getElementById('locationStatus').textContent = '📍 অবস্থান খুঁজছি...';

        // Try Capacitor Geolocation first (native app)
        if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
            import('@capacitor/geolocation').then(async ({ Geolocation }) => {
                try {
                    if (typeof PermissionService !== 'undefined') {
                        const ok = await PermissionService.ensureLocationOrExplain();
                        if (!ok) {
                            throw new Error('Permission denied');
                        }
                    }

                    const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: false, timeout: 10000 });
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    document.getElementById('locationStatus').textContent = `📍 ${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
                    calculateAndShow(lat, lng);
                } catch (e) {
                    console.warn('Capacitor Geolocation error:', e);
                    useDefaultLocation();
                }
            }).catch(() => useDefaultLocation());
            return;
        }

        // Fallback to browser geolocation
        if (!navigator.geolocation) {
            document.getElementById('qiblaStatus').textContent = 'জিওলোকেশন সাপোর্ট করে না';
            document.getElementById('locationStatus').textContent = '⚠️ ব্রাউজার সাপোর্ট নেই';
            useDefaultLocation();
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                document.getElementById('locationStatus').textContent = `📍 ${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
                calculateAndShow(lat, lng);
            },
            (error) => {
                console.warn('Location error:', error);
                document.getElementById('locationStatus').textContent = '⚠️ অবস্থান পাওয়া যায়নি';
                useDefaultLocation();
            },
            { enableHighAccuracy: false, timeout: 10000 }
        );
    }

    function useDefaultLocation() {
        const lat = parseFloat(localStorage.getItem('last_lat')) || 23.8103;
        const lng = parseFloat(localStorage.getItem('last_lng')) || 90.4125;
        document.getElementById('locationStatus').textContent = `📍 ঢাকা (ডিফল্ট)`;
        calculateAndShow(lat, lng);
    }

    function calculateAndShow(lat, lng) {
        const qiblaDegree = calculateQiblaDirection(lat, lng);
        
        document.getElementById('qiblaDegree').textContent = `${Math.round(qiblaDegree)}°`;
        
        const compass = document.getElementById('compassRing');
        compass.style.transform = `rotate(${qiblaDegree}deg)`;

        const directions = ['উত্তর', 'উত্তর-পূর্ব', 'পূর্ব', 'দক্ষিণ-পূর্ব', 'দক্ষিণ', 'দক্ষিণ-পশ্চিম', 'পশ্চিম', 'উত্তর-পশ্চিম'];
        const index = Math.round(qiblaDegree / 45) % 8;
        
        document.getElementById('qiblaStatus').textContent = `মক্কার দিক থেকে ${Math.round(qiblaDegree)}° ${directions[index]}`;

        localStorage.setItem('last_lat', lat);
        localStorage.setItem('last_lng', lng);
    }

    function closeQibla() {
        const modal = document.getElementById('qiblaModal');
        if (modal) modal.style.display = 'none';
    }

    return {
        showQiblaView,
        requestLocation,
        closeQibla,
        calculateQiblaDirection
    };
})();
