/**
 * ai-modal.js — Global Premium AI Answer Modal
 * Same premium UI as misconceptions AI answer.
 * Use: window.showPremiumAIModal(title, content, question?)
 */

(function () {
    const THEME = {
        primary: '#0A5438',
        primaryLight: '#2D6A4F',
        accent: '#40916C',
        gold: '#C49A2B'
    };

    let _currentContent = '';

    // ── Markdown → rich HTML formatter ─────────────────
    function formatAIContent(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^### (.*$)/gm, `<h4 style="color:${THEME.primary};margin:14px 0 6px;font-size:15px;font-weight:800;display:flex;align-items:center;gap:6px;"><span style="width:4px;height:18px;background:${THEME.gold};border-radius:2px;display:inline-block;"></span>$1</h4>`)
            .replace(/^## (.*$)/gm, `<h3 style="color:${THEME.primary};margin:18px 0 8px;font-size:17px;font-weight:800;border-bottom:2px solid ${THEME.primary}22;padding-bottom:6px;">$1</h3>`)
            .replace(/^# (.*$)/gm, `<h2 style="color:${THEME.primary};margin:20px 0 10px;font-size:19px;font-weight:900;">$1</h2>`)
            .replace(/^---+$/gm, `<hr style="border:none;border-top:1px solid rgba(10,84,56,.15);margin:12px 0;">`)
            .replace(/^- (.*$)/gm, `<div style="display:flex;align-items:flex-start;gap:8px;margin:5px 0;"><span style="color:${THEME.accent};font-size:10px;margin-top:6px;">●</span><span>$1</span></div>`)
            .replace(/^(\d+)\. (.*$)/gm, `<div style="display:flex;align-items:flex-start;gap:8px;margin:6px 0;"><span style="background:${THEME.primary};color:white;border-radius:50%;width:20px;height:20px;min-width:20px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;margin-top:2px;">$1</span><span>$2</span></div>`)
            .replace(/\n\n/g, '<div style="height:10px"></div>')
            .replace(/\n/g, '<br>');
    }

    // ── Copy helper ─────────────────────────────────────
    function copyToClip(text) {
        navigator.clipboard?.writeText(text).then(() => {
            _showToast('✓ কপি হয়েছে!');
        }).catch(() => {
            _showToast('কপি করতে সমস্যা হয়েছে');
        });
    }

    function _showToast(msg) {
        const t = document.createElement('div');
        t.style.cssText = `position:fixed;top:80px;left:50%;transform:translateX(-50%);background:${THEME.primary};color:white;padding:10px 22px;border-radius:30px;z-index:9999999;font-size:14px;font-weight:700;box-shadow:0 4px 20px rgba(0,0,0,.25);pointer-events:none;`;
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 2500);
    }

    // ── Main function ───────────────────────────────────
    window.showPremiumAIModal = function (title, content, question) {
        _currentContent = content;

        // Remove existing
        document.querySelectorAll('.global-ai-modal').forEach(e => e.remove());

        const formatted = formatAIContent(content);

        const modal = document.createElement('div');
        modal.className = 'global-ai-modal';
        modal.style.cssText = `
            position:fixed;top:0;left:0;width:100%;height:100%;
            background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);
            -webkit-backdrop-filter:blur(8px);z-index:9999999;
            display:flex;align-items:center;justify-content:center;padding:16px;
            animation:aiModalIn .3s cubic-bezier(.34,1.56,.64,1);
        `;

        modal.innerHTML = `
            <style>
                @keyframes aiModalIn { from{opacity:0;transform:scale(.92)} to{opacity:1;transform:scale(1)} }
                .global-ai-modal .ai-m-body::-webkit-scrollbar{width:4px}
                .global-ai-modal .ai-m-body::-webkit-scrollbar-track{background:transparent}
                .global-ai-modal .ai-m-body::-webkit-scrollbar-thumb{background:${THEME.primary}44;border-radius:4px}
                .global-ai-modal .ai-copy-btn:active, .global-ai-modal .ai-close-btn:active { transform: scale(0.96); }
            </style>
            <div style="background:#E8F5E9;width:100%;max-width:520px;max-height:92vh;border-radius:32px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,0.4);display:flex;flex-direction:column;border:1px solid rgba(10,84,56,0.1);">
                
                <!-- Header -->
                <div style="background:${THEME.primary};padding:22px 24px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <span style="font-size:22px;">✨</span>
                        <h3 style="color:white;margin:0;font-size:22px;font-weight:900;letter-spacing:-0.5px;">AI বিস্তারিত</h3>
                    </div>
                    <button onclick="this.closest('.global-ai-modal').remove()" style="background:rgba(255,255,255,0.15);border:none;width:44px;height:44px;border-radius:50%;cursor:pointer;color:white;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s;backdrop-filter:blur(5px);">
                        <span class="material-symbols-rounded" style="font-size:24px;">close</span>
                    </button>
                </div>

                <!-- AI Content Area -->
                <div class="ai-m-body" style="padding:28px 24px;overflow-y:auto;flex:1;font-size:16px;line-height:1.9;color:#2d3436;background:#f0f7f0;">
                    
                    ${title ? `<h2 style="color:${THEME.primary};margin:0 0 20px 0;font-size:20px;font-weight:800;line-height:1.4;border-bottom:2px solid ${THEME.primary}33;padding-bottom:15px;font-family: 'Noto Serif Bengali', serif;">${title}</h2>` : ''}
                    
                    ${question ? `
                    <!-- Question Context -->
                    <div style="background:rgba(10,84,56,0.06);padding:16px;border-radius:16px;margin-bottom:24px;border-left:5px solid ${THEME.gold};">
                        <div style="font-size:13px;font-weight:800;color:${THEME.primary};text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">বিষয়বস্তু</div>
                        <div style="font-size:15px;font-weight:600;color:#2d3436;line-height:1.6;">${question}</div>
                    </div>` : ''}

                    <div style="font-family: 'Noto Sans Bengali', sans-serif;">
                        ${formatted}
                    </div>
                </div>

                <!-- Footer Buttons -->
                <div style="padding:20px 24px;border-top:1px solid rgba(10,84,56,0.1);display:flex;gap:14px;flex-shrink:0;background:white;">
                    <button onclick="window._aiModalCopy()" class="ai-copy-btn" style="flex:1;padding:16px;border:2px solid ${THEME.primary};border-radius:18px;background:white;color:${THEME.primary};font-size:15px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;font-family:inherit;transition:all .2s;box-shadow: 0 4px 0 ${THEME.primary}15;">
                        <span class="material-symbols-rounded" style="font-size:20px;">content_copy</span> কপি
                    </button>
                    <button onclick="this.closest('.global-ai-modal').remove()" class="ai-close-btn" style="flex:1;padding:16px;border:none;border-radius:18px;background:${THEME.primary};color:white;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;box-shadow:0 8px 20px rgba(10,84,56,0.3);transition:all .2s;">
                        বন্ধ করুন
                    </button>
                </div>
            </div>
        `;

        window._aiModalCopy = () => copyToClip(_currentContent);
        document.body.appendChild(modal);
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    };

    // ── Inline AI card (for quran.html ayah/hadith inline display) ─
    // Returns HTML string for an inline answer card below a card
    window.createInlineAICard = function (title, content) {
        const formatted = formatAIContent(content);
        return `
        <div class="ai-answer-card" style="margin-top:12px;background:linear-gradient(135deg,#E8F5E9,#D1FAE5);border-radius:18px;border:1px solid rgba(10,84,56,.15);overflow:hidden;animation:fadeUp .4s ease both;">
            <div style="background:linear-gradient(135deg,${THEME.primary},${THEME.primaryLight});padding:14px 16px;display:flex;justify-content:space-between;align-items:center;">
                <div style="color:white;font-size:14px;font-weight:800;display:flex;align-items:center;gap:8px;">
                    <span style="font-size:16px;">✨</span> ${title}
                </div>
                <button onclick="this.closest('.ai-answer-card').remove()" style="background:rgba(255,255,255,.2);border:none;width:30px;height:30px;border-radius:50%;cursor:pointer;color:white;display:flex;align-items:center;justify-content:center;">
                    <span class="material-symbols-rounded" style="font-size:16px;">close</span>
                </button>
            </div>
            <div style="padding:16px;font-size:14px;line-height:1.85;color:#1f2937;max-height:320px;overflow-y:auto;">${formatted}</div>
            <div style="padding:10px 14px;border-top:1px solid rgba(10,84,56,.1);display:flex;justify-content:flex-end;">
                <button onclick="navigator.clipboard?.writeText('${content.replace(/'/g, "\\'")}');window._aiToast?.('✓ কপি হয়েছে!')" style="padding:8px 16px;border:1.5px solid ${THEME.primary};border-radius:10px;background:white;color:${THEME.primary};font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:6px;">
                    <span class="material-symbols-rounded" style="font-size:16px;">content_copy</span> কপি
                </button>
            </div>
        </div>`;
    };


    window._aiToast = function (msg) {
        _showToast(msg);
    };

})();

// User Requested Strict AI Modal
window.UI = {
    showAIModal: function (title, question, answer) {
        // আগের কোনো মডাল থাকলে রিমুভ করা
        const existingModal = document.getElementById('ai-strict-modal');
        if (existingModal) existingModal.remove();

        // ব্যাকগ্রাউন্ড ওভারলে (পেছনে কালো সলিড ছায়া)
        const overlay = document.createElement('div');
        overlay.id = 'ai-strict-modal';
        overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center;
      z-index: 999999; padding: 20px; box-sizing: border-box;
      font-family: 'Hind Siliguri', Arial, sans-serif;
    `;

        // উত্তরের সাব-হেডিংগুলো স্ক্রিনশটের মতো গাঢ় সবুজ করার জন্য ফরম্যাটিং
        const formattedAnswer = answer
            .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #175033; font-size: 17px; display: block; margin-top: 20px; margin-bottom: 8px;">$1</strong>')
            .replace(/\n/g, '<br>');

        // মডালের মূল ডিজাইন (স্ক্রিনশটের হুবহু কালার কোড)
        overlay.innerHTML = `
      <div style="background: #E6F0EA; /* স্ক্রিনশটের হুবহু হালকা সবুজ */ border-radius: 16px; width: 100%; max-width: 450px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3); display: flex; flex-direction: column; max-height: 85vh;">
        
        <div style="background: #1A5738; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; color: white;">
          <div style="font-size: 18px; font-weight: bold; display: flex; align-items: center; gap: 8px;">
            ${title}
          </div>
          <button onclick="document.getElementById('ai-strict-modal').remove()" style="background: rgba(255, 255, 255, 0.2); border: none; width: 32px; height: 32px; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold;">
            ✕
          </button>
        </div>

        <div style="padding: 24px; overflow-y: auto; color: #2A3B32; line-height: 1.7; font-size: 15px;">
          <h3 style="color: #175033; font-size: 20px; margin: 0 0 12px 0; font-weight: bold; line-height: 1.4;">
            ${question}
          </h3>
          <div style="height: 2px; background: #175033; margin-bottom: 24px; width: 100%;"></div>
          
          <div style="color: #2A3B32;">
            ${formattedAnswer}
          </div>
        </div>

        <div style="padding: 16px 24px; display: flex; gap: 12px; border-top: 1px solid rgba(26, 87, 56, 0.1); background: #E6F0EA;">
          <button id="ai-copy-btn" style="flex: 1; padding: 12px; border: 1.5px solid #1A5738; background: white; color: #1A5738; border-radius: 8px; font-weight: bold; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
             <span class="material-symbols-rounded" style="font-size: 18px;">content_copy</span> কপি
          </button>
          
          <button onclick="document.getElementById('ai-strict-modal').remove()" style="flex: 1; padding: 12px; border: none; background: #1A5738; color: white; border-radius: 8px; font-weight: bold; font-size: 15px; cursor: pointer;">
            বন্ধ করুন
          </button>
        </div>
      </div>
    `;

        document.body.appendChild(overlay);

        // "কপি" বাটনের লজিক
        const copyBtn = document.getElementById('ai-copy-btn');
        copyBtn.onclick = function () {
            const cleanText = answer.replace(/\*\*/g, '').replace(/<br>/g, '\n');
            navigator.clipboard.writeText(cleanText).then(() => {
                const originalHtml = copyBtn.innerHTML;
                copyBtn.innerHTML = '✓ কপি হয়েছে';
                copyBtn.style.background = '#1A5738';
                copyBtn.style.color = 'white';
                setTimeout(() => {
                    copyBtn.innerHTML = originalHtml;
                    copyBtn.style.background = 'white';
                    copyBtn.style.color = '#1A5738';
                }, 2000);
            });
        };
    }
};
