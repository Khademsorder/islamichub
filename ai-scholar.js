const AIScholarService = (() => {
    const DEFAULT_GEMINI_KEYS = [
        'AIzaSyDY-piqi2nOC-jh0q0V-XqdEycVZJFH38w', 'AIzaSyCeW9sWOcZyhV4CI1nRPh2G1W5DfWgS4Lk',
        'AIzaSyChQLS8hZ7AwCAiaK-MCfJ8Q2L87m59H3k', 'AIzaSyA3Cw7_9KXn832-Lq2tqsuY223WruDuf4s',
        'AIzaSyAoKBBYcnUNuppcFllz-g-5PNGD4mdWx6c', 'AIzaSyDvFANuMCN8TT0fnMmdLQ3xjeJVuhyz_r8',
        'AIzaSyDiRym0MivFJ7r-0H-ozL4p_ZhktA2x_J4', 'AIzaSyAvBa2byk4MdV5PpRH8maMdf1QszODjghQ',
        'AIzaSyAXe-AajKdGgm4WCCvBqiYyLKh_tdNSH5Y', 'AIzaSyDScRt4CCopvbmvCpv9DQ0fYD1wCghduHk',
        'AIzaSyBvaBottdBHjiReEXIcYu7BjDpDJDpanKA', 'AIzaSyA5I3VeU9uIQkWqb7iwEtU9e8zM35pr9j0',
        'AIzaSyALRHmzuJ-jO_Z9qHDIrq27OEgjSjGMYMw', 'AIzaSyDYaRWNJMjWKVAC9KvkvCnBMD9-UM6M2hc',
        'AIzaSyCzS7VIaXlFcnUzORhZsxRNXOtIelGSND4', 'AIzaSyAfY5HyALrJnPJg13jF-PAMlitkwswZ0_Q',
        'AIzaSyC5Sr3T1sCyq-lYL1KJOZxdvI43ijON_Bg', 'AIzaSyAJpW3ni-XhScWbu8A7ia9mK_APpbxB5Qg',
        'AIzaSyAF1kutfxrQp51jB8D-6nFy7NE754v6zYY', 'AIzaSyCEP5U4kGX6k2CiP6YPW-rT2z4dmMUkruk',
        'AIzaSyBHEW0BTJ_3Fsb2CmTAdYyEiJwZFIF9au0', 'AIzaSyDjVqe3eK3Zi3Wxr4_0jAG3Q-mjDZbMJm4',
        'AIzaSyCd4uNLzoKb855LKkyLVFysG7ARbjk2GLw', 'AIzaSyCMdl6PrZnz-WrLkLHldeAo0hWDmLhunbI',
        'AIzaSyB4D4t8G3dOAovKu1H6NxasqCl10SV0qAQ', 'AIzaSyDye2YKhlubLC5qk673fO1oR9JcmyLNWQY',
        'AIzaSyBkJULuyFkcIZm2VNtVIdrJnwswZ7TOhSo', 'AIzaSyCczn6U2g1_V1dCh3HpTcd4o7et8AN8dBU',
        'AIzaSyB01AY78Q-QELswFceInH4QXCAahcWWgRQ', 'AIzaSyBF_Me7hyGPrFx4zxmPTxYKRVthvn5WzkU',
        'AIzaSyCmQblrYpyHyTigs9Y1pXcyS7_kZn8Z8FU', 'AIzaSyCgy20dLWNFQHdEy2n9R-NQv4PokZR6ZVY',
        'AIzaSyDCC4uozEySlhLHxA3ZQyU9B9CRlfiNOD8', 'AIzaSyA59Gbk2Qu-ruIuy-UXQjGoddAPow_7ZLI',
        'AIzaSyBj94ubLWE6a3oTzwmDZ7TIJ6LDAdrW4qo', 'AIzaSyBesLNkJuVRk5ngBk0jn729Qty3ZKmNPjo',
        'AIzaSyCLwS0AKN8UC1mjJr6GJ5F5kRL6QO9c58g', 'AIzaSyDS5KWkDZoakSHbAEVV3JjnqcOxtdqNvLs',
        'AIzaSyAuOs_zpKbDysa7ThXxF86ejV1Mz8PhHKo', 'AIzaSyBRFr2dwYV-AT_-iF6YMUVireXeh-GYMFA',
        'AIzaSyBa19RL545bwFsTFyARAPpBtcRvEu1P_5o', 'AIzaSyDKH3zNRNEph7I9ez4Zp78HNB8qJjjDMv4',
        'AIzaSyCCB2S3pAV8hpeiDyMhAnyDxrQl5gjTNHE', 'AIzaSyDxdxHYI4EcK3SRLXMdrbon4HaAEAo0hFQ',
        'AIzaSyCzxdThXlHN314kx4VOMlY7OrLfBrZn7ps', 'AIzaSyC2uPNFRF8WevWZFXRcif8y2-2-gAtCyiQ',
        'AIzaSyCtaVpsQDhKwCw_anh1GtxWkpnBx1PrNmU', 'AIzaSyBobzKWPHIkaudIayB_pIheo5vd5dcI_Co',
        'AIzaSyDZIebPpdzkCsXDQTNvCPd-Rr4yT10pOhY', 'AIzaSyCZg5v7vHtNQTHp24maN-Wr_H4qaJqO8fI',
        'AIzaSyAnWffFLAdGMe-w5La_WcTVBtbfUwMzHbo', 'AIzaSyDcSA5lBnFu8sG6k-beulRhw7SeFK4lqyQ',
        'AIzaSyDYPNDsZWu8au6Yq9qtTkR_3nUmSFy7ZBI', 'AIzaSyAaxRE3_Amg2oFwIOZPSHL3tNwr7lRtdlc',
        'AIzaSyCQ5AyFHASLqhw-l9akOrTpuOj6itBQ0VU', 'AIzaSyCqcqxGqzBlmC6EgMQzf9nOtpHOW0-oM30',
        'AIzaSyCtAbPFKD_uKNPJn5eeMg3-ZXJ_EccZdow', 'AIzaSyB0PgW6Uw6090vCW5PdXQNN8XkZ1SLlAEE',
        'AIzaSyC6RZ4WuDR9ji4uB48_yYJW6hbjB7VWm00', 'AIzaSyDxUKl0NRe5AoR7AzOkJEtCM4TOVQxFFqY',
        'AIzaSyDrZGM42F3gHnI5HOz51-pr6Q3qh80x38U', 'AIzaSyCvyMU4Gp5BJkTVbyYc3RFWdOnD9e-5fWM',
        'AIzaSyCb604TCm9Itwtl6fJ3LtmTkKCFEIHZ0cU', 'AIzaSyAOOn2HUSp-SUIOoNHGTm7T9ItriuaB06A'
    ];

    const OPENROUTER_KEY = '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';
    const OPENROUTER_MODEL = 'google/gemma-3-27b-it:free';

    const SYSTEM_PROMPT = `You are a wise and compassionate Islamic Scholar. Provide authentic guidance from Quran and Sunnah.

**Response Format (STRICTLY FOLLOW):**

1. **Language:** Respond ONLY in Bengali script (বাংলা অক্ষর). NEVER use English letters for Bengali words (No "Banglish").
2. **Pronunciation:** If provided, pronunciation (উচ্চারণ) MUST be in Bengali script, never English.
3. **Start with a brief answer** (1-2 sentences)
4. **Use bullet points** for details:
   • Point 1
   • Point 2
   • Point 3
5. **Add sections with headers** when needed:
    📖 কুরআন থেকে: (Quran references)
    📚 হাদিস থেকে: (Hadith references)
    💡 গুরুত্ব: (Importance)
    ⚠️ সতর্কতা: (Warnings)
    ✅ উপায়: (Solutions)

Keep answers structured, premium, and easy to read. Respond as a flagship Islamic assistant.`;

    const CHAT_HISTORY_KEY = 'ai_chat_history';
    const RESPONSE_CACHE_KEY = 'ai_response_cache';
    const USER_GEMINI_KEY = 'user_gemini_api_key';

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
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

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

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://jubosongho.com',
                'X-Title': 'Islamic Hub Web',
            },
            body: JSON.stringify({
                'model': OPENROUTER_MODEL,
                'messages': [
                    { 'role': 'system', 'content': SYSTEM_PROMPT },
                    { 'role': 'user', 'content': message }
                ],
            }),
        });

        if (!response.ok) throw new Error(`OpenRouter API failed: ${response.status}`);

        const data = await response.json();
        return data.choices[0].message.content || 'দুঃখিত, কোনো উত্তর পাওয়া যায়নি।';
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
        if (userKey && userKey.length > 10) {
            try {
                responseText = await callGeminiApi(userKey, message, []);
                apiKeyUsed = 'User Key';
                success = true;
            } catch (e) { console.warn('User Gemini Key failed'); }
        }

        if (!success) {
            const _shuffledKeys = [...DEFAULT_GEMINI_KEYS].sort(() => 0.5 - Math.random());
            for (const key of _shuffledKeys) {
                try {
                    responseText = await callGeminiApi(key, message, []);
                    apiKeyUsed = 'Default Key';
                    success = true;
                    break;
                } catch (e) { console.warn('Default Key failed'); }
            }
        }

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
            { pattern: /📖\s*কুরআন থেকে:?/gi, color: '#059669', bg: '#d1fae5' },
            { pattern: /📚\s*হাদিস থেকে:?/gi, color: '#6d28d9', bg: '#ede9fe' },
            { pattern: /💡\s*গুরুত্ব:?/gi, color: '#d97706', bg: '#fef3c7' },
            { pattern: /⚠️\s*সতর্কতা:?/gi, color: '#dc2626', bg: '#fee2e2' },
            { pattern: /✅\s*উপায়:?/gi, color: '#0A5438', bg: '#d1fae5' },
            { pattern: /🎯\s*উপসংহার:?/gi, color: '#0A5438', bg: '#d1fae5' }
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
                <button onclick="AIScholarService.clearHistory();AIScholarService.showView();" style="display:flex;align-items:center;gap:12px;width:100%;padding:14px 18px;border:none;background:transparent;cursor:pointer;color:#374151;font-size:14px;text-align:left;font-weight:500;">
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
        QUICK_QUESTIONS,
        THEME
    };
})();
