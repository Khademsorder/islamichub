const ZikrCounterService = (() => {
    const STORAGE_KEY = 'zikr_counter_data';

    const ZIKR_LIST = [
        {
            name: 'সুবহানআল্লাহ',
            arabic: 'سُبْحَانَ اللَّهِ',
            transliteration: 'Subhanallah',
            meaning: 'আল্লাহ পবিত্র',
            target: 33,
            color: '#0A5438',
        },
        {
            name: 'আলহামদুলিল্লাহ',
            arabic: 'الْحَمْدُ لِلَّهِ',
            transliteration: 'Alhamdulillah',
            meaning: 'সমস্ত প্রশংসা আল্লাহর',
            target: 33,
            color: '#7C3AED',
        },
        {
            name: 'আল্লাহু আকবার',
            arabic: 'اللَّهُ أَكْبَرُ',
            transliteration: 'Allahu Akbar',
            meaning: 'আল্লাহ মহান',
            target: 34,
            color: '#0369A1',
        },
        {
            name: 'লা ইলাহা ইল্লাল্লাহ',
            arabic: 'لَا إِلٰهَ إِلَّا اللَّهُ',
            transliteration: 'La ilaha illallah',
            meaning: 'আল্লাহ ছাড়া কোনো ইলাহ নেই',
            target: 100,
            color: '#C2410C',
        },
        {
            name: 'আস্তাগফিরুল্লাহ',
            arabic: 'أَسْتَغْفِرُ اللَّهَ',
            transliteration: 'Astaghfirullah',
            meaning: 'আমি আল্লাহর কাছে ক্ষমা চাই',
            target: 100,
            color: '#0F766E',
        },
        {
            name: 'দরূদ শরীফ',
            arabic: 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ',
            transliteration: 'Allahumma salli ala Muhammad',
            meaning: 'হে আল্লাহ, মুহাম্মদের উপর রহমত বর্ষণ করুন',
            target: 100,
            color: '#B45309',
        },
    ];

    let state = {
        count: 0,
        setsDone: 0,
        selectedZikrIndex: 0,
        target: ZIKR_LIST[0].target,
        color: ZIKR_LIST[0].color,
    };

    function loadState() {
        try {
            const savedState = localStorage.getItem(STORAGE_KEY);
            if (savedState) {
                const loaded = JSON.parse(savedState);
                state = { ...state, ...loaded };
                if (state.selectedZikrIndex >= ZIKR_LIST.length) {
                    state.selectedZikrIndex = 0;
                }
                state.target = ZIKR_LIST[state.selectedZikrIndex].target;
                state.color = ZIKR_LIST[state.selectedZikrIndex].color;
            }
        } catch (e) {
            console.error("Error loading Zikr state:", e);
        }
    }

    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                count: state.count,
                setsDone: state.setsDone,
                selectedZikrIndex: state.selectedZikrIndex,
            }));
        } catch (e) {
            console.error("Error saving Zikr state:", e);
        }
    }

    loadState();

    function selectZikr(index) {
        if (index >= 0 && index < ZIKR_LIST.length) {
            state.selectedZikrIndex = index;
            state.count = 0;
            state.setsDone = 0;
            state.target = ZIKR_LIST[index].target;
            state.color = ZIKR_LIST[index].color;
            saveState();
            return { status: 'changed', state: getCurrentState() };
        }
        return { status: 'error', message: 'Invalid Zikr Index' };
    }

    function increment() {
        state.count++;
        if (state.count >= state.target) {
            state.count = 0;
            state.setsDone++;
            saveState();
            return { status: 'completed_set', state: getCurrentState() };
        }
        saveState();
        return { status: 'incremented', state: getCurrentState() };
    }

    function reset() {
        state.count = 0;
        saveState();
        return { status: 'reset', state: getCurrentState() };
    }

    function getCurrentState() {
        const currentZikr = ZIKR_LIST[state.selectedZikrIndex];
        return {
            count: state.count,
            setsDone: state.setsDone,
            target: state.target,
            selectedZikrIndex: state.selectedZikrIndex,
            currentZikrData: currentZikr,
            progress: state.target > 0 ? state.count / state.target : 0.0,
        };
    }

    // --- UI View ---
    // --- UI View ---
    function showView() {
        const existingModal = document.getElementById('zikrModal');
        if (existingModal) {
            existingModal.style.display = 'flex';
            updateUI();
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'zikrModal';
        modal.className = 'view-transition';
        modal.style.cssText = `
            position:fixed;top:0;left:0;width:100%;height:100%;
            background: var(--bg-main) url('./img/tasbih-bg.png') center/cover no-repeat;
            z-index:99999;
            display:flex;flex-direction:column;
            font-family:'Noto Sans Bengali',sans-serif;
        `;

        // Bright, soft spiritual overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position:absolute;inset:0;
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(240, 249, 246, 0.98) 100%);
            z-index:0;
        `;
        modal.appendChild(overlay);

        const content = document.createElement('div');
        content.style.cssText = `position:relative;z-index:1;display:flex;flex-direction:column;height:100%;`;
        modal.appendChild(content);

        const currentState = getCurrentState();

        content.innerHTML = `
            <div style="padding: calc(20px + var(--sat, 0px)) 16px 20px; border-bottom:1px solid var(--border-color); display:flex; align-items:center; justify-content:space-between;">
                <div style="display:flex;align-items:center;gap:15px;">
                    <button onclick="ZikrCounterService.closeView()" style="background:var(--bg-surface); border:1px solid var(--border-color); width:40px; height:40px; border-radius:50%; cursor:pointer; color:var(--text-primary); display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-sm);">
                        <span class="material-symbols-rounded">arrow_back</span>
                    </button>
                    <div>
                        <h2 style="margin:0;font-size:18px;color:var(--text-primary);font-weight:900;">তসবীহ</h2>
                        <p style="margin:0;font-size:11px;color:var(--text-secondary);font-weight:700;text-transform:uppercase;letter-spacing:1px;">Spiritual Zikr</p>
                    </div>
                </div>
                <button onclick="ZikrCounterService.resetCurrent()" style="background:var(--bg-surface); border:1px solid var(--border-color); padding:8px 16px; border-radius:20px; font-size:13px; font-weight:800; color:var(--soft-rose); display:flex; gap:6px; align-items:center;">
                    <span class="material-symbols-rounded" style="font-size:18px;">refresh</span>রিসেট
                </button>
            </div>
            
            <div style="padding:15px 10px;overflow-x:auto;display:flex;gap:10px;scrollbar-width:none;-ms-overflow-style:none;">
                ${ZIKR_LIST.map((z, i) => `
                    <div onclick="ZikrCounterService.selectZikrUI(${i})" 
                         class="zikr-chip"
                         id="zikr-chip-${i}"
                         style="padding:10px 18px;border-radius:25px;white-space:nowrap;cursor:pointer;font-weight:800;font-size:13px;
                         background:var(--bg-surface);border:1px solid var(--border-color);color:var(--text-secondary);transition:all 0.3s;
                         ${i === currentState.selectedZikrIndex ? `background:${z.color};color:white;border-color:transparent;box-shadow: 0 4px 15px ${z.color}40;` : ''}">
                        ${z.name}
                    </div>
                `).join('')}
            </div>
            
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px;">
                <div id="zikrArabic" style="font-family:'Amiri',serif;font-size:42px;color:var(--text-primary);margin-bottom:12px;text-align:center;">
                    ${currentState.currentZikrData.arabic}
                </div>
                <div id="zikrMeaning" style="font-size:14px;color:var(--text-secondary);margin-bottom:40px;max-width:280px;text-align:center;font-weight:600;line-height:1.5;">
                    ${currentState.currentZikrData.meaning}
                </div>
                    
                <div id="zikrCountDisplay" style="
                    width:240px;height:240px;border-radius:50%;
                    background:var(--bg-surface);
                    display:flex;flex-direction:column;align-items:center;justify-content:center;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.08), inset 0 0 20px rgba(0,0,0,0.02);
                    cursor:pointer;
                    transition:all 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    border:8px solid var(--border-color);
                    position:relative;
                " onclick="ZikrCounterService.tapCount()">
                    <div id="zikrRing" style="position:absolute;inset:-8px;border-radius:50%;border:3px solid ${currentState.currentZikrData.color};opacity:0.2;transition:all 0.3s;"></div>
                    <div id="zikrCountNumber" style="font-size:80px;font-weight:900;color:var(--text-primary);">${currentState.count}</div>
                    <div style="font-size:12px;color:var(--text-secondary);font-weight:800;letter-spacing:1px;background:var(--bg-main);padding:4px 12px;border-radius:20px;">
                        <span id="zikrProgressText">${currentState.count} / ${currentState.target}</span>
                    </div>
                </div>
                    
                <div style="margin-top:40px;text-align:center;">
                    <div style="font-size:12px;color:var(--text-secondary);font-weight:800;margin-bottom:8px;text-transform:uppercase;">মোট সম্পন্ন সেটসমূহ</div>
                    <div id="zikrSetsDisplay" style="font-size:32px;font-weight:900;color:${currentState.currentZikrData.color};">${currentState.setsDone}</div>
                </div>
            </div>

            <style>
                .zikr-chip::-webkit-scrollbar { display: none; }
                @keyframes pulse-ring {
                    0% { transform: scale(1); opacity: 0.2; }
                    50% { transform: scale(1.04); opacity: 0.1; }
                    100% { transform: scale(1); opacity: 0.2; }
                }
                #zikrRing { animation: pulse-ring 2s infinite; }
            </style>
        `;

        document.body.appendChild(modal);
    }

    function updateUI() {
        const currentState = getCurrentState();
        const countNumber = document.getElementById('zikrCountNumber');
        const progressText = document.getElementById('zikrProgressText');
        const setsDisplay = document.getElementById('zikrSetsDisplay');
        const arabic = document.getElementById('zikrArabic');
        const meaning = document.getElementById('zikrMeaning');
        const ring = document.getElementById('zikrRing');

        if (countNumber) countNumber.textContent = currentState.count;
        if (progressText) progressText.textContent = `${currentState.count} / ${currentState.target}`;
        if (setsDisplay) {
            setsDisplay.textContent = currentState.setsDone;
            setsDisplay.style.color = currentState.currentZikrData.color;
        }
        if (arabic) arabic.textContent = currentState.currentZikrData.arabic;
        if (meaning) meaning.textContent = currentState.currentZikrData.meaning;
        if (ring) ring.style.borderColor = currentState.currentZikrData.color;

        document.querySelectorAll('.zikr-chip').forEach((chip, i) => {
            const z = ZIKR_LIST[i];
            if (i === currentState.selectedZikrIndex) {
                chip.style.background = z.color;
                chip.style.color = 'white';
                chip.style.borderColor = 'transparent';
                chip.style.boxShadow = `0 4px 15px ${z.color}40`;
            } else {
                chip.style.background = 'var(--bg-surface)';
                chip.style.color = 'var(--text-secondary)';
                chip.style.borderColor = 'var(--border-color)';
                chip.style.boxShadow = 'none';
            }
        });
    }

    function selectZikrUI(index) {
        selectZikr(index);
        updateUI();
    }

    function resetCurrent() {
        reset();
        updateUI();
    }

    function closeView() {
        const modal = document.getElementById('zikrModal');
        if (modal) modal.style.display = 'none';
    }

    function triggerCelebration() {
        let overlay = document.querySelector('.celebration-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'celebration-overlay';
            overlay.style.cssText = `
                position:fixed;inset:0;background:rgba(255,255,255,0.8);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                z-index:100000;display:flex;align-items:center;justify-content:center;
                flex-direction:column;text-align:center;
            `;
            document.getElementById('zikrModal').appendChild(overlay);
        }

        const zikr = ZIKR_LIST[state.selectedZikrIndex];
        overlay.innerHTML = `
            <div style="background:white;padding:40px;border-radius:30px;box-shadow:0 20px 60px rgba(0,0,0,0.1);transform:scale(0.8);animation:popIn 0.5s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275);max-width:85%;">
                <div style="font-size:60px;margin-bottom:20px;">🎉</div>
                <h2 style="color:var(--accent-primary);font-size:24px;margin:0 0 10px;font-weight:900;">মাশাআল্লাহ!</h2>
                <p style="color:var(--text-secondary);font-size:15px;margin:0 0 25px;font-weight:600;line-height:1.6;">একটি পূর্ণ সেট সম্পন্ন হয়েছে।<br>আল্লাহ আপনার যিকর কবুল করুন।</p>
                <button style="width:100%;padding:14px;background:${zikr.color};color:white;border:none;border-radius:50px;font-weight:900;cursor:pointer;box-shadow:0 8px 20px ${zikr.color}66;" onclick="this.closest('.celebration-overlay').style.display='none'">চালিয়ে যান</button>
            </div>
            <style>
                @keyframes popIn { to { transform: scale(1); } }
            </style>
        `;
        overlay.style.display = 'flex';

        if (window.Capacitor && window.Capacitor.Plugins.Haptics) {
            window.Capacitor.Plugins.Haptics.notification({ type: 'SUCCESS' });
        }
    }

    function tapCount() {
        const result = increment();

        const countDisplay = document.getElementById('zikrCountDisplay');
        if (countDisplay) {
            countDisplay.style.transform = 'scale(0.96)';
            setTimeout(() => countDisplay.style.transform = 'scale(1)', 80);
        }

        if (window.Capacitor && window.Capacitor.Plugins.Haptics) {
            window.Capacitor.Plugins.Haptics.impact({ style: 'MEDIUM' });
        }

        if (result.status === 'completed_set') {
            triggerCelebration();
        }
        updateUI();
    }

    return {
        getZikrList: () => ZIKR_LIST,
        getState: getCurrentState,
        selectZikr,
        increment,
        reset,
        loadState,
        showView,
        closeView,
        selectZikrUI,
        tapCount,
        resetCurrent,
    };
})();
