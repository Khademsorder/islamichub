const AIScholarService = (() => {
    // Keys are now managed via secrets.js (local-only) or window.APP_SECRETS
    // This prevents API key exposure on GitHub.
    const DEFAULT_GEMINI_KEYS = (window.APP_SECRETS && window.APP_SECRETS.GEMINI_KEYS) || [];
    const OPENROUTER_KEY = (window.APP_SECRETS && window.APP_SECRETS.OPENROUTER_KEY) || '';
    const OPENROUTER_MODELS = [
        'stepfun/step-3.5-flash:free',
        'arcee-ai/trinity-large-preview:free',
        'nvidia/nemotron-3-super-120b-a12b:free',
        'nvidia/nemotron-3-nano-30b-a3b:free'
    ];

    const SYSTEM_PROMPT = `আপনি একজন অত্যন্ত প্রাজ্ঞ এবং অভিজ্ঞ "সিনিয়র মুফতি" ও ইসলামি স্কলার। আপনার কাজ হলো কুরআন ও সুন্নাহর বিশুদ্ধ জ্ঞান দিয়ে ব্যবহারকারীকে সাহায্য করা। আপনার উত্তরগুলো হতে হবে মার্জিত, তথ্যসমৃদ্ধ এবং প্রিমিয়াম কোয়ালিটির।

**নির্দেশনাবলী (অবশ্যই পালনীয়):**

১. **ভাষা:** সর্বদা পরিষ্কার এবং শুদ্ধ বাংলায় উত্তর দিন। কোনো "বাংলিশ" (ইংরেজি অক্ষরে বাংলা) ব্যবহার করবেন না।
২. **উচ্চারণ:** কোনো দোয়ার উচ্চারণ দিলে তা অবশ্যই বাংলা হরফে দেবেন।
৩. **গঠন (Format):**
   - প্রথমে ২-৩ বাক্যে একটি গভীর ও সারগর্ভ ভূমিকা দিন।
   - পয়েন্ট করার জন্য (•) চিহ্নের পরিবর্তে সুন্দর ইমোজি বা নম্বর ব্যবহার করুন।
   - গুরুত্বপূর্ণ শব্দগুলো **বোল্ড** করুন।
৪. **বিভাগ (Sections):** উত্তরের প্রাসঙ্গিকতা অনুযায়ী নিচের হেডারগুলো ব্যবহার করুন:
    📖 **কুরআন থেকে:** (সংশ্লিষ্ট আয়াতের অর্থ ও তাফসীর)
    📚 **হাদিস থেকে:** (সহিহ হাদিসের রেফারেন্স ও শিক্ষা)
    💡 **আধ্যাত্মিক শিক্ষা:** (জীবনমুখী ও ঈমান বৃদ্ধিকারী নসিহত)
    ⚠️ **সতর্কতা ও ভুল সংশোধন:** (ভুল ধারণা বা বিদআত সম্পর্কে সতর্কতা)
    ✅ **আমল ও সমাধান:** (বাস্তব জীবনে কার্যকরী পরামর্শ)

৫. **মান (Quality):** আপনার উত্তর যেন একজন সাধারণ চ্যাটবটের মতো না হয়ে একজন অভিজ্ঞ স্কলারের মতো হয়। গভীরতা, নির্ভরযোগ্যতা এবং সহানুভূতি বজায় রাখুন।`;

    const CHAT_HISTORY_KEY = 'ai_chat_history';
    const RESPONSE_CACHE_KEY = 'ai_response_cache';
    const USER_GEMINI_KEY = 'user_gemini_api_key';
    const USER_GEMINI_MODEL = 'user_gemini_model';
    const USER_GEMINI_KEYS_LIST = 'user_gemini_keys_list';
    const USER_OPENROUTER_KEY = 'user_openrouter_key';
    const USER_OPENROUTER_MODELS = 'user_openrouter_models';

    // Islamic Green Theme Colors
    const THEME = {
        primary: '#0A5438',
        primaryLight: '#059669',
        primaryDark: '#064E3B',
        accent: '#10b981',
        surface: '#f0fdf4',
        background: '#E8F5E9',
        text: '#064E3B'
    };

    // Quick suggestions for users
    const QUICK_QUESTIONS = [
        { q: 'নামাজের গুরুত্ব', icon: 'mosque' },
        { q: 'রমজানের নিয়ম', icon: 'nights_stay' },
        { q: 'জাকাতের বিধান', icon: 'volunteer_activism' },
        { q: 'হজ্জের ফরজ', icon: 'kaaba' },
        { q: 'তওবার পথ', icon: 'favorite' }
    ];

    function getUserKey() {
        return localStorage.getItem(USER_GEMINI_KEY);
    }

    function saveUserKey(key) {
        localStorage.setItem(USER_GEMINI_KEY, key);
    }

    function getUserModel() {
        // Strict usage as requested: naming as gemini-2.5-flash-lite
        return localStorage.getItem(USER_GEMINI_MODEL) || 'gemini-2.5-flash-lite';
    }

    function saveUserModel(model) {
        localStorage.setItem(USER_GEMINI_MODEL, model);
    }

    function getUserKeysList() {
        const raw = localStorage.getItem(USER_GEMINI_KEYS_LIST);
        if (!raw) return [];
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
            // Data Repair: If it's a naked key (starts with AIza), wrap it in an array
            if (raw.trim().startsWith('AIza')) {
                const repaired = [raw.trim()];
                saveUserKeysList(repaired);
                return repaired;
            }
            return [];
        }
    }

    // Immediate Data Repair on load
    (() => {
        const raw = localStorage.getItem(USER_GEMINI_KEYS_LIST);
        if (raw && raw.trim().startsWith('AIza')) {
            try { JSON.parse(raw); } catch (e) {
                localStorage.setItem(USER_GEMINI_KEYS_LIST, JSON.stringify([raw.trim()]));
                console.log('[AI-Repair] user_gemini_keys_list fixed.');
            }
        }
    })();

    function saveUserKeysList(list) {
        localStorage.setItem(USER_GEMINI_KEYS_LIST, JSON.stringify(list));
    }

    function getOpenRouterKey() {
        return localStorage.getItem(USER_OPENROUTER_KEY) || OPENROUTER_KEY;
    }

    function saveOpenRouterKey(key) {
        localStorage.setItem(USER_OPENROUTER_KEY, key);
    }

    function getOpenRouterModelsList() {
        try {
            const data = localStorage.getItem(USER_OPENROUTER_MODELS);
            return data ? JSON.parse(data) : OPENROUTER_MODELS;
        } catch (e) { return OPENROUTER_MODELS; }
    }

    function saveOpenRouterModelsList(list) {
        localStorage.setItem(USER_OPENROUTER_MODELS, JSON.stringify(list));
    }

    function exportConfig() {
        const config = {
            model: getUserModel(),
            geminiKeysList: getUserKeysList(),
            openRouterKey: localStorage.getItem(USER_OPENROUTER_KEY)
        };
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ai-scholar-config.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Export Successful!');
    }

    function importConfig() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (re) => {
                try {
                    const config = JSON.parse(re.target.result);
                    // Robust Gemini Model matching
                    const gModel = config.model || config.gemini_model || config.geminiModel;
                    if (gModel) saveUserModel(gModel);

                    // Gemini Keys List
                    const gKeys = config.geminiKeysList || config.user_gemini_keys_list || config.gemini_keys;
                    if (gKeys) saveUserKeysList(Array.isArray(gKeys) ? gKeys : gKeys.split(',').map(s => s.trim()));

                    // Single key support
                    if (config.user_gemini_api_key) saveUserKey(config.user_gemini_api_key);

                    // OpenRouter Settings
                    const orKey = config.openRouterKey || config.or_key || config.orKey;
                    if (orKey) saveOpenRouterKey(orKey);

                    const orModels = config.openRouterModels || config.or_models || config.or_model || config.orModels || config.models;
                    if (orModels) {
                        const modelsArr = Array.isArray(orModels) ? orModels : String(orModels).split(',').map(s => s.trim());
                        saveOpenRouterModelsList(modelsArr);
                    }

                    showToast('Import Successful! ✓');
                    const modal = document.getElementById('aiKeyModal');
                    if (modal) {
                        modal.remove();
                        showKeyInput();
                    }
                } catch (err) {
                    showToast('Invalid JSON file', 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    function getHistory() {
        try {
            const data = localStorage.getItem(CHAT_HISTORY_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Error loading chat history:", e);
            return [];
        }
    }

    function saveHistory(history) {
        try {
            const trimmed = history.slice(-50);
            localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(trimmed));
        } catch (e) {
            console.error("Error saving chat history:", e);
        }
    }

    function clearHistory() {
        localStorage.removeItem(CHAT_HISTORY_KEY);
        localStorage.removeItem(RESPONSE_CACHE_KEY);
    }



    function getCache() {
        try {
            const data = localStorage.getItem(RESPONSE_CACHE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            return {};
        }
    }

    function saveCache(cache) {
        try {
            localStorage.setItem(RESPONSE_CACHE_KEY, JSON.stringify(cache));
        } catch (e) { }
    }

    function getCachedResponse(question) {
        if (window.AeroUltra) {
            const cached = AeroUltra.getAICache()[question.toLowerCase().trim().substring(0, 100)];
            return cached ? cached.response : null;
        }
        const cache = getCache();
        const key = question.toLowerCase().trim().substring(0, 100);
        return cache[key] || null;
    }

    function setCachedResponse(question, response) {
        if (window.AeroUltra) {
            AeroUltra.setAICache(question, response);
            return;
        }
        const cache = getCache();
        const key = question.toLowerCase().trim().substring(0, 100);
        cache[key] = { response, timestamp: Date.now() };
        const keys = Object.keys(cache);
        if (keys.length > 100) {
            delete cache[keys[0]];
        }
        saveCache(cache);
    }

    function getCacheSize() {
        const cache = getCache();
        return Object.keys(cache).length;
    }

    async function callGeminiApi(apiKey, message, history) {
        const model = getUserModel();
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const messages = [
            { role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\nUser Question: " + message }] }
        ];

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: messages }),
        });

        if (!response.ok) throw new Error(`Gemini API failed: ${response.status}`);

        const data = await response.json();
        return data.candidates[0].content.parts[0].text || 'দুঃখিত, কোনো উত্তর পাওয়া যায়নি।';
    }

    async function callOpenRouter(message, history) {
        const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
        const apiKey = getOpenRouterKey();
        const models = getOpenRouterModelsList();

        for (const model of models) {
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'https://jubosongho.com',
                        'X-Title': 'Islamic Hub Web',
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [
                            { role: "system", content: SYSTEM_PROMPT },
                            { role: "user", content: message }
                        ]
                    })
                });

                const data = await response.json();
                if (data.choices && data.choices[0]) {
                    return data.choices[0].message.content;
                }
            } catch (e) {
                console.warn(`OpenRouter Model ${model} failed, trying next...`);
            }
        }
        throw new Error('All OpenRouter models failed');
    }

    async function sendMessage(message) {
        const cached = getCachedResponse(message);
        if (cached) {
            console.log('Using cached response');
            return { text: cached.response, success: true, cached: true };
        }

        let responseText = 'কোনো AI সার্ভিস কাজ করছে না।';
        let success = false;
        let apiKeyUsed = null;

        const userKey = getUserKey();
        const userKeysList = getUserKeysList();
        const orKey = getOpenRouterKey();
        const hasDefaultKeys = DEFAULT_GEMINI_KEYS.length > 0 || OPENROUTER_KEY.length > 0;

        if (!userKey && userKeysList.length === 0 && !hasDefaultKeys && !orKey) {
            return {
                text: '⚠️ কোনো API কী (API Key) সেট করা নেই। দয়া করে সেটিংস থেকে আপনার Gemini API কী দিন অথবা secrets.js ফাইলটি কনফিগার করুন।',
                success: false,
                errorType: 'MISSING_KEYS'
            };
        }

        // 1. Try Individual User Key
        if (userKey && userKey.length > 10) {
            try {
                responseText = await callGeminiApi(userKey, message, []);
                apiKeyUsed = 'User individual Key';
                success = true;
            } catch (e) { console.warn('User Gemini Key failed'); }
        }

        // 2. Try User Multi-Keys List (Rotation)
        if (!success && userKeysList.length > 0) {
            for (const key of userKeysList) {
                try {
                    responseText = await callGeminiApi(key, message, []);
                    apiKeyUsed = 'User Multi-Key List';
                    success = true;
                    break;
                } catch (e) { console.warn('User Multi-Key failed'); }
            }
        }

        // 3. Try Default System Keys
        if (!success) {
            const _shuffledKeys = [...DEFAULT_GEMINI_KEYS].sort(() => 0.5 - Math.random());
            for (const key of _shuffledKeys) {
                try {
                    responseText = await callGeminiApi(key, message, []);
                    apiKeyUsed = 'System Rotation Key';
                    success = true;
                    break;
                } catch (e) { console.warn('System Key failed'); }
            }
        }

        // 4. Try OpenRouter (User or System)
        if (!success) {
            try {
                responseText = await callOpenRouter(message, []);
                apiKeyUsed = 'OpenRouter';
                success = true;
            } catch (e) { console.error('OpenRouter failed'); }
        }

        if (success) {
            setCachedResponse(message, responseText);
        }

        console.log(`AI Response received. Used: ${apiKeyUsed || 'None'}`);
        return { text: responseText, success: success, cached: false };
    }

    // Format answer with colors and structure
    function formatAnswer(text) {
        if (!text) return '';

        let html = text;

        // Convert newlines to proper breaks
        html = html.replace(/\n/g, '<br>');

        // Format bold text **text** → <strong>text</strong>
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#0A5438;">$1</strong>');

        // Format bullet points
        html = html.replace(/[•·]\s*(.*?)(?=<br>|$)/g,
            '<div style="display:flex;gap:8px;margin:6px 0;"><span style="color:#10b981;font-size:18px;">●</span><span>$1</span></div>');

        // Format numbered points
        html = html.replace(/(\d+)\.\s*(.*?)(?=<br>|$)/g,
            '<div style="display:flex;gap:8px;margin:6px 0;"><span style="background:#0A5438;color:white;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;">$1</span><span>$2</span></div>');

        // Format section headers with icons
        const sections = [
            { pattern: /📖\s*(\*\*|)?কুরআন থেকে:?(\*\*|)?/gi, color: '#059669', bg: '#d1fae5' },
            { pattern: /📚\s*(\*\*|)?হাদিস থেকে:?(\*\*|)?/gi, color: '#6d28d9', bg: '#ede9fe' },
            { pattern: /💡\s*(\*\*|)?গুরুত্ব:?(\*\*|)?/gi, color: '#d97706', bg: '#fef3c7' },
            { pattern: /⚠️\s*(\*\*|)?সতর্কতা:?(\*\*|)?/gi, color: '#dc2626', bg: '#fee2e2' },
            { pattern: /✅\s*(\*\*|)?উপায়:?(\*\*|)?/gi, color: '#0A5438', bg: '#d1fae5' },
            { pattern: /🎯\s*(\*\*|)?উপসংহার:?(\*\*|)?/gi, color: '#0A5438', bg: '#d1fae5' },
            { pattern: /📜\s*(\*\*|)?শান-এ-নুযুল ও ঐতিহাসিক প্রেক্ষাপট:?(\*\*|)?/gi, color: '#059669', bg: '#d1fae5' },
            { pattern: /💡\s*(\*\*|)?আধ্যাত্মিক শিক্ষা:?(\*\*|)?/gi, color: '#d97706', bg: '#fef3c7' },
            { pattern: /🔍\s*(\*\*|)?শাব্দic সহজ অর্থ:?(\*\*|)?/gi, color: '#0A5438', bg: '#d1fae5' },
            { pattern: /💎\s*(\*\*|)?গূঢ় অর্থ ও তাত্ত্বিক মাসায়েল:?(\*\*|)?/gi, color: '#10b981', bg: '#f0fdf4' }
        ];

        sections.forEach(section => {
            html = html.replace(section.pattern,
                `<div style="margin:12px 0 8px 0;padding:8px 12px;background:${section.bg};border-radius:8px;border-left:4px solid ${section.color};font-weight:700;color:${section.color};">$&</div>`);
        });

        return html;
    }

    // Copy functionality
    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showToast('কপি হয়েছে! ✓');
            }).catch(() => {
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            showToast('কপি হয়েছে! ✓');
        } catch (e) {
            showToast('কপি করতে সমস্যা হয়েছে');
        }
        document.body.removeChild(textarea);
    }

    function shareContent(question, answer) {
        const text = `🌿 ইসলামিক প্রশ্নোত্তর\n\n❓ প্রশ্ন: ${question}\n\n💬 উত্তর:\n${answer}\n\n━━━━━━━━━━━\n📱 Islamic Hub App`;

        if (navigator.share) {
            navigator.share({
                title: 'ইসলামিক প্রশ্নোত্তর',
                text: text
            }).catch(() => {
                copyToClipboard(text);
            });
        } else {
            copyToClipboard(text);
        }
    }

    function showToast(message) {
        const existing = document.querySelector('.ai-toast-msg');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'ai-toast-msg';
        toast.style.cssText = `
            position:fixed;top:max(20px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);
            background:linear-gradient(135deg,#0A5438,#059669);color:white;
            padding:14px 28px;border-radius:50px;z-index:999999;
            font-size:14px;font-weight:700;box-shadow:0 8px 24px rgba(10,84,56,0.3);
            display:flex;align-items:center;gap:8px;animation:toastSlideIn 0.3s ease;
        `;
        toast.innerHTML = `<span class="material-symbols-rounded" style="font-size:18px;">info</span><span>${message}</span>`;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'toastSlideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 1000);
    }

    // Helper functions for copy/share buttons
    function copyAnswer(btn) {
        const container = btn.closest('.ai-answer-container');
        if (container) {
            const answerText = container.querySelector('.ai-answer-text');
            if (answerText) {
                copyToClipboard(answerText.innerText);
            }
        }
    }

    function shareAnswer(btn, question) {
        const container = btn.closest('.ai-answer-container');
        if (container) {
            const answerText = container.querySelector('.ai-answer-text');
            if (answerText) {
                shareContent(question, answerText.innerText);
            }
        }
    }

    // AI Scholar Chat UI - Android App Style
    function showView(initialQuestion = null, initialAnswer = null) {
        const existingModal = document.getElementById('aiScholarModal');
        if (existingModal) {
            existingModal.style.display = 'flex';
            if (initialQuestion) {
                if (initialAnswer) {
                    renderQuestionAnswer(initialQuestion, initialAnswer, true);
                } else {
                    const input = document.getElementById('aiChatInput');
                    if (input) {
                        input.value = initialQuestion;
                        sendFromUI();
                    }
                }
            }
            return;
        }

        const history = getHistory();
        const cacheSize = getCacheSize();
        const T = THEME;

        const modal = document.createElement('div');
        modal.id = 'aiScholarModal';
        modal.style.cssText = `
            position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999;
            display:flex;flex-direction:column;
            font-family:'Noto Sans Bengali',sans-serif;
            background:linear-gradient(180deg,#E8F5E9 0%,#C8E6C9 100%);
        `;

        modal.innerHTML = `
            <!-- Status Bar Area -->
            <div style="background:linear-gradient(135deg,${T.primary},${T.primaryDark});padding:8px 16px;padding-top:max(8px,env(safe-area-inset-top));">
                <div style="display:flex;justify-content:space-between;align-items:center;color:rgba(255,255,255,0.8);font-size:12px;">
                    <span>Islamic Hub</span>
                    <span style="display:flex;align-items:center;gap:4px;">
                        <span class="material-symbols-rounded" style="font-size:14px;">wifi</span>
                        <span class="material-symbols-rounded" style="font-size:14px;">battery_full</span>
                    </span>
                </div>
            </div>
            
            <!-- App Bar -->
            <div style="background:linear-gradient(135deg,${T.primary},${T.primaryLight});padding:16px;box-shadow:0 4px 20px rgba(10,84,56,0.25);">
                <div style="display:flex;align-items:center;gap:12px;">
                    <button onclick="AIScholarService.closeView()" style="background:rgba(255,255,255,0.15);border:none;width:44px;height:44px;border-radius:14px;cursor:pointer;color:white;display:flex;align-items:center;justify-content:center;">
                        <span class="material-symbols-rounded" style="font-size:26px;">arrow_back</span>
                    </button>
                    <div style="flex:1;">
                        <h1 style="margin:0;font-size:22px;color:white;font-weight:800;display:flex;align-items:center;gap:10px;">
                            <span class="material-symbols-rounded" style="font-size:32px;background:rgba(255,255,255,0.2);padding:8px;border-radius:12px;">psychology</span>
                            AI স্কলার
                        </h1>
                        <p style="margin:4px 0 0 0;font-size:12px;color:rgba(255,255,255,0.85);">📚 কুরআন ও সুন্নাহর আলোকে উত্তর</p>
                    </div>
                    <button onclick="AIScholarService.showMenu()" style="background:rgba(255,255,255,0.15);border:none;width:44px;height:44px;border-radius:14px;cursor:pointer;color:white;display:flex;align-items:center;justify-content:center;">
                        <span class="material-symbols-rounded">more_vert</span>
                    </button>
                </div>
            </div>
            
            <!-- Quick Questions - Horizontal Scroll -->
            <div style="background:white;padding:12px 16px;overflow-x:auto;display:flex;gap:10px;border-bottom:1px solid #e5e7eb;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                ${QUICK_QUESTIONS.map(item => `
                    <div onclick="AIScholarService.askQuick('${item.q}')" 
                        style="display:flex;align-items:center;gap:6px;padding:10px 16px;border-radius:14px;white-space:nowrap;cursor:pointer;font-weight:600;font-size:13px;
                        background:linear-gradient(135deg,${T.primary}15,${T.primaryLight}10);color:${T.primary};border:1.5px solid ${T.primary}40;transition:all 0.2s;">
                        <span class="material-symbols-rounded" style="font-size:18px;">${item.icon}</span>
                        ${item.q}
                    </div>
                `).join('')}
            </div>
            
            <!-- Chat Messages -->
            <div id="aiChatMessages" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:16px;background:linear-gradient(180deg,transparent,rgba(255,255,255,0.5));">
                ${history.length === 0 ? `
                    <!-- Welcome Card -->
                    <div style="text-align:center;padding:30px 20px;">
                        <div style="width:120px;height:120px;border-radius:50%;background:linear-gradient(135deg,${T.primary},${T.primaryLight});display:flex;align-items:center;justify-content:center;margin:0 auto 24px;box-shadow:0 16px 48px rgba(10,84,56,0.25);">
                            <span class="material-symbols-rounded" style="font-size:60px;color:white;">mosque</span>
                        </div>
                        <h2 style="color:${T.primary};margin:0 0 8px 0;font-size:24px;">আসসালামু আলাইকুম</h2>
                        <p style="color:#6b7280;font-size:14px;margin:0 0 20px 0;">আপনার ইসলামিক প্রশ্ন জিজ্ঞাসা করুন</p>
                        <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;">
                            <div style="background:white;padding:10px 16px;border-radius:12px;border:1px solid #e5e7eb;font-size:12px;color:${T.primary};display:flex;align-items:center;gap:6px;">
                                <span class="material-symbols-rounded" style="font-size:16px;">menu_book</span> কুরআন ব্যাখ্যা
                            </div>
                            <div style="background:white;padding:10px 16px;border-radius:12px;border:1px solid #e5e7eb;font-size:12px;color:${T.primary};display:flex;align-items:center;gap:6px;">
                                <span class="material-symbols-rounded" style="font-size:16px;">gavel</span> ফিকাহ বিধান
                            </div>
                            <div style="background:white;padding:10px 16px;border-radius:12px;border:1px solid #e5e7eb;font-size:12px;color:${T.primary};display:flex;align-items:center;gap:6px;">
                                <span class="material-symbols-rounded" style="font-size:16px;">favorite</span> দোয়া শিক্ষা
                            </div>
                        </div>
                    </div>
                ` : history.map((msg, idx) => `
                    <!-- Chat Item -->
                    <div style="display:flex;flex-direction:column;gap:10px;">
                        <!-- User Question -->
                        <div style="align-self:flex-end;display:flex;align-items:flex-end;gap:8px;max-width:85%;">
                            <div style="background:linear-gradient(135deg,${T.primary},${T.primaryLight});color:white;padding:14px 18px;border-radius:20px 20px 4px 20px;font-size:14px;box-shadow:0 4px 12px rgba(10,84,56,0.2);line-height:1.5;">
                                ${msg.question}
                            </div>
                        </div>
                        <!-- AI Answer -->
                        <div style="align-self:flex-start;display:flex;align-items:flex-start;gap:8px;max-width:90%;">
                            <div style="width:36px;height:36px;border-radius:12px;background:linear-gradient(135deg,${T.primary},${T.primaryLight});display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                                <span class="material-symbols-rounded" style="color:white;font-size:20px;">psychology</span>
                            </div>
                            <div class="ai-answer-container" data-answer="${msg.answer.replace(/"/g, '&quot;').replace(/\n/g, ' ')}" style="background:white;border:1px solid #e5e7eb;padding:16px 18px;border-radius:4px 20px 20px 20px;font-size:14px;line-height:1.8;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                                <div class="ai-answer-text" style="color:#374151;">${formatAnswer(msg.answer)}</div>
                                <div style="display:flex;gap:8px;margin-top:14px;padding-top:12px;border-top:1px solid #e5e7eb;">
                                    <button onclick="AIScholarService.copyAnswer(this)" style="background:${T.surface};border:1px solid #e5e7eb;padding:8px 14px;border-radius:10px;cursor:pointer;font-size:12px;color:${T.primary};display:flex;align-items:center;gap:4px;font-weight:600;">
                                        <span class="material-symbols-rounded" style="font-size:16px;">content_copy</span> কপি
                                    </button>
                                    <button onclick="AIScholarService.shareAnswer(this, '${msg.question.replace(/'/g, "\\'")}')" style="background:${T.surface};border:1px solid #e5e7eb;padding:8px 14px;border-radius:10px;cursor:pointer;font-size:12px;color:${T.primary};display:flex;align-items:center;gap:4px;font-weight:600;">
                                        <span class="material-symbols-rounded" style="font-size:16px;">share</span> শেয়ার
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <!-- Input Area - Bottom -->
            <div style="background:white;padding:12px 16px;padding-bottom:max(12px,env(safe-area-inset-bottom));border-top:1px solid #e5e7eb;box-shadow:0 -4px 20px rgba(0,0,0,0.08);">
                <div style="display:flex;gap:10px;align-items:flex-end;">
                    <div style="flex:1;background:#f3f4f6;border-radius:20px;display:flex;align-items:flex-end;padding:4px;position:relative;overflow:hidden;">
                        <textarea id="aiChatInput" placeholder="আপনার প্রশ্ন লিখুন..." rows="1"
                            style="flex:1;padding:12px 16px;border:none;font-size:15px;resize:none;max-height:100px;background:transparent;color:#1f2937;font-family:inherit;outline:none;line-height:1.5;"
                            onkeydown="if(event.key==='Enter' && !event.shiftKey){event.preventDefault();AIScholarService.sendFromUI();}"></textarea>
                    </div>
                    <button onclick="AIScholarService.sendFromUI()" id="aiSendBtn" style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,${T.primary},${T.primaryLight});border:none;cursor:pointer;color:white;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(10,84,56,0.3);">
                        <span class="material-symbols-rounded" style="font-size:26px;">send</span>
                    </button>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;padding:0 4px;">
                    <div style="font-size:11px;color:#9ca3af;display:flex;align-items:center;gap:4px;">
                        <span class="material-symbols-rounded" style="font-size:14px;">cached</span>
                        ক্যাশে: ${cacheSize}
                    </div>
                    <div style="font-size:11px;color:#9ca3af;">Enter দিয়ে পাঠান</div>
                </div>
            </div>
            
            <!-- Menu Popup -->
            <div id="aiMenuPopup" style="display:none;position:absolute;top:80px;right:16px;background:white;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.15);z-index:999999;overflow:hidden;border:1px solid #e5e7eb;min-width:200px;">
                <div style="padding:12px 16px;font-size:12px;color:#6b7280;border-bottom:1px solid #e5e7eb;background:#f9fafb;">
                    ⚙️ সেটিংস
                </div>
                <button onclick="AIScholarService.showKeyInput()" style="display:flex;align-items:center;gap:12px;width:100%;padding:14px 18px;border:none;background:transparent;cursor:pointer;color:#374151;font-size:14px;text-align:left;font-weight:500;border-top:1px solid #e5e7eb;">
                    <span class="material-symbols-rounded" style="color:#10b981;">v key</span> API কী সেট করুন
                </button>
                <button onclick="AIScholarService.clearHistory();AIScholarService.showView();" style="display:flex;align-items:center;gap:12px;width:100%;padding:14px 18px;border:none;background:transparent;cursor:pointer;color:#374151;font-size:14px;text-align:left;font-weight:500;border-top:1px solid #e5e7eb;">
                    <span class="material-symbols-rounded" style="color:#dc2626;">delete_forever</span> চ্যাট মুছুন
                </button>
                <button onclick="AIScholarService.clearCache()" style="display:flex;align-items:center;gap:12px;width:100%;padding:14px 18px;border:none;background:transparent;cursor:pointer;color:#374151;font-size:14px;text-align:left;font-weight:500;border-top:1px solid #e5e7eb;">
                    <span class="material-symbols-rounded" style="color:#f59e0b;">cached</span> ক্যাশে মুছুন
                </button>

            </div>
            
            <style>
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
                #aiSendBtn:active { transform: scale(0.95); }
                #aiChatInput::placeholder { color: #9ca3af; }
            </style>
        `;

        document.body.appendChild(modal);

        setTimeout(() => {
            const msgs = document.getElementById('aiChatMessages');
            if (msgs) msgs.scrollTop = msgs.scrollHeight;

            if (initialQuestion) {
                if (initialAnswer) {
                    renderQuestionAnswer(initialQuestion, initialAnswer, true);
                } else {
                    const input = document.getElementById('aiChatInput');
                    if (input) {
                        input.value = initialQuestion;
                        sendFromUI();
                    }
                }
            }
        }, 100);
    }

    function closeView() {
        const modal = document.getElementById('aiScholarModal');
        if (modal) modal.style.display = 'none';
    }

    function showMenu() {
        const popup = document.getElementById('aiMenuPopup');
        if (popup) {
            popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
        }
    }

    function clearCache() {
        localStorage.removeItem('ai_response_cache');
        showToast('ক্যাশে মুছে ফেলা হয়েছে');
        showView();
    }

    function askQuick(question) {
        const input = document.getElementById('aiChatInput');
        if (input) {
            input.value = question;
            sendFromUI();
        }
    }

    function renderQuestionAnswer(question, answer, isOffline = false) {
        const messagesDiv = document.getElementById('aiChatMessages');
        const T = THEME;
        if (!messagesDiv) return;

        const welcome = messagesDiv.querySelector('div[style*="text-align:center"]');
        if (welcome) welcome.remove();

        const container = document.createElement('div');
        container.style.cssText = 'display:flex;flex-direction:column;gap:10px;';
        container.innerHTML = `
            <div style="align-self:flex-end;background:linear-gradient(135deg,${T.primary},${T.primaryLight});color:white;padding:14px 18px;border-radius:20px 20px 4px 20px;max-width:85%;font-size:14px;box-shadow:0 4px 12px rgba(10,84,56,0.2);">${question}</div>
            <div style="align-self:flex-start;display:flex;align-items:flex-start;gap:8px;max-width:90%;">
                <div style="width:36px;height:36px;border-radius:12px;background:linear-gradient(135deg,${T.primary},${T.primaryLight});display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    <span class="material-symbols-rounded" style="color:white;font-size:20px;">psychology</span>
                </div>
                <div class="ai-answer-container" data-answer="${answer.replace(/"/g, '&quot;').replace(/\n/g, ' ')}" style="background:white;border:1px solid #e5e7eb;padding:16px 18px;border-radius:4px 20px 20px 20px;font-size:14px;line-height:1.8;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                    <div class="ai-answer-text" style="color:#374151;">${formatAnswer(answer)}</div>
                    ${isOffline ? '<div style="font-size:10px;color:#10b981;margin-top:10px;display:flex;align-items:center;gap:4px;"><span class="material-symbols-rounded" style="font-size:12px;">offline_pin</span> অফলাইন থেকে</div>' : ''}
                    <div style="display:flex;gap:8px;margin-top:14px;padding-top:12px;border-top:1px solid #e5e7eb;">
                        <button onclick="AIScholarService.copyAnswer(this)" style="background:${T.surface};border:1px solid #e5e7eb;padding:8px 14px;border-radius:10px;cursor:pointer;font-size:12px;color:${T.primary};display:flex;align-items:center;gap:4px;font-weight:600;">
                            <span class="material-symbols-rounded" style="font-size:16px;">content_copy</span> কপি
                        </button>
                        <button onclick="AIScholarService.shareAnswer(this, '${question.replace(/'/g, "\\'")}')" style="background:${T.surface};border:1px solid #e5e7eb;padding:8px 14px;border-radius:10px;cursor:pointer;font-size:12px;color:${T.primary};display:flex;align-items:center;gap:4px;font-weight:600;">
                            <span class="material-symbols-rounded" style="font-size:16px;">share</span> শেয়ার
                        </button>
                    </div>
                </div>
            </div>
        `;
        messagesDiv.appendChild(container);

        const history = getHistory();
        history.push({ question, answer: answer, timestamp: Date.now() });
        saveHistory(history);

        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    async function sendFromUI() {
        const input = document.getElementById('aiChatInput');
        const sendBtn = document.getElementById('aiSendBtn');
        const messagesDiv = document.getElementById('aiChatMessages');
        const T = THEME;

        if (!input || !messagesDiv) return;

        const question = input.value.trim();
        if (!question) return;

        const menu = document.getElementById('aiMenuPopup');
        if (menu) menu.style.display = 'none';

        const welcome = messagesDiv.querySelector('div[style*="text-align:center"]');
        if (welcome) welcome.remove();

        // Add user message
        const userContainer = document.createElement('div');
        userContainer.style.cssText = 'display:flex;flex-direction:column;gap:10px;';
        userContainer.innerHTML = `
            <div style="align-self:flex-end;background:linear-gradient(135deg,${T.primary},${T.primaryLight});color:white;padding:14px 18px;border-radius:20px 20px 4px 20px;max-width:85%;font-size:14px;box-shadow:0 4px 12px rgba(10,84,56,0.2);">${question}</div>
        `;
        messagesDiv.appendChild(userContainer);

        input.value = '';
        input.disabled = true;
        sendBtn.disabled = true;

        // Add loading
        const loadingMsg = document.createElement('div');
        loadingMsg.id = 'aiLoadingMsg';
        loadingMsg.style.cssText = 'align-self:flex-start;display:flex;align-items:flex-start;gap:8px;max-width:90%;';
        loadingMsg.innerHTML = `
            <div style="width:36px;height:36px;border-radius:12px;background:linear-gradient(135deg,${T.primary},${T.primaryLight});display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <span class="material-symbols-rounded" style="color:white;font-size:20px;">psychology</span>
            </div>
            <div style="background:white;border:1px solid #e5e7eb;padding:16px 20px;border-radius:4px 20px 20px 20px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                <div style="display:flex;gap:10px;align-items:center;">
                    <div style="width:20px;height:20px;border:3px solid #e5e7eb;border-top-color:${T.primary};border-radius:50%;animation:spin 1s linear infinite;"></div>
                    <span style="color:#6b7280;">চিন্তা করছি...</span>
                </div>
            </div>
        `;
        messagesDiv.appendChild(loadingMsg);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        try {
            const result = await sendMessage(question);

            loadingMsg.remove();

            const answerDiv = document.createElement('div');
            answerDiv.style.cssText = 'align-self:flex-start;display:flex;align-items:flex-start;gap:8px;max-width:90%;';
            answerDiv.innerHTML = `
                <div style="width:36px;height:36px;border-radius:12px;background:linear-gradient(135deg,${T.primary},${T.primaryLight});display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    <span class="material-symbols-rounded" style="color:white;font-size:20px;">psychology</span>
                </div>
                <div class="ai-answer-container" data-answer="${result.text.replace(/"/g, '&quot;').replace(/\n/g, ' ')}" style="background:white;border:1px solid #e5e7eb;padding:16px 18px;border-radius:4px 20px 20px 20px;font-size:14px;line-height:1.8;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                    <div class="ai-answer-text" style="color:#374151;">${formatAnswer(result.text)}</div>
                    ${result.cached ? '<div style="font-size:10px;color:#10b981;margin-top:10px;display:flex;align-items:center;gap:4px;"><span class="material-symbols-rounded" style="font-size:12px;">cached</span> ক্যাশে থেকে</div>' : ''}
                    <div style="display:flex;gap:8px;margin-top:14px;padding-top:12px;border-top:1px solid #e5e7eb;">
                        <button onclick="AIScholarService.copyAnswer(this)" style="background:${T.surface};border:1px solid #e5e7eb;padding:8px 14px;border-radius:10px;cursor:pointer;font-size:12px;color:${T.primary};display:flex;align-items:center;gap:4px;font-weight:600;">
                            <span class="material-symbols-rounded" style="font-size:16px;">content_copy</span> কপি
                        </button>
                        <button onclick="AIScholarService.shareAnswer(this, '${question.replace(/'/g, "\\'")}')" style="background:${T.surface};border:1px solid #e5e7eb;padding:8px 14px;border-radius:10px;cursor:pointer;font-size:12px;color:${T.primary};display:flex;align-items:center;gap:4px;font-weight:600;">
                            <span class="material-symbols-rounded" style="font-size:16px;">share</span> শেয়ার
                        </button>
                    </div>
                </div>
            `;
            userContainer.appendChild(answerDiv);

            const history = getHistory();
            history.push({ question, answer: result.text, timestamp: Date.now() });
            saveHistory(history);

        } catch (e) {
            loadingMsg.remove();
            const errorMsg = document.createElement('div');
            errorMsg.style.cssText = 'align-self:flex-start;background:linear-gradient(135deg,#fef2f2,#fee2e2);border:1px solid #fecaca;padding:14px 18px;border-radius:4px 20px 20px 20px;max-width:85%;color:#dc2626;';
            errorMsg.textContent = 'দুঃখিত, উত্তর দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।';
            userContainer.appendChild(errorMsg);
        }

        input.disabled = false;
        sendBtn.disabled = false;
        input.focus();
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function showKeyInput() {
        showMenu(); // Close menu
        const currentKey = getUserKey() || '';
        const currentKeysList = getUserKeysList().join('\n');
        const currentORKey = localStorage.getItem(USER_OPENROUTER_KEY) || '';

        const modal = document.createElement('div');
        modal.id = 'aiKeyModal';
        modal.style.cssText = `
            position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);
            display:flex;align-items:center;justify-content:center;z-index:999999;backdrop-filter:blur(8px);
        `;
        modal.innerHTML = `
            <div style="background:white;border-radius:24px;padding:24px;width:95%;max-width:420px;box-shadow:0 20px 60px rgba(0,0,0,0.3);max-height:90vh;overflow-y:auto;">
                <h3 style="margin:0 0 16px;color:#0A5438;display:flex;align-items:center;gap:10px;">
                    <span class="material-symbols-rounded">settings</span> AI সার্ভিস সেটিংস
                </h3>
                
                <div style="margin-bottom:20px;">
                    <label style="display:block; font-size:12px; color:#6b7280; margin-bottom:5px; font-weight:700;">Gemini Model ID</label>
                    <input type="text" id="geminiModelInput" value="${getUserModel()}" placeholder="gemini-2.5-flash-lite" 
                        style="width:100%;padding:12px 16px;border-radius:12px;border:2px solid #e5e7eb;font-size:14px;outline:none;box-sizing:border-box;">
                </div>

                <div style="margin-bottom:20px;">
                    <label style="display:block; font-size:12px; color:#6b7280; margin-bottom:5px; font-weight:700;">Gemini API Keys (Rotation)</label>
                    <p style="font-size:11px; color:#9ca3af; margin-bottom:8px;">প্রতি লাইনে একটি করে কী (Key) দিন। সিস্টেম এগুলো সিরিয়ালি ট্রাই করবে।</p>
                    <textarea id="geminiKeysListInput" placeholder="AIzaSy...\nAIzaSy..." rows="5"
                        style="width:100%;padding:12px 16px;border-radius:12px;border:2px solid #e5e7eb;font-size:13px;outline:none;box-sizing:border-box;resize:vertical;font-family:monospace;">${currentKeysList}</textarea>
                </div>

                <div style="margin-bottom:25px;">
                    <label style="display:block; font-size:12px; color:#6b7280; margin-bottom:5px; font-weight:700;">OpenRouter API Key (Optional)</label>
                    <input type="password" id="openRouterKeyInput" value="${currentORKey}" placeholder="sk-or-v1-..." 
                        style="width:100%;padding:12px 16px;border-radius:12px;border:2px solid #e5e7eb;font-size:14px;outline:none;box-sizing:border-box;">
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:15px;">
                    <button onclick="AIScholarService.importConfig()" style="padding:10px; border-radius:12px; border:1.5px solid #e5e7eb; background:#f9fafb; color:#374151; font-size:12px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;">
                        <span class="material-symbols-rounded" style="font-size:18px;">upload_file</span> ইম্পোর্ট (JSON)
                    </button>
                    <button onclick="AIScholarService.exportConfig()" style="padding:10px; border-radius:12px; border:1.5px solid #e5e7eb; background:#f9fafb; color:#374151; font-size:12px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;">
                        <span class="material-symbols-rounded" style="font-size:18px;">download</span> এক্সপোর্ট (JSON)
                    </button>
                </div>

                <div style="display:flex;gap:12px;">
                    <button onclick="document.getElementById('aiKeyModal').remove()" style="flex:1;padding:14px;border-radius:12px;border:1.5px solid #e5e7eb;background:white;color:#6b7280;font-weight:700;cursor:pointer;">বাতিল</button>
                    <button onclick="AIScholarService.saveKeyFromUI()" style="flex:1;padding:14px;border-radius:12px;border:none;background:linear-gradient(135deg,#0A5438,#059669);color:white;font-weight:700;cursor:pointer;">সেভ করুন</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    function saveKeyFromUI() {
        const modelInput = document.getElementById('geminiModelInput');
        const keysListInput = document.getElementById('geminiKeysListInput');
        const orKeyInput = document.getElementById('openRouterKeyInput');

        if (modelInput && keysListInput && orKeyInput) {
            const model = modelInput.value.trim() || 'gemini-2.5-flash-lite';
            const keysRaw = keysListInput.value.trim();
            const orKey = orKeyInput.value.trim();

            const keysArray = keysRaw.split('\n')
                .map(k => k.trim())
                .filter(k => k.length > 5);

            saveUserModel(model);
            saveUserKeysList(keysArray);
            saveOpenRouterKey(orKey);

            if (keysArray.length > 0 || orKey.length > 0) {
                showToast('সেটিংস সফলভাবে সেভ হয়েছে! ✓');
                document.getElementById('aiKeyModal').remove();
            } else if (keysRaw === '' && orKey === '') {
                localStorage.removeItem(USER_GEMINI_KEY);
                localStorage.removeItem(USER_GEMINI_MODEL);
                localStorage.removeItem(USER_GEMINI_KEYS_LIST);
                localStorage.removeItem(USER_OPENROUTER_KEY);
                showToast('সেটিংস রিসেট করা হয়েছে');
                document.getElementById('aiKeyModal').remove();
            } else {
                showToast('সঠিক কি (Key) প্রদান করুন');
            }
        }
    }

    return {
        sendMessage,
        getHistory,
        saveHistory,
        clearHistory,
        saveUserKey,
        getUserKey,
        showView,
        closeView,
        sendFromUI,
        copyToClipboard,
        shareContent,
        getCacheSize,
        formatAnswer,
        copyAnswer,
        shareAnswer,
        showMenu,
        clearCache,
        askQuick,
        showKeyInput,
        saveKeyFromUI,
        exportConfig,
        importConfig,
        QUICK_QUESTIONS,
        THEME
    };

})();
