const TajbeedCheckerService = (() => {
    // ════════════════════════════════════════════════════════
    // ISLAMIC HUB - ULTIMATE VOICE AI v7.9 (PREMIUM FINAL)
    // ════════════════════════════════════════════════════════

    // Keys are now managed via secrets.js or window.APP_SECRETS
    const DEFAULT_GEMINI_KEYS = (window.APP_SECRETS && window.APP_SECRETS.GEMINI_KEYS) || [];

    const MODEL = 'gemini-2.5-flash-lite'; // STRICTLY this model

    const THEME = {
        bg: '#05140C',
        primary: '#0D5C3A',
        light: '#1A8A56',
        gold: '#C49A2B',
        goldLight: '#F0C040',
        red: '#B44343',
        purple: '#7C3AED',
        blue: '#2563EB',
        glassWhite: 'rgba(255, 255, 255, 0.15)',
        glassBorder: 'rgba(255, 255, 255, 0.25)',
        textSoft: '#A8D5B5'
    };

    const SYSTEM_PROMPT = `You are Islamic Knowledge AI Engine v8.3. Analyze audio with 100% fidelity.

CORE RULES (STRICT):
1. NEUTRAL TRANSCRIPTION: Provide a "transcription" field that transcribes EXACTLY every word said.
2. DEEP SEGMENTATION: Break the neutral transcription into logical cards. If a user says a Song, then a Bangla Meaning, then an Ayah—you MUST return ALL as separate objects.
3. SOURCE MAPPING: If the user speaks a Bangla Translation/Meaning of a Quran/Hadith/Dua, you MUST find the original Arabic, Ayah/Hadith number, and Book (Bukhari/Muslim/etc).
4. SPECIFIC IDENTIFICATION: Identify specific titles for Songs (e.g., "রবীন্দ্রসংগীত: আমার পরাণ যাহা চায়") or Jokes.
5. RELIGIOUS FIDELITY: 
   - HADITHS: Must include Arabic text, "হাদিস নং [সংখ্যা]", "উৎস: [গ্রন্থের নাম]", "গ্রেড: [সহিহ/হাসান/দঈফ/জাল]", and "AI স্কোর: [১-১০]".
   - QURAN: Surah Name, Ayah No, Arabic, Meaning, and 3-4 line Shane-Nuzul.
   - DUAS: "নাম", "আরবি", "অর্থ", and "ব্যাখ্যা" (ফজিলত, নিয়ম ও উৎস থাকতে হবে)।
6. STRICT NO-ENGLISH: Every description and explanation MUST be in BANGLA.
7. SUMMARY: Return a detailed summary (e.g., "১টি গান, ১টি হাদিসের অর্থ ও ২টি আয়াত শনাক্ত হয়েছে")।

RESPONSE FORMAT (JSON only):
{
  "summary": "Full summary of all detected segments",
  "transcription": "Neutral word-for-word string",
  "qurans": [
    {
      "surahNameBn": "সুরা...", "ayahNumber": "", "arabic": "Arabic text", "pronunciationBn": "Bangla script Arabic",
      "meaning": "Bangla meaning", "accuracy": 0-100, "explanation": "3-4 lines Shane-Nuzul/Context"
    }
  ],
  "hadiths": [
    {
       "arabic": "Arabic", "pronunciationBn": "Bangla script Arabic", 
       "meaning": "Bangla meaning", "source": "বুখারি/মুসলিম, হাদিস নং ১৫", "grade": "সহিহ", 
       "aiScore": 1-10, "explanation": "3-4 lines context/importance"
    }
  ],
  "duas": [
    { 
      "name": "দোয়ার নাম", "arabic": "Arabic", "pronunciationBn": "Bangla script Arabic", 
      "meaning": "Bangla meaning", "explanation": "ফজিলত, নিয়ম ও উৎস (৩-৪ লাইন)", "aiScore": 1-10 
    }
  ],
  "generals": [
    { "type": "Specific Song/Joke Name", "response": "Friendly Bangla Response", "note": "এটি কুরআন বা হাদিস নয়" }
  ]
}`;

    // State
    let mediaRecorder = null;
    let audioChunks = [];
    let isRecording = false;
    let audioStream = null;
    let currentAudioBlob = null;
    let recordingStartTime = null;
    let timerInterval = null;
    const RECORDING_LIMIT_SEC = 30;

    function audioToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    async function callAPI(base64Audio, mimeType) {
        const userKey = localStorage.getItem('user_gemini_api_key');
        const userKeysList = JSON.parse(localStorage.getItem('user_gemini_keys_list') || '[]');
        const userModel = localStorage.getItem('user_gemini_model') || MODEL;

        const allKeys = [];
        if (userKey) allKeys.push(userKey);
        userKeysList.forEach(k => { if (!allKeys.includes(k)) allKeys.push(k); });

        // Shuffle and add system keys
        const shuffledSystem = [...DEFAULT_GEMINI_KEYS].sort(() => 0.5 - Math.random());
        shuffledSystem.forEach(k => { if (!allKeys.includes(k)) allKeys.push(k); });

        for (const key of allKeys) {
            try {
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${userModel}:generateContent?key=${key}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                { text: SYSTEM_PROMPT },
                                { inlineData: { mimeType, data: base64Audio } }
                            ]
                        }],
                        generationConfig: { temperature: 0.1, maxOutputTokens: 6000, responseMimeType: 'application/json' }
                    })
                });
                if (!res.ok) continue;
                const data = await res.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!text) continue;
                return JSON.parse(text);
            } catch (e) { console.warn('[VoiceAI] API error:', e.message); }
        }
        throw new Error('সব AI সার্ভিস ব্যস্ত। অনুগ্রহ করে আপনার নিজস্ব API কী দিন।');
    }

    function init() {
        const existing = document.getElementById('voiceAIModal');
        if (existing) existing.remove();
        renderMainModal();
    }

    function renderMainModal() {
        const modal = document.createElement('div');
        modal.id = 'voiceAIModal';
        // FIXED: Whitish-Glass theme for better backdrop photo visibility
        modal.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999;display:flex;flex-direction:column;background:#05140C url('img/voice-ai-bg.png') no-repeat center center;background-size:cover;overflow-y:auto;font-family:'Noto Sans Bengali','Segoe UI',sans-serif;box-sizing:border-box;`;

        const glassOverlay = document.createElement('div');
        glassOverlay.style.cssText = `position:fixed;inset:0;background:rgba(255,255,255,0.15);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);z-index:-1;`;
        modal.appendChild(glassOverlay);

        const darkMask = document.createElement('div'); // Keeping base readable
        darkMask.style.cssText = `position:fixed;inset:0;background:rgba(0, 0, 0, 0.6);z-index:-2;`;
        modal.appendChild(darkMask);

        modal.innerHTML += `
        <div style="padding:max(15px,env(safe-area-inset-top)) 20px 15px;display:flex;align-items:center;gap:12px;border-bottom:1px solid rgba(255,255,255,0.1);position:relative;z-index:1;">
            <button id="voiceAIBack" style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
                <span class="material-symbols-rounded" style="color:white;font-size:22px;">arrow_back</span>
            </button>
            <div style="flex:1;">
                <h1 style="margin:0;font-size:17px;color:white;font-weight:900;letter-spacing:0.5px;">ভয়েস AI v8.1 Premium</h1>
                <p style="margin:2px 0 0;font-size:11px;color:${THEME.textSoft};font-weight:700;">উন্নত ইউজার ইন্টারফেস</p>
            </div>
        </div>

        <div style="padding:20px 16px;flex:1;position:relative;z-index:1;" id="voiceAIContent">
            <div id="voiceAI_intro" style="text-align:center;padding:50px 10px;">
                <div style="width:130px;height:130px;background:linear-gradient(135deg,${THEME.primary},${THEME.light});border-radius:50%;margin:0 auto 30px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 50px rgba(26,138,86,0.5);position:relative;">
                    <div style="position:absolute;inset:-8px;border:2px solid ${THEME.light}44;border-radius:50%;animation:vaiSpin 8s linear infinite;"></div>
                    <span class="material-symbols-rounded" style="color:white;font-size:56px;">auto_awesome</span>
                </div>
                <h2 style="color:white;font-weight:900;font-size:24px;margin-bottom:14px;">কি খুঁজেছেন?</h2>
                <p style="color:${THEME.textSoft};font-size:15px;line-height:1.8;padding:0 15px;">বাংলায় অর্থ বা আরবি তে তিলাওয়াত করুন—AI সুরা, হাদিস ও দোয়া শনাক্ত করে ফলাফল দিবে।</p>
            </div>

            <div id="voiceAI_recording" style="display:none;text-align:center;padding:40px 0;">
                <div style="width:160px;height:160px;background:linear-gradient(135deg,${THEME.red},#7F0000);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;position:relative;box-shadow:0 0 60px ${THEME.red}44;">
                    <div style="position:absolute;inset:-15px;border-radius:50%;border:2.5px solid ${THEME.red};animation:vaiPulse 1.5s infinite;"></div>
                    <span class="material-symbols-rounded" style="color:white;font-size:64px;">settings_voice</span>
                </div>
                <div id="voiceAITimer" style="font-size:56px;font-weight:900;color:white;font-variant-numeric:tabular-nums;text-shadow:0 10px 20px rgba(0,0,0,0.5);">0:00</div>
                <div style="color:${THEME.red};font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:1px;margin-top:10px;">Max Limit: 0:30</div>
            </div>

            <div id="voiceAI_review" style="display:none;padding:20px 0;">
                <audio id="voiceAIPreview" controls style="width:100%;margin-bottom:20px;border-radius:12px;"></audio>
                <div style="display:flex;gap:12px;padding:10px 0;">
                    <button onclick="TajbeedCheckerService.reRecord()" style="flex:1;padding:18px;background:rgba(255,255,255,0.08);border-radius:20px;color:white;font-weight:700;border:1px solid rgba(255,255,255,0.1);backdrop-filter:blur(10px);">নতুন রেকর্ড</button>
                    <button id="voiceAISubmitBtn" onclick="TajbeedCheckerService.submitAudio()" style="flex:2;padding:18px;background:linear-gradient(135deg,${THEME.primary},${THEME.light});border-radius:20px;color:white;font-weight:900;border:none;box-shadow:0 8px 16px rgba(13,92,58,0.3);">AI কে পাঠান</button>
                </div>
            </div>

            <div id="voiceAI_analyzing" style="display:none;text-align:center;padding:60px 0;">
                <div class="vai-loader"></div>
                <h3 style="color:white;font-size:22px;margin-top:24px;">AI স্ক্যান করছে...</h3>
                <p style="color:${THEME.textSoft};font-size:14px;margin-top:10px;">উৎস শনাক্ত করতে ৫-১০ সেকেন্ড সময় লাগতে পারে</p>
            </div>

            <div id="voiceAI_result" style="display:none;padding-bottom:140px;"></div>
        </div>

        <div id="voiceAIControls" style="position:fixed;bottom:25px;left:0;width:100%;display:flex;justify-content:center;z-index:100;pointer-events:none;">
            <div class="vai-floating-bar">
                <button id="voiceAICancelBtn" onclick="TajbeedCheckerService.close()" class="vai-circle-btn small" style="background:#444;" title="Cancel">
                    <span class="material-symbols-rounded">close</span>
                </button>
                <button id="voiceAIRecordBtn" onclick="TajbeedCheckerService.startRecording()" class="vai-circle-btn main">
                    <span class="material-symbols-rounded">mic</span>
                </button>
                <button id="voiceAIStopBtn" onclick="TajbeedCheckerService.stopRecording()" class="vai-circle-btn stop" style="display:none;">
                    <span class="material-symbols-rounded">stop_circle</span>
                </button>
                <button id="voiceAITrashBtn" onclick="TajbeedCheckerService.reRecord()" class="vai-circle-btn small" style="background:#555;" title="Clear">
                    <span class="material-symbols-rounded">delete</span>
                </button>
            </div>
        </div>

        <style>
            @keyframes vaiPulse { 0%{transform:scale(1);opacity:.7} 100%{transform:scale(1.4);opacity:0} }
            @keyframes vaiSpin { to{transform:rotate(360deg)} }
            .vai-loader { width:64px; height:64px; border:4px solid rgba(255,255,255,0.1); border-top-color:${THEME.gold}; border-radius:50%; animation:vaiSpin 0.8s linear infinite; margin:0 auto; box-shadow:0 0 20px rgba(196,154,43,0.3); }
            .vai-floating-bar { padding:10px 18px; background:rgba(255,255,255,0.15); backdrop-filter:blur(40px); border-radius:100px; display:flex; align-items:center; gap:20px; box-shadow:0 15px 40px rgba(0,0,0,0.5); pointer-events:auto; border:1px solid rgba(255,255,255,0.2); }
            .vai-circle-btn { width:48px; height:48px; border-radius:50%; border:none; display:flex; align-items:center; justify-content:center; color:white; cursor:pointer; transition:0.3s cubic-bezier(0.4, 0, 0.2, 1); }
            .vai-circle-btn.main { width:68px; height:68px; background:linear-gradient(135deg,${THEME.primary},${THEME.light}); box-shadow:0 8px 20px rgba(26,138,86,0.4); }
            .vai-circle-btn.stop { width:68px; height:68px; background:linear-gradient(135deg,${THEME.red},#7F0000); }
            .vai-circle-btn.small { color:rgba(255,255,255,0.8); }
            .vai-circle-btn:active { transform:scale(0.85); opacity:0.8; }
            .vai-card { animation: vaiSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; margin-bottom:18px; border-radius:28px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.2); backdrop-filter:blur(30px); overflow:hidden; box-shadow:0 15px 35px rgba(0,0,0,0.2); }
            @keyframes vaiSlideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
            .copy-pill { padding:8px 16px; background:rgba(255,255,255,0.15); border:none; border-radius:50px; color:white; font-size:12px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:8px; transition:0.2s; border:1px solid rgba(255,255,255,0.1); }
            .copy-pill:active { transform:scale(0.9); background:${THEME.gold}; }
            .badge-pvt { background:rgba(255,255,255,0.12); padding:5px 12px; border-radius:50px; font-size:11px; font-weight:800; color:white; display:flex; align-items:center; gap:5px; border:1px solid rgba(255,255,255,0.1); }
            .coverage-pill { background:${THEME.primary}44; color:white; padding:4px 10px; border-radius:50px; font-size:10px; font-weight:900; border:1px solid ${THEME.primary}66; }
        </style>`;

        document.body.appendChild(modal);
        document.getElementById('voiceAIBack').addEventListener('click', close);
    }

    function showSection(name) {
        ['intro', 'recording', 'review', 'analyzing', 'result'].forEach(s => {
            const el = document.getElementById(`voiceAI_${s}`);
            if (el) el.style.display = (s === name) ? 'block' : 'none';
        });
        const bar = document.querySelector('.vai-floating-bar');
        if (bar) bar.style.display = (name === 'intro' || name === 'recording') ? 'flex' : 'none';
    }

    async function startRecording() {
        try {
            if (typeof PermissionService !== 'undefined' && PermissionService.requestMicrophonePermission) {
                const ok = await PermissionService.requestMicrophonePermission();
                if (!ok) { showToast('মাইক্রোফোন অনুমতি প্রয়োজন'); return; }
            }
            audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(audioStream);
            audioChunks = [];
            mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
            mediaRecorder.onstop = () => {
                currentAudioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
                document.getElementById('voiceAIPreview').src = URL.createObjectURL(currentAudioBlob);
                showSection('review');
            };
            mediaRecorder.start();
            isRecording = true;
            recordingStartTime = Date.now();
            showSection('recording');
            document.getElementById('voiceAIRecordBtn').style.display = 'none';
            document.getElementById('voiceAIStopBtn').style.display = 'flex';

            timerInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
                document.getElementById('voiceAITimer').textContent = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`;

                // FIXED: 30-Second Limit
                if (elapsed >= RECORDING_LIMIT_SEC) {
                    stopRecording();
                    showToast('রেকর্ডিং সময় শেষ (৩০ সেকেন্ড)');
                }
            }, 100);
        } catch (e) { showToast('মাইক্রোফোন চালু করতে সমস্যা হয়েছে'); }
    }

    function stopRecording() {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            isRecording = false;
            clearInterval(timerInterval);
            document.getElementById('voiceAIRecordBtn').style.display = 'flex';
            document.getElementById('voiceAIStopBtn').style.display = 'none';
            if (audioStream) audioStream.getTracks().forEach(t => t.stop());
        }
    }

    async function submitAudio() {
        // FIXED: Stop preview on submit
        const preview = document.getElementById('voiceAIPreview');
        if (preview) { preview.pause(); preview.currentTime = 0; }

        const btn = document.getElementById('voiceAISubmitBtn');
        btn.disabled = true; btn.innerHTML = 'AI প্রসেস করছে...';
        showSection('analyzing');
        try {
            const b64 = await audioToBase64(currentAudioBlob);
            const res = await callAPI(b64, currentAudioBlob.type);
            renderResult(res);
        } catch (e) { renderError(e.message); }
        finally { btn.disabled = false; btn.innerHTML = 'AI কে পাঠান'; }
    }

    function renderResult(r) {
        showSection('result');
        const container = document.getElementById('voiceAI_result');
        let html = '';

        // Premium Conclusion Summary Header
        const totalCards = (r.qurans?.length || 0) + (r.hadiths?.length || 0) + (r.duas?.length || 0) + (r.generals?.length || 0);

        html += `<div style="background:rgba(255,255,255,0.12);padding:26px;border-radius:32px;border:1px solid rgba(255,255,255,0.2);margin-bottom:25px;text-align:center;backdrop-filter:blur(50px);box-shadow:0 20px 40px rgba(0,0,0,0.3);">
            <div style="display:inline-flex;align-items:center;gap:8px;background:${THEME.gold}33;padding:6px 16px;border-radius:50px;margin-bottom:15px;border:1px solid ${THEME.gold}66;">
                <span class="material-symbols-rounded" style="color:${THEME.goldLight};font-size:18px;">analytics</span>
                <span style="color:white;font-weight:900;font-size:12px;text-transform:uppercase;">বিশ্লেষণ সম্পন্ন</span>
            </div>
            <div style="color:white;font-size:18px;font-weight:900;line-height:1.4;margin-bottom:12px;">${r.summary || 'উৎস শনাক্ত করা হয়েছে'}</div>
            <div style="display:flex;justify-content:center;gap:10px;margin-top:15px;flex-wrap:wrap;">
               ${(r.generals || []).length > 0 ? `<span class="coverage-pill" style="background:${THEME.primary}66;">💬 ${(r.generals || []).length}টি কথোপকথন</span>` : ''}
               ${(r.qurans || []).length > 0 ? `<span class="coverage-pill" style="background:${THEME.primary}66;">📖 ${(r.qurans || []).length}টি সুরা</span>` : ''}
               ${(r.hadiths || []).length > 0 ? `<span class="coverage-pill" style="background:${THEME.primary}66;">📜 ${(r.hadiths || []).length}টি হাদিস</span>` : ''}
               ${(r.duas || []).length > 0 ? `<span class="coverage-pill" style="background:${THEME.primary}66;">🤲 ${(r.duas || []).length}টি দোয়া</span>` : ''}
            </div>
        </div>`;

        if (r.transcription) {
            html += `<div class="vai-card" style="padding:24px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                    <div class="badge-pvt"><span class="material-symbols-rounded" style="font-size:14px;">record_voice_over</span>মূল ট্রান্সক্রিপশন</div>
                    <button class="copy-pill" onclick="TajbeedCheckerService.copyText('${r.transcription.replace(/'/g, "\\'")}')"><span class="material-symbols-rounded" style="font-size:16px;">content_copy</span></button>
                </div>
                <div style="color:white;font-size:16px;line-height:1.8;padding-left:12px;border-left:3px solid ${THEME.gold};font-weight:500;">"${r.transcription}"</div>
            </div>`;
        }

        (r.generals || []).forEach(g => {
            html += `<div class="vai-card" style="padding:24px;border:1px solid rgba(255,255,255,0.25);">
                <div style="position:absolute;top:0;right:0;background:rgba(255,255,255,0.15);padding:6px 14px;border-bottom-left-radius:18px;font-size:11px;color:white;font-weight:900;backdrop-filter:blur(10px);">${g.note}</div>
                <div style="color:${THEME.textSoft};font-size:12px;margin-bottom:12px;font-weight:900;text-transform:uppercase;letter-spacing:1px;display:flex;align-items:center;gap:6px;">
                    <span class="material-symbols-rounded" style="font-size:16px;">chat_bubble</span> শনাক্ত কথোপকথন: ${g.type}
                </div>
                <div style="color:white;font-size:16px;line-height:1.8;font-weight:700;">${g.response}</div>
            </div>`;
        });

        (r.qurans || []).forEach(q => {
            const copyContent = `সুরা: ${q.surahNameBn} (আয়াত ${q.ayahNumber})\nআরবি: ${q.arabic}\nঅর্থ: ${q.meaning}`;
            html += `<div class="vai-card">
                <div style="background:${THEME.primary}33;padding:28px 24px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.05);">
                    <div style="color:${THEME.goldLight};font-family:'Amiri',serif;font-size:34px;direction:rtl;margin-bottom:15px;line-height:1.5;">${q.arabic}</div>
                    <div style="color:${THEME.textSoft};font-size:13.5px;margin-bottom:12px;font-weight:700;">[ ${q.pronunciationBn} ]</div>
                    <div style="color:white;font-weight:900;font-size:19px;">${q.surahNameBn} (${q.ayahNumber})</div>
                </div>
                <div style="padding:22px;">
                    <div style="color:white;font-size:16px;line-height:1.8;margin-bottom:15px;">অর্থ: ${q.meaning}</div>
                    <div style="background:rgba(255,255,255,0.06);padding:16px;border-radius:20px;border:1px solid rgba(255,255,255,0.1);">
                       <div style="font-size:11px;font-weight:900;color:${THEME.goldLight};margin-bottom:8px;text-transform:uppercase;">ব্যাখ্যা ও শান-এ-নুজুল</div>
                       <div style="color:white;opacity:0.85;font-size:13.5px;line-height:1.8;">${q.explanation}</div>
                    </div>
                    <div style="display:flex;justify-content:flex-end;margin-top:20px;">
                        <button class="copy-pill" onclick="TajbeedCheckerService.copyText('${copyContent.replace(/'/g, "\\'").replace(/\n/g, "\\n")}')"><span class="material-symbols-rounded">content_copy</span>কপি করুন</button>
                    </div>
                </div>
            </div>`;
        });

        (r.hadiths || []).forEach(h => {
            const copyContent = `হাদিস: ${h.source}\nআরবি: ${h.arabic}\nঅর্থ: ${h.meaning}`;
            const gradeColor = h.grade?.includes('সহিহ') ? '#4ade80' : h.grade?.includes('দঈফ') ? '#fbbf24' : '#f87171';
            html += `<div class="vai-card" style="border-top:5px solid ${THEME.purple}aa;">
                <div style="padding:24px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:18px;align-items:center;">
                        <span class="coverage-pill" style="background:${THEME.purple}33;border-color:${THEME.purple}66;">📜 হাদিস শনাক্ত</span>
                        <div style="background:${gradeColor}22;color:${gradeColor};padding:5px 14px;border-radius:50px;font-size:11px;font-weight:900;border:1px solid ${gradeColor}55;">${h.grade}</div>
                    </div>
                    <div style="color:white;font-family:'Amiri',serif;font-size:26px;direction:rtl;margin-bottom:15px;text-align:center;line-height:1.6;">${h.arabic}</div>
                    <div style="color:${THEME.textSoft};font-size:13px;margin-bottom:15px;text-align:center;font-weight:700;">[ ${h.pronunciationBn} ]</div>
                    <div style="color:white;font-size:15.5px;line-height:1.8;margin-bottom:15px;">অর্থ: ${h.meaning}</div>
                    <div style="background:rgba(255,255,255,0.05);padding:16px;border-radius:20px;margin-bottom:15px;">
                       <div style="color:white;opacity:0.85;font-size:13.5px;line-height:1.8;">${h.explanation}</div>
                       <div style="font-size:11px;color:${THEME.purple};font-weight:900;margin-top:10px;text-transform:uppercase;">উৎস: ${h.source} | AI স্কোর: ${h.aiScore}/10</div>
                    </div>
                    <div style="display:flex;justify-content:flex-end;">
                        <button class="copy-pill" onclick="TajbeedCheckerService.copyText('${copyContent.replace(/'/g, "\\'").replace(/\n/g, "\\n")}')"><span class="material-symbols-rounded">content_copy</span>কপি করুন</button>
                    </div>
                </div>
            </div>`;
        });

        (r.duas || []).forEach(d => {
            const copyContent = `দোয়া: ${d.name}\n${d.arabic}\nঅর্থ: ${d.meaning}`;
            html += `<div class="vai-card" style="border-top:5px solid ${THEME.blue}aa;">
                <div style="padding:24px;">
                    <div style="color:${THEME.blue};font-weight:900;font-size:17px;margin-bottom:15px;display:flex;align-items:center;gap:8px;">
                       <span class="material-symbols-rounded">front_hand</span> ${d.name}
                    </div>
                    <div style="color:white;font-family:'Amiri',serif;font-size:28px;direction:rtl;margin-bottom:15px;text-align:center;line-height:1.5;">${d.arabic}</div>
                    <div style="color:white;font-size:15.5px;line-height:1.8;margin-bottom:15px;">অর্থ: ${d.meaning}</div>
                    <div style="background:rgba(37,99,235,0.1);padding:16px;border-radius:20px;border-left:4px solid ${THEME.blue};">
                       <div style="font-size:10px;font-weight:900;text-transform:uppercase;color:${THEME.blue};margin-bottom:8px;">ফজিলত ও গুরুত্ব</div>
                       <div style="color:white;opacity:0.85;font-size:13.5px;line-height:1.8;">${d.explanation}</div>
                    </div>
                    <div style="display:flex;justify-content:flex-end;margin-top:20px;">
                        <button class="copy-pill" onclick="TajbeedCheckerService.copyText('${copyContent.replace(/'/g, "\\'").replace(/\n/g, "\\n")}')"><span class="material-symbols-rounded">content_copy</span>কপি করুন</button>
                    </div>
                </div>
            </div>`;
        });

        html += `<div style="padding:20px 0;"><button onclick="TajbeedCheckerService.reRecord()" style="width:100%;padding:18px;background:linear-gradient(135deg,${THEME.primary},${THEME.light});border-radius:24px;color:white;font-weight:900;border:none;box-shadow:0 8px 24px rgba(13,92,58,0.4);">নতুন রেকর্ড শুরু করুন</button></div>`;
        container.innerHTML = html;
        container.scrollTo(0, 0);
    }

    function reRecord() {
        showSection('intro');
        const btn = document.getElementById('voiceAISubmitBtn');
        if (btn) { btn.disabled = false; btn.innerHTML = 'AI কে পাঠান'; }
    }

    function renderError(e) {
        showSection('result');
        document.getElementById('voiceAI_result').innerHTML = `<div style="padding:40px 20px;text-align:center;color:white;background:rgba(180,67,67,0.1);border-radius:28px;border:1px solid rgba(180,67,67,0.2);backdrop-filter:blur(20px);"><span class="material-symbols-rounded" style="font-size:52px;color:${THEME.red};display:block;margin-bottom:18px;">error_outline</span><div style="font-size:16px;font-weight:700;line-height:1.6;">${e}</div></div>
        <button onclick="TajbeedCheckerService.reRecord()" style="width:100%;padding:18px;background:${THEME.red};color:white;border-radius:22px;margin-top:20px;border:none;font-weight:900;">পুনরায় চেষ্টা</button>`;
    }

    function close() { document.getElementById('voiceAIModal').remove(); if (audioStream) audioStream.getTracks().forEach(t => t.stop()); }

    function showToast(msg) {
        const t = document.createElement('div');
        t.style.cssText = `position:fixed;bottom:110px;left:50%;transform:translateX(-50%);background:${THEME.primary};color:white;padding:14px 28px;border-radius:50px;z-index:999999999;font-size:14px;font-weight:800;font-family:'Noto Sans Bengali',sans-serif;box-shadow:0 10px 30px rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.15);animation:vaiSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);`;
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.4s'; setTimeout(() => t.remove(), 400); }, 2500);
    }

    function copyText(text) {
        navigator.clipboard.writeText(text).then(() => showToast('📋 কপি করা হয়েছে!'));
    }

    return { init, startRecording, stopRecording, reRecord, submitAudio, close, copyText };
})();
