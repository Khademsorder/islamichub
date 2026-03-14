const BookmarkService = (() => {
    const STORAGE_KEY = 'islamic_bookmarks';

    function getBookmarks() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    }

    function saveBookmarks(bookmarks) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
        if (window.SyncService) SyncService.pushToCloud(STORAGE_KEY);
    }

    function addBookmark(item) {
        const bookmarks = getBookmarks();
        const exists = bookmarks.some(b => b.id === item.id && b.type === item.type);

        if (!exists) {
            bookmarks.unshift({
                ...item,
                savedAt: new Date().toISOString()
            });
            saveBookmarks(bookmarks);
            return true;
        }
        return false;
    }

    function removeBookmark(id, type) {
        const bookmarks = getBookmarks();
        const filtered = bookmarks.filter(b => !(b.id === id && b.type === type));
        saveBookmarks(filtered);
        return filtered;
    }

    function isBookmarked(id, type) {
        const bookmarks = getBookmarks();
        return bookmarks.some(b => b.id === id && b.type === type);
    }

    function showBookmarksView() {
        const existingModal = document.getElementById('bookmarksModal');
        if (existingModal) {
            existingModal.style.display = 'flex';
            return;
        }

        const bookmarks = getBookmarks();

        const modal = document.createElement('div');
        modal.id = 'bookmarksModal';
        modal.style.cssText = `
            position:fixed;top:0;left:0;width:100%;height:100%;background:var(--bg-main);z-index:99999;
            display:flex;flex-direction:column;
            font-family:'Noto Sans Bengali',sans-serif;
        `;

        modal.innerHTML = `
            <div style="background:var(--bg-surface);padding:16px;box-shadow:var(--shadow-sm);display:flex;align-items:center;gap:12px;">
                <button onclick="BookmarkService.closeBookmarks()" style="background:none;border:none;font-size:24px;cursor:pointer;color:var(--text-primary);">←</button>
                <h2 style="margin:0;font-size:20px;color:var(--text-primary);">
                    <span class="material-symbols-rounded" style="vertical-align:middle;margin-right:8px;color:#f59e0b;">bookmark</span>
                    বুকমার্ক
                </h2>
            </div>
            
            <div style="flex:1;overflow-y:auto;padding:16px;" id="bookmarksList">
                ${bookmarks.length === 0 ? `
                    <div style="text-align:center;color:var(--text-secondary);padding:60px 20px;">
                        <span class="material-symbols-rounded" style="font-size:64px;opacity:0.3;">bookmark_border</span>
                        <p style="margin-top:12px;">কোনো বুকমার্ক নেই</p>
                        <p style="font-size:13px;margin-top:8px;">পছন্দের আয়াত, হাদিস বা দোয়া সেভ করুন</p>
                    </div>
                ` : ''}
            </div>
        `;

        document.body.appendChild(modal);
        displayBookmarks(bookmarks);
    }

    function displayBookmarks(bookmarks) {
        const container = document.getElementById('bookmarksList');
        if (!container || bookmarks.length === 0) return;

        let html = `<div style="padding-bottom:20px;">`;

        bookmarks.forEach((item, idx) => {
            const colors = {
                'QURAN': '#10b981',
                'HADITH': '#6366f1',
                'DUA': '#f59e0b',
                'NAMAZ': '#0a5438',
                'STORY': '#ec4899',
                'AYATUL_KURSI': '#059669',
                'KALIMA': '#115e59'
            };
            const color = colors[item.type] || '#10b981';
            const date = new Date(item.savedAt).toLocaleDateString('bn-BD');

            html += `
                <div onclick="BookmarkService.navigateToBookmark('${item.id}', '${item.type}', ${item.surahId || 'null'}, ${item.idx || 'null'})" 
                    style="background:var(--bg-surface);border-radius:12px;padding:16px;margin-bottom:12px;position:relative;cursor:pointer;border:1px solid var(--border-color);">
                    <button onclick="BookmarkService.deleteBookmark('${item.id}', '${item.type}', event)" 
                        style="position:absolute;top:12px;right:12px;background:none;border:none;cursor:pointer;color:#ef4444;padding:4px;z-index:2;">
                        <span class="material-symbols-rounded">delete</span>
                    </button>
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                        <span class="material-symbols-rounded" style="color:${color};font-size:18px;">${item.icon || 'bookmark'}</span>
                        <span style="font-size:10px;font-weight:700;color:${color};text-transform:uppercase;">${item.type}</span>
                        <span style="font-size:11px;color:var(--text-secondary);">• ${date}</span>
                    </div>
                    <div style="font-weight:700;color:var(--text-primary);font-size:15px;padding-right:40px;">${item.title}</div>
                    ${item.subtitle ? `<div style="font-size:12px;color:var(--text-secondary);margin-top:4px;padding-right:40px;">${item.subtitle}</div>` : ''}
                    ${item.content ? `<div style="font-size:13px;color:var(--text-secondary);margin-top:8px;line-height:1.4;padding-right:40px;">${item.content.substring(0, 100)}...</div>` : ''}
                    ${item.arabic ? `<div style="font-family:'Amiri',serif;font-size:18px;margin-top:12px;text-align:right;direction:rtl;color:var(--accent-primary);">${item.arabic}</div>` : ''}
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    }

    function navigateToBookmark(id, type, surahId, idx) {
        closeBookmarks();

        switch (type) {
            case 'QURAN':
                if (typeof openSurah !== 'undefined') openSurah(surahId);
                break;
            case 'HADITH':
                if (typeof showHadithDetail !== 'undefined') showHadithDetail(idx);
                break;
            case 'DUA':
                if (typeof showDuaDetail !== 'undefined') showDuaDetail(id);
                break;
            case 'AYATUL_KURSI':
                if (typeof Logic !== 'undefined' && Logic.renderAyatulKursiInteractive) Logic.renderAyatulKursiInteractive();
                break;
            case 'KALIMA':
                if (typeof NamazModule !== 'undefined' && NamazModule.showExtraItemDetail) NamazModule.showExtraItemDetail('kalimas', idx);
                break;
            default:
                if (typeof showSection !== 'undefined') showSection(type.toLowerCase());
        }
    }

    function deleteBookmark(id, type, event) {
        if (event) event.stopPropagation();
        const bookmarks = removeBookmark(id, type);
        displayBookmarks(bookmarks);

        if (bookmarks.length === 0) {
            const container = document.getElementById('bookmarksList');
            if (container) {
                container.innerHTML = `
                    <div style="text-align:center;color:var(--text-secondary);padding:60px 20px;">
                        <span class="material-symbols-rounded" style="font-size:64px;opacity:0.3;">bookmark_border</span>
                        <p style="margin-top:12px;">কোনো বুকমার্ক নেই</p>
                        <p style="font-size:13px;margin-top:8px;">পছন্দের আয়াত, হাদিস বা দোয়া সেভ করুন</p>
                    </div>
                `;
            }
        }
    }

    function closeBookmarks() {
        const modal = document.getElementById('bookmarksModal');
        if (modal) modal.remove();
    }

    function toggleBookmark(item) {
        if (isBookmarked(item.id, item.type)) {
            removeBookmark(item.id, item.type);
            UI.showToast('বুকমার্ক মুছে ফেলা হয়েছে');
            return false;
        } else {
            addBookmark(item);
            UI.showToast('বুকমার্ক করা হয়েছে');
            return true;
        }
    }

    return {
        getBookmarks,
        addBookmark,
        removeBookmark,
        isBookmarked,
        showBookmarksView,
        closeBookmarks,
        toggleBookmark,
        deleteBookmark,
        navigateToBookmark
    };
})();
