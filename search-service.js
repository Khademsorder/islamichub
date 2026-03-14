const SearchService = (() => {
    const STORAGE_KEY = 'islamic_search_history';
    let searchTimeout = null;

    function showSearchView() {
        const existingModal = document.getElementById('searchModal');
        if (existingModal) {
            existingModal.style.display = 'flex';
            document.getElementById('searchInput').focus();
            showSuggestions();
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'searchModal';
        modal.className = 'search-modal-container';
        modal.style.cssText = `
            position:fixed;top:0;left:0;width:100%;height:100%;
            background:var(--bg-main, #f0f5f2);
            z-index:99999;
            display:flex;flex-direction:column;
            font-family:'Noto Sans Bengali',sans-serif;
        `;

        modal.innerHTML = `
            <div style="background:linear-gradient(135deg,#0A5438,#059669);padding:20px 16px;box-shadow:0 4px 20px rgba(10,84,56,0.3); padding-top: calc(20px + env(safe-area-inset-top));">
                <div style="display:flex;align-items:center;gap:12px;">
                    <button onclick="SearchService.closeSearch()" style="background:rgba(255,255,255,0.2);border:none;width:40px;height:40px;border-radius:12px;cursor:pointer;color:white;display:flex;align-items:center;justify-content:center;font-size:24px;">←</button>
                    <div style="flex:1;position:relative;">
                        <span class="material-symbols-rounded" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:rgba(255,255,255,0.7);">search</span>
                        <input type="text" id="searchInput" placeholder="কুরআন, হাদিস, দোয়া বা যেকোনো কিছু খুঁজুন..." autocomplete="off"
                            style="width:100%;padding:14px 14px 14px 44px;border:none;border-radius:16px;font-size:16px;background:rgba(255,255,255,0.95);color:#1a1a1a;outline:none;font-family:inherit;">
                        <button id="clearSearchBtn" onclick="document.getElementById('searchInput').value=''; SearchService.showSuggestions();" style="display:none;position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:#555;padding:4px;cursor:pointer;"><span class="material-symbols-rounded" style="font-size:20px;">close</span></button>
                    </div>
                </div>
                
                <div style="display:flex;gap:8px;margin-top:16px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none;" id="searchFilters" class="hide-scrollbar">
                    <button class="filter-btn active" data-filter="ALL" onclick="SearchService.setFilter('ALL')">সবগুলো</button>
                    <button class="filter-btn" data-filter="QURAN" onclick="SearchService.setFilter('QURAN')">কুরআন</button>
                    <button class="filter-btn" data-filter="HADITH" onclick="SearchService.setFilter('HADITH')">হাদিস</button>
                    <button class="filter-btn" data-filter="DUA" onclick="SearchService.setFilter('DUA')">দোয়া</button>
                    <button class="filter-btn" data-filter="NAMAZ" onclick="SearchService.setFilter('NAMAZ')">নামাজ</button>
                    <button class="filter-btn" data-filter="STORY" onclick="SearchService.setFilter('STORY')">গল্প</button>
                    <button class="filter-btn" data-filter="QA" onclick="SearchService.setFilter('QA')">প্রশ্ন-উত্তর</button>
                    <button class="filter-btn" data-filter="NAMES" onclick="SearchService.setFilter('NAMES')">৯৯ নাম</button>
                </div>
            </div>
            
            <div style="padding:16px;flex:1;overflow-y:auto;background:var(--bg-main, #f0f5f2);" id="searchResults">
                <!-- Suggestions or Results will go here -->
            </div>
            
            <style>
                .search-modal-container [data-theme="dark"] { --bg-main: #0c1a14; --bg-surface: #132a1f; --text-primary: #e2f0e8; }
                .filter-btn {padding:8px 16px;border:none;background:rgba(255,255,255,0.2);color:white;border-radius:20px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;transition:all 0.2s;}
                .filter-btn.active {background:rgba(255,255,255,0.95);color:#0A5438;}
                .filter-btn:hover {background:rgba(255,255,255,0.3);}
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .suggestion-chip { background: var(--bg-surface, #fff); border: 1px solid var(--border-color, #d4e5dc); padding: 8px 16px; border-radius: 50px; font-size: 14px; color: var(--text-primary, #1a2e23); cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); transition:transform 0.2s; }
                .suggestion-chip:active { transform: scale(0.95); }
                @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            </style>
        `;

        document.body.appendChild(modal);

        const input = document.getElementById('searchInput');
        const clearBtn = document.getElementById('clearSearchBtn');

        input.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            clearBtn.style.display = val.length > 0 ? 'block' : 'none';
            clearTimeout(searchTimeout);

            if (val.length === 0) {
                showSuggestions();
            } else {
                searchTimeout = setTimeout(() => performSearch(val), 300);
            }
        });

        showSuggestions();
        setTimeout(() => input.focus(), 100);
    }

    function showSuggestions() {
        const resultsDiv = document.getElementById('searchResults');
        document.getElementById('clearSearchBtn').style.display = 'none';

        let history = [];
        try {
            history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch (e) { }

        const commonSearches = ['আয়াতুল কুরসী', 'সূরা ইয়াসিন', 'তাহাজ্জুদ', 'রিজিক', 'বিপদ', 'সালাতুত তাসবীহ', 'জানাজা', '৯৯ নাম', 'ঈমান ও আকাইদ', 'আশরাফুল মাখলুকাত'];

        let html = '<div style="animation: fadeSlideUp 0.3s ease;">';

        if (history.length > 0) {
            html += `<h4 style="color:var(--text-secondary,#5a7968);margin-bottom:12px;font-size:14px;display:flex;justify-content:space-between;align-items:center;">
                        <span>সাম্প্রতিক খোঁজ</span>
                        <span onclick="SearchService.clearHistory()" style="color:#ef4444;cursor:pointer;font-size:12px;background:rgba(239, 68, 68, 0.1);padding:4px 8px;border-radius:12px;font-weight:700;">মুছে ফেলুন</span>
                     </h4>
                     <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:32px;">`;
            history.forEach(h => {
                html += `<div class="suggestion-chip" onclick="document.getElementById('searchInput').value='${h}'; document.getElementById('searchInput').dispatchEvent(new Event('input'))">
                            <span class="material-symbols-rounded" style="font-size:16px;color:var(--text-secondary,#5a7968)">history</span>
                            ${h}
                         </div>`;
            });
            html += `</div>`;
        }

        html += `<h4 style="color:var(--text-secondary,#5a7968);margin-bottom:12px;font-size:14px;">পরামর্শ / জনপ্রিয় খোঁজ</h4>
                 <div style="display:flex;flex-wrap:wrap;gap:10px;">`;

        commonSearches.forEach(s => {
            html += `<div class="suggestion-chip" onclick="document.getElementById('searchInput').value='${s}'; document.getElementById('searchInput').dispatchEvent(new Event('input'))">
                        <span class="material-symbols-rounded" style="font-size:16px;color:#2d8a64">search_insights</span>
                        ${s}
                     </div>`;
        });

        html += `</div></div>`;
        resultsDiv.innerHTML = html;
    }

    function clearHistory() {
        localStorage.removeItem(STORAGE_KEY);
        showSuggestions();
    }

    function setFilter(filter) {
        document.querySelectorAll('.search-modal-container .filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        const query = document.getElementById('searchInput').value.trim();
        if (query.length >= 2) {
            performSearch(query);
        } else if (query.length === 0) {
            showSuggestions();
        }
    }

    function matchText(itemContent, query) {
        if (itemContent == null || !query) return false;
        return itemContent.toString().toLowerCase().includes(query.toLowerCase());
    }

    function isMatch(item, fields, query) {
        if (!item) return false;
        return fields.some(field => matchText(item[field], query));
    }

    let lastResults = [];

    function performSearch(query) {
        const resultsDiv = document.getElementById('searchResults');
        const activeFilter = document.querySelector('.search-modal-container .filter-btn.active').dataset.filter;

        if (query.length < 2) {
            resultsDiv.innerHTML = `
                <div style="text-align:center;color:var(--text-secondary,#5a7968);padding:60px 20px;">
                    <span class="material-symbols-rounded" style="font-size:64px;opacity:0.3;">search</span>
                    <p style="margin-top:12px;font-weight:600;font-size:16px;">কমপক্ষে ২ অক্ষর লিখুন</p>
                </div>
            `;
            return;
        }

        resultsDiv.innerHTML = `
            <div style="text-align:center;padding:60px 20px;">
                <div style="width:40px;height:40px;border:4px solid var(--border-color,#d4e5dc);border-top-color:#2d8a64;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto;"></div>
                <p style="margin-top:16px;color:var(--text-secondary,#5a7968);font-weight:600;">খুঁজছি...</p>
            </div>
        `;

        const q = query.toLowerCase();
        let results = [];

        try {
            if (activeFilter === 'ALL' || activeFilter === 'QURAN') results = results.concat(searchQuran(q));
            if (activeFilter === 'ALL' || activeFilter === 'HADITH') results = results.concat(searchHadith(q));
            if (activeFilter === 'ALL' || activeFilter === 'DUA') results = results.concat(searchDuas(q));
            if (activeFilter === 'ALL' || activeFilter === 'NAMAZ') results = results.concat(searchNamaz(q));
            if (activeFilter === 'ALL' || activeFilter === 'STORY') results = results.concat(searchStories(q));
            if (activeFilter === 'ALL' || activeFilter === 'QA') results = results.concat(searchQA(q));
            if (activeFilter === 'ALL' || activeFilter === 'NAMES') results = results.concat(searchNames(q));
            if (activeFilter === 'ALL') {
                results = results.concat(searchKalima(q));
                results = results.concat(searchMisconceptions(q));
            }
        } catch (e) {
            console.error('Search error:', e);
        }

        lastResults = results; // Store globally in module

        if (results.length === 0) {
            resultsDiv.innerHTML = `
                <div style="text-align:center;color:var(--text-secondary,#5a7968);padding:60px 20px; animation: fadeSlideUp 0.3s ease;">
                    <span class="material-symbols-rounded" style="font-size:64px;color:#ef4444;opacity:0.8;margin-bottom:16px;">search_off</span>
                    <h3 style="color:var(--text-primary,#1a2e23);font-weight:800;">কোনো ফলাফল পাওয়া যায়নি</h3>
                    <p style="margin-top:8px;font-size:14px;">"${query}" এর জন্য কিছু খুঁজে পাওয়া যায়নি। অন্য শব্দ দিয়ে চেষ্টা করে দেখুন।</p>
                </div>
            `;
            return;
        }

        saveToHistory(query);
        displayResults(results, resultsDiv);
    }

    function searchQuran(q) {
        const results = [];
        if (typeof surahData !== 'undefined' && surahData.surahs) {
            surahData.surahs.forEach(surah => {
                if (isMatch(surah, ['name', 'arabic', 'meaning'], q)) {
                    results.push({
                        type: 'QURAN',
                        id: surah.id,
                        title: surah.name,
                        subtitle: surah.arabic,
                        content: `সূরা ${surah.id} • ${surah.verses} আয়াত • ${surah.type}`,
                        icon: 'menu_book',
                        originalItem: surah
                    });
                }
            });
        }
        return results;
    }

    function searchHadith(q) {
        const results = [];
        if (typeof hadithData !== 'undefined' && hadithData.hadiths) {
            hadithData.hadiths.forEach((item, idx) => {
                if (isMatch(item, ['title', 'bangla', 'arabic', 'explanation'], q)) {
                    results.push({
                        type: 'HADITH',
                        title: item.title || 'হাদিস',
                        subtitle: item.reference || 'হাদিস',
                        content: (item.bangla || '').substring(0, 100) + '...',
                        icon: 'library_books',
                        originalItem: { ...item, idx: idx, cat: 'koumi' }
                    });
                }
            });
        }
        if (typeof extendedHadithData !== 'undefined' && extendedHadithData.hadith_topics) {
            extendedHadithData.hadith_topics.forEach((topic, tIdx) => {
                if (topic.items && Array.isArray(topic.items)) {
                    topic.items.forEach((item, iIdx) => {
                        if (isMatch(item, ['title', 'bangla', 'arabic', 'explanation'], q) || isMatch(topic, ['name'], q)) {
                            results.push({
                                type: 'HADITH',
                                title: item.title || topic.name || 'হাদিস',
                                subtitle: item.reference || topic.name,
                                content: (item.bangla || '').substring(0, 100) + '...',
                                icon: 'library_books',
                                originalItem: { ...item, topicIdx: tIdx, itemIdx: iIdx, cat: 'extended' }
                            });
                        }
                    });
                }
            });
        }
        return results;
    }

    function searchDuas(q) {
        const results = [];
        if (typeof DUA_DATA !== 'undefined' && DUA_DATA.duas) {
            DUA_DATA.duas.forEach((dua, idx) => {
                if (isMatch(dua, ['title', 'arabic', 'bangla', 'transliteration', 'virtue'], q)) {
                    results.push({
                        type: 'DUA',
                        title: dua.title,
                        subtitle: DUA_DATA.categories?.find(c => c.id === dua.category)?.name || 'দোয়া',
                        content: (dua.bangla || dua.transliteration || '').substring(0, 80) + '...',
                        icon: 'volunteer_activism',
                        originalItem: { ...dua, idx: idx }
                    });
                }
            });
        }
        return results;
    }

    function searchNamaz(q) {
        const results = [];
        const ex = window.namazExtras;
        if (ex) {
            // Search Surahs
            ex.namazSurahs.forEach((s, idx) => {
                if (isMatch(s, ['name_bn'], q) || (s.content && isMatch(s.content, ['translation', 'arabic', 'transliteration'], q))) {
                    results.push({
                        type: 'NAMAZ_EXTRA',
                        title: s.name_bn,
                        subtitle: 'নামাজের সূরা',
                        content: `আয়াত: ${s.ayat_count}`,
                        icon: 'menu_book',
                        originalItem: { cat: 'surahs', idx: idx }
                    });
                }
            });
            // Search namazDuas
            ex.namazDuas.forEach((d, idx) => {
                if (isMatch(d, ['name_bn'], q) || (d.content && isMatch(d.content, ['translation', 'arabic', 'transliteration'], q))) {
                    results.push({
                        type: 'NAMAZ_EXTRA',
                        title: d.name_bn,
                        subtitle: 'নামাজের দোয়া',
                        content: (d.content.translation || '').substring(0, 80),
                        icon: 'auto_awesome',
                        originalItem: { cat: 'namaz_duas', idx: idx }
                    });
                }
            });
            // Search namazImportantDuas
            ex.namazImportantDuas.forEach((d, idx) => {
                if (isMatch(d, ['name_bn'], q) || (d.content && isMatch(d.content, ['translation', 'arabic', 'transliteration'], q))) {
                    results.push({
                        type: 'NAMAZ_EXTRA',
                        title: d.name_bn,
                        subtitle: 'গুরুত্বপূর্ণ দোয়া',
                        content: (d.content.translation || '').substring(0, 80),
                        icon: 'mosque',
                        originalItem: { cat: 'important_duas', idx: idx }
                    });
                }
            });
        }

        if (typeof extendedNamazData !== 'undefined' && extendedNamazData.additional_namaz) {
            extendedNamazData.additional_namaz.forEach((item, idx) => {
                if (isMatch(item, ['name', 'description', 'importance'], q)) {
                    results.push({
                        type: 'NAMAZ_EXTRA',
                        title: item.name,
                        subtitle: 'অতিরিক্ত নামাজ',
                        content: (item.description || '').substring(0, 80) + '...',
                        icon: 'self_improvement',
                        originalItem: { cat: 'extra_namaz', idx: idx }
                    });
                }
            });
        }
        return results;
    }

    function searchStories(q) {
        const results = [];
        if (typeof IslamicStoriesData !== 'undefined') {
            const categories = ['sirat', 'prophets', 'khalifas', 'sahaba', 'event'];
            categories.forEach(cat => {
                if (IslamicStoriesData[cat]) {
                    if (isMatch(IslamicStoriesData[cat], ['title', 'description'], q)) {
                        results.push({
                            type: 'STORY',
                            title: IslamicStoriesData[cat].title,
                            subtitle: 'ইসলামিক গল্প',
                            content: (IslamicStoriesData[cat].description || '').substring(0, 80) + '...',
                            icon: 'auto_stories',
                            originalItem: { cat: cat, type: 'main' }
                        });
                    }
                    if (IslamicStoriesData[cat].chapters) {
                        IslamicStoriesData[cat].chapters.forEach((chapter, idx) => {
                            if (isMatch(chapter, ['title', 'content'], q)) {
                                results.push({
                                    type: 'STORY',
                                    title: chapter.title,
                                    subtitle: IslamicStoriesData[cat].title || 'গল্প',
                                    content: (chapter.content || '').substring(0, 80) + '...',
                                    icon: 'auto_stories',
                                    originalItem: { cat: cat, type: 'chapter', idx: idx }
                                });
                            }
                        });
                    }
                }
            });
        }
        return results;
    }

    function searchQA(q) {
        const results = [];
        if (typeof QUESTION_DATA !== 'undefined' && typeof ANS_DATA !== 'undefined' && QUESTION_DATA.questions) {
            QUESTION_DATA.questions.forEach(question => {
                const ansObj = ANS_DATA[question.id] || ANS_DATA[Math.abs(parseInt(question.id))];
                const ansText = ansObj?.text || '';
                if (isMatch(question, ['text'], q) || matchText(ansText, q)) {
                    const catName = QUESTION_DATA.categories?.find(c => c.id === question.categoryId)?.name || 'প্রশ্ন-উত্তর';
                    results.push({
                        type: 'QA',
                        title: question.text,
                        subtitle: catName,
                        content: ansText.substring(0, 100).replace(/<[^>]*>?/gm, '') + '...',
                        icon: 'help_center',
                        originalItem: question
                    });
                }
            });
        }
        return results;
    }

    function searchNames(q) {
        const results = [];
        if (typeof asmaulHusnaData !== 'undefined' && Array.isArray(asmaulHusnaData)) {
            asmaulHusnaData.forEach((name, idx) => {
                if (isMatch(name, ['arabic', 'bangla', 'meaning', 'explanation', 'amal'], q)) {
                    results.push({
                        type: 'NAMES',
                        title: `${name.arabic} - ${name.bangla}`,
                        subtitle: 'আল্লাহর ৯৯ নাম',
                        content: (name.meaning || name.explanation || '').substring(0, 80) + '...',
                        icon: 'fingerprint',
                        originalItem: { ...name, idx: idx }
                    });
                }
            });
        }
        return results;
    }

    function searchKalima(q) {
        const results = [];
        if (typeof kalimaData !== 'undefined' && Array.isArray(kalimaData)) {
            kalimaData.forEach((kalima, idx) => {
                if (isMatch(kalima, ['name', 'arabic', 'pronunciation', 'meaning'], q)) {
                    results.push({
                        type: 'KALIMA',
                        title: kalima.name,
                        subtitle: 'কালিমা',
                        content: (kalima.meaning || kalima.pronunciation || '').substring(0, 80) + '...',
                        icon: 'format_quote',
                        originalItem: { cat: 'kalimas', idx: idx }
                    });
                }
            });
        }
        return results;
    }

    function searchMisconceptions(q) {
        const results = [];
        if (typeof misconceptionsData !== 'undefined' && Array.isArray(misconceptionsData)) {
            misconceptionsData.forEach((topic, tIdx) => {
                if (topic.questions && Array.isArray(topic.questions)) {
                    topic.questions.forEach((mc, qIdx) => {
                        if (isMatch(mc, ['question', 'answer', 'myth', 'fact'], q) || isMatch(topic, ['title'], q)) {
                            results.push({
                                type: 'MISCONCEPTIONS',
                                title: mc.question || mc.myth || 'ভুল ধারণা',
                                subtitle: topic.title || 'ভুল ধারণা বনাম সঠিক',
                                content: ((mc.answer || mc.fact || '').replace(/<[^>]*>?/gm, '')).substring(0, 80) + '...',
                                icon: 'lightbulb',
                                originalItem: { ...mc, topicIdx: tIdx, qIdx: qIdx }
                            });
                        }
                    });
                }
            });
        }
        return results;
    }

    function displayResults(results, container) {
        let html = `<div style="padding-bottom:100px; animation: fadeSlideUp 0.3s ease;">`;

        html += `<div style="font-size:14px; color:var(--text-secondary,#5a7968); margin-bottom: 20px; text-align:center; font-weight:600; background:rgba(45, 138, 100, 0.1); padding:8px; border-radius:12px; display:inline-block; margin-left:50%; transform:translateX(-50%);">
                    মোট <strong style="color:var(--accent-primary,#2d8a64);">${results.length}</strong> টি ফলাফল পাওয়া গেছে
                 </div>`;

        const grouped = {};
        results.forEach((item, index) => {
            if (!grouped[item.type]) grouped[item.type] = [];
            grouped[item.type].push({ ...item, globalIndex: index });
        });

        const colors = {
            'QURAN': '#10b981', 'HADITH': '#6366f1', 'DUA': '#f59e0b',
            'NAMAZ_EXTRA': '#0a5438', 'STORY': '#ec4899', 'QA': '#8b5cf6',
            'NAMES': '#3b82f6', 'KALIMA': '#14b8a6', 'MISCONCEPTIONS': '#f43f5e'
        };

        const typeNames = {
            'QURAN': 'কুরআন', 'HADITH': 'হাদিস', 'DUA': 'দোয়া',
            'NAMAZ_EXTRA': 'নামাজ ও দোয়া', 'STORY': 'গল্প', 'QA': 'প্রশ্ন-উত্তর',
            'NAMES': '৯৯ নাম', 'KALIMA': 'কালিমা', 'MISCONCEPTIONS': 'ভুল ধারণা'
        };

        let count = 0;
        const maxResults = 100;

        for (const [type, items] of Object.entries(grouped)) {
            const color = colors[type] || '#10b981';
            html += `
                <div style="margin-bottom:24px;">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;border-bottom: 2px solid ${color}20;padding-bottom: 8px;">
                        <span class="material-symbols-rounded" style="color:${color};font-size:22px;">${items[0]?.icon || 'article'}</span>
                        <span style="font-size:16px;font-weight:800;color:${color};">${typeNames[type] || type}</span>
                        <span style="font-size:12px;color:white;background:${color};border-radius:12px;padding:2px 10px;font-weight:800;">${items.length}</span>
                    </div>
            `;

            for (const item of items) {
                if (count >= maxResults) break;
                count++;

                html += `
                    <div style="background:var(--bg-surface,#fff);border-radius:16px;padding:16px;margin-bottom:12px;cursor:pointer;transition:all 0.25s;border:1px solid var(--border-color,#d4e5dc);box-shadow:0 4px 12px rgba(0,0,0,0.03);"
                         onclick="SearchService.handleResultClick(${item.globalIndex})" 
                         onmouseover="this.style.borderColor='${color}';this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 24px ${color}20';"
                         onmouseout="this.style.borderColor='var(--border-color,#d4e5dc)';this.style.transform='';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.03)';">
                        <div style="font-weight:800;color:var(--text-primary,#1a2e23);font-size:16px;">${item.title}</div>
                        <div style="font-size:12px;color:${color};margin-top:6px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;">${item.subtitle}</div>
                        ${item.content ? `<div style="font-size:14px;color:var(--text-secondary,#5a7968);margin-top:8px;line-height:1.6;">${item.content}</div>` : ''}
                    </div>
                `;
            }
            html += '</div>';
            if (count >= maxResults) break;
        }

        if (results.length > maxResults) {
            html += `<p style="text-align:center;color:var(--text-secondary,#5a7968);padding:16px;font-weight:700;background:rgba(0,0,0,0.04);border-radius:12px;margin-top:16px;">আরও ${results.length - maxResults}টি ফলাফল আছে। আরো নির্দিষ্ট করে খুঁজুন।</p>`;
        }

        html += '</div>';
        container.innerHTML = html;
    }

    function handleResultClick(index) {
        const item = lastResults[index];
        if (!item) return;

        closeSearch();

        const action = {
            type: item.type,
            payload: item.originalItem,
            title: item.title
        };

        sessionStorage.setItem('pendingSearchAction', JSON.stringify(action));

        const routeMap = {
            'QURAN': 'quran.html',
            'HADITH': 'islamic.html',
            'DUA': 'islamic.html',
            'NAMAZ_EXTRA': 'islamic.html',
            'STORY': 'islamic.html',
            'QA': 'islamic.html',
            'NAMES': 'islamic.html',
            'KALIMA': 'islamic.html',
            'MISCONCEPTIONS': 'islamic.html'
        };

        const targetPage = routeMap[item.type] || 'islamic.html';

        if (!window.location.href.includes(targetPage)) {
            window.location.href = targetPage;
        } else {
            // If already on the page, trigger the action immediately
            if (typeof UI !== 'undefined' && UI.checkPendingSearchAction) {
                UI.checkPendingSearchAction();
            } else if (typeof handleSearchAction === 'function') {
                handleSearchAction();
            }
        }
    }

    function saveToHistory(query) {
        if (!query || query.length < 2) return;
        try {
            let history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            history = history.filter(h => h.toLowerCase() !== query.toLowerCase());
            history.unshift(query);
            history = history.slice(0, 15);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        } catch (e) { }
    }

    function closeSearch() {
        const modal = document.getElementById('searchModal');
        if (modal) modal.style.display = 'none';
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';
    }

    return {
        showSearchView,
        closeSearch,
        setFilter,
        performSearch,
        handleResultClick,
        showSuggestions,
        clearHistory
    };
})();

