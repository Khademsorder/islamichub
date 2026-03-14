const VisionService = (() => {
    // ════════════════════════════════════════════════════════════════
    // ISLAMIC HUB - VISION SCANNER (CAMERA + UPLOAD)
    // AI-Powered Image Analysis with JSON Output (gemini-2.5-flash-lite)
    // ════════════════════════════════════════════════════════════════

    // Keys are now managed via secrets.js or window.APP_SECRETS
    const DEFAULT_GEMINI_KEYS = (window.APP_SECRETS && window.APP_SECRETS.GEMINI_KEYS) || [];

    const USER_GEMINI_KEY = 'user_gemini_api_key';
    const VISION_MODEL = 'gemini-2.5-flash-lite';

    const THEME = {
        primary: '#0A5438',
        primaryLight: '#2D6A4F',
        accent: '#40916C',
        softBg: '#E9F5E9',
        cardBg: '#FFFFFF',
        textDark: '#1F2E1F',
        textSoft: '#2D3E2D',
        gold: '#C49A2B',
        red: '#B44343'
    };

    const ICONS = {
        upload: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="white"/></svg>`,
        camera: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 8C9.79 8 8 9.79 8 12C8 14.21 9.79 16 12 16C14.21 16 16 14.21 16 12C16 9.79 14.21 8 12 8ZM20 5H16.83L15 3H9L7.17 5H4C2.9 5 2 5.9 2 7V17C2 18.1 2.9 19 4 19H20C21.1 19 22 18.1 22 17V7C22 5.9 21.1 5 20 5ZM12 18C8.68 18 6 15.31 6 12C6 8.69 8.68 6 12 6C15.32 6 18 8.69 18 12C18 15.31 15.32 18 12 18Z" fill="white"/></svg>`,
        close: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="white"/></svg>`,
        refresh: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" fill="white"/></svg>`,
        imageSearch: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 16V14H16V16H14V18H16V20H18V18H20V16H18ZM9 5C6.79 5 5 6.79 5 9C5 11.21 6.79 13 9 13C11.21 13 13 11.21 13 9C13 6.79 11.21 5 9 5ZM9 11C7.9 11 7 10.1 7 9C7 7.9 7.9 7 9 7C10.1 7 11 7.9 11 9C11 10.1 10.1 11 9 11ZM21 3H3V21H14V19H5V7H19V14H21V3Z" fill="white"/></svg>`,
        check: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="white"/></svg>`,
        translate: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.87 15.07L10.33 12.56L10.36 12.53C12.1 10.59 13.34 8.36 14.07 6H17V4H10V2H8V4H1V6H12.17C11.5 7.92 10.44 9.75 9 11.35C8.07 10.32 7.3 9.19 6.69 8H4.69C5.42 9.63 6.42 11.17 7.67 12.56L2.58 17.58L4 19L9 14L12.11 17.11L12.87 15.07ZM18.5 10H16.5L12 22H14L15.12 19H19.87L21 22H23L18.5 10ZM15.88 17L17.5 12.67L19.12 17H15.88Z" fill="white"/></svg>`,
        copy: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="white"/></svg>`,
        info: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z" fill="white"/></svg>`
    };

    const VISION_PROMPT = `You are an expert Islamic Scholar, Arabic Linguist, and OCR specialist.

Analyze the provided image and return a **valid JSON object** with the following fields. Be extremely precise and detailed. All textual responses must be in Bengali unless specified otherwise.

**Fields:**
- arabicText: string – Extract ALL Arabic/Quranic text from the image. Include diacritics (tashkeel) if visible. If no Arabic text, set to "".
- bengaliPronunciation: string – Provide the Bengali script pronunciation (উচ্চারণ) of the extracted Arabic text, word by word if possible. If no text, set to "".
- bengaliMeaning: string – Provide a clear Bengali translation/meaning of the text. If no text, set to "".
- englishMeaning: string – Provide an English translation for reference. If no text, set to "".
- identification: string – Describe what is in the image **in Bengali**. Examples:
    * "এটি পবিত্র কুরআনের সূরা আল-ফাতিহার প্রথম আয়াত।"
    * "এটি একটি হাদিস, যা ইমাম বুখারী বর্ণনা করেছেন।"
    * "এটি একটি দোয়া বা ইসলামিক উক্তি।"
    * "এই ছবিতে কোনো আরবি বা ইসলামিক টেক্সট নেই। এটি একটি প্রাকৃতিক দৃশ্য।"
- sourceInfo: object – If the text is Quranic, include:
    - surahNumber: number (1-114) or null
    - surahNameArabic: string or null
    - surahNameBengali: string or null
    - ayahRange: string (e.g., "১" or "১-৩") or null
  If Hadith, include:
    - hadithSource: string (e.g., "বুখারী", "মুসলিম") or null
    - hadithReference: string (e.g., "হাদিস নং ১২৩") or null
  Otherwise, set sourceInfo to null.
- confidence: string – "High", "Medium", or "Low" based on image clarity and text readability.
- additionalComments: string – Any other observations in Bengali (e.g., ছবির মান ভালো নয়, লেখা অস্পষ্ট, ইত্যাদি).

**Rules:**
- If the image contains no Arabic/Islamic text, set arabicText to "", identification to a Bengali description of the image, and all meaning fields to "".
- If the image is of poor quality or text is illegible, set confidence to "Low" and explain in additionalComments.
- Be honest: if you are unsure about surah/ayah numbers, leave sourceInfo fields as null.
- Do not include any text outside the JSON object.`;

    async function callGeminiVisionApi(apiKey, base64Image) {
        const userModel = localStorage.getItem('user_gemini_model') || VISION_MODEL;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${userModel}:generateContent?key=${apiKey}`;

        const body = {
            contents: [
                {
                    parts: [
                        { text: VISION_PROMPT },
                        { inlineData: { mimeType: "image/jpeg", data: base64Image } }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.2,
                responseMimeType: "application/json",
                maxOutputTokens: 4096
            },
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
            ]
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API failed (${response.status})`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('No response content');

        try {
            return JSON.parse(text);
        } catch (e) {
            throw new Error('Invalid JSON response');
        }
    }

    async function scanImage(base64Image) {
        let result = null;
        let success = false;
        let lastError = '';

        const userKey = localStorage.getItem(USER_GEMINI_KEY);
        let userKeysList = [];
        try {
            const stored = localStorage.getItem('user_gemini_keys_list');
            if (stored) {
                const parsed = JSON.parse(stored);
                userKeysList = Array.isArray(parsed) ? parsed : [parsed];
            }
        } catch (e) {
            const raw = localStorage.getItem('user_gemini_keys_list');
            if (raw && raw.trim().startsWith('AIza')) userKeysList = [raw.trim()];
        }


        const allKeys = [];
        if (userKey) allKeys.push(userKey);
        userKeysList.forEach(k => { if (!allKeys.includes(k)) allKeys.push(k); });

        // Shuffle and add system keys
        const shuffledSystem = [...DEFAULT_GEMINI_KEYS].sort(() => 0.5 - Math.random());
        shuffledSystem.forEach(k => { if (!allKeys.includes(k)) allKeys.push(k); });

        for (const key of allKeys) {
            try {
                result = await callGeminiVisionApi(key, base64Image);
                if (result) {
                    success = true;
                    break;
                }
            } catch (e) {
                lastError = e.message;
            }
        }

        if (!success) {
            return {
                arabicText: '',
                bengaliPronunciation: '',
                bengaliMeaning: '',
                englishMeaning: '',
                identification: 'সব AI সার্ভিস ব্যস্ত। অনুগ্রহ করে আপনার নিজস্ব API কী দিন।',
                sourceInfo: null,
                confidence: 'Low',
                additionalComments: 'ত্রুটি: ' + lastError,
                success: false
            };
        }

        return { ...result, success: true };
    }

    function initScanner() {
        const existingModal = document.getElementById('visionScannerModal');
        if (existingModal) {
            existingModal.style.display = 'flex';
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'visionScannerModal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.6); z-index: 99999;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            padding: 20px; font-family: 'Noto Sans Bengali', sans-serif;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
        `;

        const card = document.createElement('div');
        card.style.cssText = `
            background: ${THEME.softBg}; border-radius: 36px; padding: 24px;
            max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto;
            box-shadow: 0 20px 40px rgba(10,84,56,0.3);
        `;

        const header = document.createElement('div');
        header.style.cssText = `
            display: flex; justify-content: space-between; align-items: center;
            margin-bottom: 24px; background: linear-gradient(145deg, ${THEME.primary}, ${THEME.primaryLight});
            padding: 16px 20px; border-radius: 28px; color: white;
        `;
        header.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                    ${ICONS.imageSearch}
                </span>
                <h2 style="margin: 0; font-size: 22px; font-weight: 700;">ফটো স্ক্যানার</h2>
            </div>
            <button id="visionCloseBtn" style="background: rgba(255,255,255,0.2); border: none; width: 44px; height: 44px; border-radius: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                ${ICONS.close}
            </button>
        `;

        const optionsDiv = document.createElement('div');
        optionsDiv.style.cssText = `
            display: flex; gap: 12px; margin-bottom: 20px;
        `;

        const uploadBtn = document.createElement('button');
        uploadBtn.id = 'visionUploadBtn';
        uploadBtn.style.cssText = `
            flex: 1; background: ${THEME.cardBg}; border: 1px solid ${THEME.primary}40;
            border-radius: 24px; padding: 20px 10px; display: flex; flex-direction: column;
            align-items: center; gap: 8px; cursor: pointer; transition: 0.2s;
        `;
        uploadBtn.innerHTML = `
            <span style="width: 48px; height: 48px; background: ${THEME.primary}15; border-radius: 24px; display: flex; align-items: center; justify-content: center;">
                ${ICONS.upload.replace('fill="white"', `fill="${THEME.primary}"`)}
            </span>
            <span style="font-weight: 600; color: ${THEME.textDark};">গ্যালারি</span>
        `;

        const cameraBtn = document.createElement('button');
        cameraBtn.id = 'visionCameraBtn';
        cameraBtn.style.cssText = uploadBtn.style.cssText;
        cameraBtn.innerHTML = `
            <span style="width: 48px; height: 48px; background: ${THEME.primary}15; border-radius: 24px; display: flex; align-items: center; justify-content: center;">
                ${ICONS.camera.replace('fill="white"', `fill="${THEME.primary}"`)}
            </span>
            <span style="font-weight: 600; color: ${THEME.textDark};">ক্যামেরা</span>
        `;

        optionsDiv.appendChild(uploadBtn);
        optionsDiv.appendChild(cameraBtn);

        const fileInput = document.createElement('input');
        fileInput.id = 'visionInput';
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';

        const previewDiv = document.createElement('div');
        previewDiv.id = 'visionPreview';
        previewDiv.style.display = 'none';
        previewDiv.style.marginBottom = '20px';
        previewDiv.innerHTML = `
            <img id="visionPreviewImg" style="width: 100%; border-radius: 24px; max-height: 200px; object-fit: cover; border: 2px solid ${THEME.primary};">
        `;

        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'visionLoading';
        loadingDiv.style.display = 'none';
        loadingDiv.style.textAlign = 'center';
        loadingDiv.style.padding = '30px';
        loadingDiv.innerHTML = `
            <div style="width: 60px; height: 60px; border: 4px solid #D0E0D0; border-top-color: ${THEME.primary}; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
            <p style="color: ${THEME.textSoft};">বিশ্লেষণ করা হচ্ছে...</p>
        `;

        const resultDiv = document.createElement('div');
        resultDiv.id = 'visionResult';
        resultDiv.style.display = 'none';

        const infoNote = document.createElement('div');
        infoNote.style.cssText = `
            margin-top: 20px; padding: 16px; background: ${THEME.cardBg}; border-radius: 20px;
            display: flex; gap: 12px; align-items: flex-start;
        `;
        infoNote.innerHTML = `
            <span style="width: 24px; height: 24px; flex-shrink: 0;">${ICONS.info.replace('fill="white"', `fill="${THEME.primary}"`)}</span>
            <p style="margin: 0; font-size: 13px; color: ${THEME.textSoft};">কুরআন, হাদিস, দোয়া বা আরবি টেক্সট স্ক্যান করুন। ফলাফল যাচাই করতে টেক্সট কপি করতে পারেন।</p>
        `;

        card.appendChild(header);
        card.appendChild(optionsDiv);
        card.appendChild(fileInput);
        card.appendChild(previewDiv);
        card.appendChild(loadingDiv);
        card.appendChild(resultDiv);
        card.appendChild(infoNote);

        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin { to { transform: rotate(360deg); } }
            #visionUploadBtn:hover, #visionCameraBtn:hover { background: #F0F8F0; border-color: ${THEME.accent}; }
            button { -webkit-tap-highlight-color: transparent; }
        `;
        card.appendChild(style);

        modal.appendChild(card);
        document.body.appendChild(modal);

        document.getElementById('visionCloseBtn').addEventListener('click', closeScanner);
        uploadBtn.addEventListener('click', () => {
            fileInput.removeAttribute('capture');
            fileInput.click();
        });
        cameraBtn.addEventListener('click', () => {
            fileInput.setAttribute('capture', 'environment');
            fileInput.click();
        });
        fileInput.addEventListener('change', handleFileSelect);
    }

    function handleFileSelect() {
        const input = document.getElementById('visionInput');
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async function (e) {
            const previewImg = document.getElementById('visionPreviewImg');
            previewImg.src = e.target.result;
            document.getElementById('visionPreview').style.display = 'block';
            const optionsDiv = document.querySelector('#visionUploadBtn')?.parentElement;
            if (optionsDiv) optionsDiv.style.display = 'none';

            const base64 = e.target.result.split(',')[1];
            await processImage(base64);
        };
        reader.readAsDataURL(file);
    }

    async function processImage(base64Image) {
        document.getElementById('visionLoading').style.display = 'block';
        document.getElementById('visionResult').style.display = 'none';

        try {
            const result = await scanImage(base64Image);
            displayResult(result);
        } catch (e) {
            console.error('[Vision] Unexpected error:', e);
            document.getElementById('visionResult').innerHTML = `
                <div style="background: #FEE9E9; border-radius: 20px; padding: 20px;">
                    <p style="color: ${THEME.red}; margin: 0;">একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।</p>
                </div>
                <button onclick="VisionService.resetScanner()" style="width:100%; padding:18px; border-radius:30px; background:linear-gradient(145deg,${THEME.primary},${THEME.primaryLight}); color:white; font-weight:700; font-size:16px; border:none; display:flex; align-items:center; justify-content:center; gap:10px; margin-top:20px;">
                    ${ICONS.refresh} আবার চেষ্টা করুন
                </button>
            `;
        } finally {
            document.getElementById('visionLoading').style.display = 'none';
            document.getElementById('visionResult').style.display = 'block';
        }
    }

    function displayResult(result) {
        if (!result.success) {
            document.getElementById('visionResult').innerHTML = `
                <div style="background: #FEE9E9; border-radius: 20px; padding: 20px;">
                    <p style="color: ${THEME.red}; margin: 0;">${result.identification}</p>
                    <p style="color: ${THEME.textSoft}; font-size: 13px; margin-top: 8px;">${result.additionalComments}</p>
                </div>
                <button onclick="VisionService.resetScanner()" style="width:100%; padding:18px; border-radius:30px; background:linear-gradient(145deg,${THEME.primary},${THEME.primaryLight}); color:white; font-weight:700; font-size:16px; border:none; display:flex; align-items:center; justify-content:center; gap:10px; margin-top:20px;">
                    ${ICONS.refresh} আবার চেষ্টা করুন
                </button>
            `;
            document.getElementById('visionResult').style.display = 'block';
            return;
        }

        // Generate Structured HTML for the premium modal
        let html = '';

        const confColor = result.confidence === 'High' ? '#10b981' : (result.confidence === 'Medium' ? '#f59e0b' : '#ef4444');

        // identification Card
        html += `
            <div style="background: linear-gradient(135deg, ${THEME.primary}, ${THEME.primaryLight}); border-radius: 20px; padding: 20px; margin-bottom: 20px; color: white;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="width: 24px; height: 24px;">${ICONS.check}</span>
                        <span style="font-weight: 700;">শনাক্তকরণ</span>
                    </div>
                    <span style="background: ${confColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; border: 1px solid rgba(255,255,255,0.3);">
                        নিশ্চিততা: ${result.confidence}
                    </span>
                </div>
                <p style="margin: 0; font-size: 16px; line-height: 1.6; font-weight: 600;">${result.identification || 'চিহ্নিত করা যায়নি'}</p>
            </div>
        `;

        // Source Info
        if (result.sourceInfo) {
            const src = result.sourceInfo;
            html += `<div style="background: rgba(10,84,56,0.05); border-radius: 16px; padding: 16px; margin-bottom: 16px; border: 1px dashed ${THEME.primary}40;">`;
            if (src.surahNumber) {
                html += `
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        <span style="background: ${THEME.primary}; color:white; padding: 4px 12px; border-radius: 20px; font-size:12px; font-weight:700;">সূরা: ${src.surahNumber}</span>
                        ${src.surahNameBengali ? `<span style="background: ${THEME.primary}20; color:${THEME.primary}; padding: 4px 12px; border-radius: 20px; font-size:12px; font-weight:700;">${src.surahNameBengali}</span>` : ''}
                        ${src.ayahRange ? `<span style="background: ${THEME.primary}20; color:${THEME.primary}; padding: 4px 12px; border-radius: 20px; font-size:12px; font-weight:700;">আয়াত: ${src.ayahRange}</span>` : ''}
                    </div>
                `;
            } else if (src.hadithSource) {
                html += `
                    <div style="font-size:14px; color:${THEME.primary}; font-weight:700;">উৎস: ${src.hadithSource}</div>
                    ${src.hadithReference ? `<div style="font-size:13px; color:#555;">রেফারেন্স: ${src.hadithReference}</div>` : ''}
                `;
            }
            html += `</div>`;
        }

        // Arabic Text
        if (result.arabicText) {
            html += `
                <div style="background: white; border: 1.5px solid ${THEME.primary}20; border-radius: 20px; padding: 20px; margin-bottom: 16px; position:relative;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; color:${THEME.primary};">
                        <span style="width: 20px; height: 20px;">${ICONS.imageSearch.replace('fill="white"', `fill="${THEME.primary}"`)}</span>
                        <span style="font-weight: 700; font-size:14px;">আরবি টেক্সট</span>
                    </div>
                    <p style="font-family: 'Amiri', serif; font-size: 26px; margin: 0; line-height: 2; text-align: right; direction: rtl; color: ${THEME.primary};">${result.arabicText}</p>
                </div>
            `;
        }

        // Meaning Sections
        const sections = [
            { label: 'উচ্চারণ', data: result.bengaliPronunciation, icon: '🔊', color: THEME.primary },
            { label: 'বাংলা অর্থ', data: result.bengaliMeaning, icon: ICONS.translate.replace('fill="white"', `fill="${THEME.primary}"`), color: THEME.primary },
            { label: 'English Meaning', data: result.englishMeaning, icon: '🌐', color: '#4B5563' }
        ];

        sections.forEach(sec => {
            if (sec.data) {
                html += `
                    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 16px; margin-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <span style="width: 20px; height: 20px; display:flex; align-items:center; justify-content:center;">${sec.icon}</span>
                            <span style="font-weight: 700; color: ${sec.color}; font-size:14px;">${sec.label}</span>
                        </div>
                        <p style="color: #333; margin: 0; font-size: 15px; line-height: 1.7;">${sec.data}</p>
                    </div>
                `;
            }
        });

        if (result.additionalComments) {
            html += `
                <div style="background: rgba(16, 185, 129, 0.08); border-radius: 16px; padding: 14px; margin-top: 8px; border-left: 4px solid #10b981;">
                    <p style="color: #065f46; margin: 0; font-size: 13px; font-style: italic;">📌 ${result.additionalComments}</p>
                </div>
            `;
        }

        // Show the Premium Modal
        showResultModal(`✨ স্ক্যান ফলাফল`, html, result);

        // Also show a simplified state in the background scanner card
        document.getElementById('visionResult').innerHTML = `
            <div style="background: #E8F5E9; border-radius: 20px; padding: 20px; text-align:center;">
                <span class="material-symbols-rounded" style="font-size:48px; color:${THEME.primary}; margin-bottom:10px;">task_alt</span>
                <p style="color: ${THEME.primary}; font-weight:700; margin: 0;">বিশ্লেষণ সম্পন্ন হয়েছে!</p>
                <button onclick="VisionService.showLastResult()" style="margin-top:12px; background:none; border:1px solid ${THEME.primary}; color:${THEME.primary}; padding:8px 16px; border-radius:20px; font-weight:600; cursor:pointer;">ফলাফল দেখুন</button>
            </div>
            <button onclick="VisionService.resetScanner()" style="width:100%; padding:18px; border-radius:30px; background:linear-gradient(145deg,${THEME.primary},${THEME.primaryLight}); color:white; font-weight:700; font-size:16px; border:none; display:flex; align-items:center; justify-content:center; gap:10px; margin-top:20px;">
                ${ICONS.refresh} আরেকটি স্ক্যান করুন
            </button>
        `;
        document.getElementById('visionResult').style.display = 'block';
    }

    let lastScanResult = null;
    function showLastResult() {
        if (lastScanResult) displayResult(lastScanResult);
    }

    function showResultModal(title, contentHtml, rawResult) {
        lastScanResult = rawResult;

        // Remove existing modal
        const existing = document.querySelector('.ai-vision-result-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.className = 'ai-vision-result-modal';
        modal.style.cssText = `
            position:fixed; top:0; left:0; width:100%; height:100%; 
            background:rgba(0, 0, 0, 0.6); backdrop-filter:blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index:999999; display:flex; align-items:center; justify-content:center;
            padding:20px; font-family: 'Noto Sans Bengali', sans-serif;
        `;

        modal.innerHTML = `
            <div style="background:linear-gradient(145deg,#E8F5E9,#C8E6C9); width:100%; max-width:520px; max-height:85vh; border-radius:28px; overflow:hidden; box-shadow:0 30px 60px rgba(0,0,0,0.4); display:flex; flex-direction:column; animation: modalAppear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);">
              
              <!-- Header -->
              <div style="background:linear-gradient(135deg,${THEME.primary},${THEME.primaryLight}); padding:20px 24px; display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:10px;">
                  <span class="material-symbols-rounded" style="color:white; font-size:24px;">auto_awesome</span>
                  <h3 style="color:white; margin:0; font-size:18px; font-weight:700;">${title}</h3>
                </div>
                <button onclick="this.closest('.ai-vision-result-modal').remove()" style="background:rgba(255,255,255,0.2); border:none; width:36px; height:36px; border-radius:12px; cursor:pointer; color:white; display:flex; align-items:center; justify-content:center;">
                  <span class="material-symbols-rounded">close</span>
                </button>
              </div>
              
              <!-- Content -->
              <div style="padding:24px; overflow-y:auto; flex:1; font-size:15px; line-height:1.8; color:#1f2937;">
                ${contentHtml}
              </div>
              
              <!-- Footer -->
              <div style="padding:16px 20px; border-top:1px solid rgba(0,0,0,0.08); display:flex; gap:12px; background:rgba(255,255,255,0.3);">
                <button onclick="VisionService.copyResultContent()" style="flex:1; padding:14px; border:2px solid ${THEME.primary}; border-radius:16px; background:white; color:${THEME.primary}; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
                  <span class="material-symbols-rounded" style="font-size:20px;">content_copy</span> কপি
                </button>
                <button onclick="this.closest('.ai-vision-result-modal').remove()" style="flex:1; padding:14px; border:none; border-radius:16px; background:linear-gradient(135deg,${THEME.primary},${THEME.primaryLight}); color:white; font-weight:700; cursor:pointer;">
                  বন্ধ করুন
                </button>
              </div>
            </div>
            <style>
              @keyframes modalAppear { from { opacity:0; transform:scale(0.9) translateY(20px); } to { opacity:1; transform:scale(1) translateY(0); } }
            </style>
        `;

        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    }

    function copyResultContent() {
        if (!lastScanResult) return;
        const text = `শনাক্তকরণ: ${lastScanResult.identification}\nআরবি: ${lastScanResult.arabicText}\nঅর্থ: ${lastScanResult.bengaliMeaning}`;
        navigator.clipboard.writeText(text).then(() => {
            showToast('কপি হয়েছে! ✓');
        });
    }

    function resetScanner() {
        const input = document.getElementById('visionInput');
        const preview = document.getElementById('visionPreview');
        const result = document.getElementById('visionResult');
        const optionsDiv = document.querySelector('#visionUploadBtn')?.parentElement;
        if (input) input.value = '';
        if (preview) preview.style.display = 'none';
        if (optionsDiv) optionsDiv.style.display = 'flex';
        if (result) { result.style.display = 'none'; result.innerHTML = ''; }
    }

    function closeScanner() {
        const modal = document.getElementById('visionScannerModal');
        if (modal) modal.remove();
    }

    function showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%);
            background: ${THEME.primary}; color: white; padding: 14px 28px;
            border-radius: 40px; z-index: 1000000; font-size: 15px;
            font-weight: 600; box-shadow: 0 8px 24px rgba(10,84,56,0.3);
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }

    return {
        initScanner,
        handleFileSelect,
        closeScanner,
        resetScanner,
        scanImage,
        showToast
    };
})();
