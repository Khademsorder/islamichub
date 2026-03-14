/**
 * misconceptions-module.js (UPGRADED)
 * Islamic Premium UI with Glassmorphism
 */

const MisconceptionsModule = (function () {
  let data = null;
  let currentCategory = null;
  let currentQuestion = null;
  let mainContainer = null;
  let categoryGrid, questionList, detailView;

  // Premium Islamic Theme
  const THEME = {
    primary: '#064e3b', // Deep Islamic Green
    primaryLight: '#059669',
    accent: '#10b981',
    gold: '#fbbf24',
    softGreenStart: '#f0fdf4',
    softGreenEnd: '#dcfce7',
    glassWhite: 'rgba(255, 255, 255, 0.92)',
    glassBorder: 'rgba(255, 255, 255, 0.2)',
    glassShadow: '0 12px 40px rgba(6, 78, 59, 0.15)'
  };

  const glassCardStyle = `
    background: ${THEME.glassWhite};
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid ${THEME.glassBorder};
    border-radius: 24px;
    box-shadow: ${THEME.glassShadow};
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  `;

  function ensureContainers() {
    mainContainer = document.getElementById('misconceptionsContainer');
    if (!mainContainer) {
      console.error('misconceptionsContainer not found!');
      return false;
    }

    // Make sure container is visible when initialized
    mainContainer.style.cssText = `
      display: block; 
      background: url('img/topics-premium-bg.png') center/cover no-repeat fixed;
      position: relative;
    `;
    const overlay = document.createElement('div');
    overlay.style.cssText = `position:absolute; inset:0; background:rgba(240, 253, 244, 0.4); backdrop-filter:blur(2px); z-index:0;`;
    mainContainer.prepend(overlay);
    [categoryGrid, questionList, detailView].forEach(el => { if (el) el.style.position = 'relative'; if (el) el.style.zIndex = '1'; });

    if (!document.getElementById('catGrid-mc')) {
      categoryGrid = document.createElement('div');
      categoryGrid.id = 'catGrid-mc';
      categoryGrid.className = 'grid';
      mainContainer.appendChild(categoryGrid);
    } else {
      categoryGrid = document.getElementById('catGrid-mc');
    }

    if (!document.getElementById('qList-mc')) {
      questionList = document.createElement('div');
      questionList.id = 'qList-mc';
      questionList.style.display = 'none';
      questionList.className = 'grid';
      mainContainer.appendChild(questionList);
    } else {
      questionList = document.getElementById('qList-mc');
    }

    if (!document.getElementById('detailView-mc')) {
      detailView = document.createElement('div');
      detailView.id = 'detailView-mc';
      detailView.style.display = 'none';
      mainContainer.appendChild(detailView);
    } else {
      detailView = document.getElementById('detailView-mc');
    }
    return true;
  }

  // Back button handling
  function handleBackButton() {
    if (detailView && detailView.style.display === 'block') {
      backToQuestions();
      return true;
    }
    if (questionList && questionList.style.display === 'grid') {
      backToCategories();
      return true;
    }
    return false;
  }

  // Listen for browser back button
  if (typeof window !== 'undefined') {
    window.addEventListener('popstate', handleBackButton);
  }

  async function loadData() {
    if (data) return data;
    try {
      data = window.misconceptionsData;
      if (!data) {
        console.error('misconceptionsData is undefined');
      }
      return data;
    } catch (e) {
      console.error("Failed to load misconceptions data", e);
      return null;
    }
  }

  async function renderCategories() {
    if (!ensureContainers()) return;
    if (!data) await loadData();
    if (!data || !data.categories) {
      categoryGrid.innerHTML = '<div style="text-align:center; padding:40px; color:#666;">ডেটা লোড হয়নি</div>';
      return;
    }

    let html = `
      <div style="grid-column:1/-1; margin-bottom:20px;">
        <h2 style="color:${THEME.primary}; font-size:24px; font-weight:900; margin:0 0 8px; display:flex; align-items:center; gap:12px;">
          <span style="width:48px; height:48px; background:linear-gradient(135deg,${THEME.primary},${THEME.primaryLight}); border-radius:16px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px ${THEME.primary}33;">
            <span class="material-symbols-rounded" style="color:white; font-size:26px;">psychology</span>
          </span>
          দ্বীনি ভুল ধারণা ও সংশয়
        </h2>
        <p style="font-size:14px; color:#666; margin:0;">কোরআন ও সুন্নাহর আলোকে সঠিক দিকনির্দেশনা</p>
      </div>
    `;

    data.categories.forEach(cat => {
      html += `
        <div onclick="MisconceptionsModule.showCategory('${cat.id}')" style="${glassCardStyle}; padding:24px 16px; cursor:pointer; text-align:center; display:flex; flex-direction:column; align-items:center; position:relative; overflow:hidden;" onmouseover="this.style.transform='translateY(-8px)'; this.style.boxShadow='0 20px 48px rgba(6,78,59,0.25)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='${THEME.glassShadow}'">
          <div style="position:absolute; inset:0; background:url('img/topics-premium-bg.png') center/cover; opacity:0.1; z-index:0; pointer-events:none;"></div>
          <div style="position:relative; z-index:1; width:72px; height:72px; background:linear-gradient(135deg,${cat.color},${cat.color}cc); border-radius:24px; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; font-size:36px; box-shadow:0 8px 24px ${cat.color}44; color:white;">
            ${cat.icon}
          </div>
          <h3 style="position:relative; z-index:1; margin:0 0 8px; color:${THEME.primary}; font-size:19px; font-weight:900;">${cat.name}</h3>
          <span style="position:relative; z-index:1; font-size:12px; font-weight:800; color:${cat.color}; background:${cat.color}15; padding:6px 16px; border-radius:20px; border:1px solid ${cat.color}33;">${cat.questions.length} টি আলোচনা</span>
        </div>
      `;
    });
    categoryGrid.innerHTML = html;
    categoryGrid.style.display = 'grid';
    categoryGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
    categoryGrid.style.gap = '16px';
    questionList.style.display = 'none';
    detailView.style.display = 'none';
  }

  async function showCategory(catId) {
    if (!data) await loadData();
    const cat = data.categories.find(c => c.id === catId);
    if (!cat) return;

    currentCategory = cat;
    categoryGrid.style.display = 'none';
    questionList.style.display = 'grid';
    questionList.style.gridTemplateColumns = 'repeat(2, 1fr)';
    questionList.style.gap = '16px';
    detailView.style.display = 'none';

    // Add to history for back button
    if (window.history) {
      window.history.pushState({ view: 'misconception', category: catId }, '', '#misconception-' + catId);
    }

    let html = `
      <div style="grid-column:1/-1; margin-bottom:20px; display:flex; align-items:center; gap:16px;">
        <button onclick="MisconceptionsModule.backToCategories()" style="${glassCardStyle}; width:48px; height:48px; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; border-radius:14px; color:${THEME.primary};">
          <span class="material-symbols-rounded" style="font-weight:700;">arrow_back</span>
        </button>
        <div>
          <h2 style="color:${cat.color}; margin:0; font-size:22px; font-weight:900;">${cat.name}</h2>
          <span style="font-size:12px; color:#666; font-weight:600;">${cat.questions.length} টি সাধারণ সংশয়</span>
        </div>
      </div>
    `;

    cat.questions.forEach(q => {
      html += `
        <div onclick="MisconceptionsModule.showQuestion('${q.id}')" style="${glassCardStyle}; padding:24px 20px; cursor:pointer; display:flex; flex-direction:column; justify-content:space-between; min-height:200px; position:relative; overflow:hidden;" onmouseover="this.style.background='white'; this.style.transform='translateY(-5px)';" onmouseout="this.style.background='${THEME.glassWhite}'; this.style.transform='translateY(0)';">
          <div style="position:absolute; inset:0; background:url('img/topics-premium-bg.png') center/cover; opacity:0.05; z-index:0; pointer-events:none;"></div>
          <div style="position:relative; z-index:1; font-weight:900; color:${THEME.primary}; font-size:16px; line-height:1.7; margin-bottom:16px; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">${q.q}</div>
          <div style="position:relative; z-index:1; display:flex; justify-content:space-between; align-items:center; margin-top:auto;">
            <div style="display:inline-block; background:${getTrustColor(q.trust_rating)}15; color:${getTrustColor(q.trust_rating)}; padding:6px 14px; border-radius:20px; font-size:12px; font-weight:900; border:1px solid ${getTrustColor(q.trust_rating)}33;">
              বিশ্বাস: ${q.trust_rating}/10
            </div>
            <span class="material-symbols-rounded" style="font-size:22px; color:white; background:linear-gradient(135deg,${cat.color},${cat.color}cc); width:36px; height:36px; border-radius:12px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px ${cat.color}33;">arrow_forward</span>
          </div>
        </div>
      `;
    });
    questionList.innerHTML = html;
  }

  function getTrustColor(rating) {
    if (rating >= 9) return '#10b981';
    if (rating >= 7) return '#f59e0b';
    return '#ef4444';
  }

  async function showQuestion(qid) {
    if (!currentCategory) return;
    const q = currentCategory.questions.find(q => q.id === qid);
    if (!q) return;

    currentQuestion = q;
    questionList.style.display = 'none';
    detailView.style.display = 'block';

    // Add to history
    if (window.history) {
      window.history.pushState({ view: 'misconception', category: currentCategory.id, question: qid }, '', '#misconception-' + currentCategory.id + '-' + qid);
    }

    let madhabHtml = '';
    if (q.madhhab) {
      let options = '<option value="">মাযহাব নির্বাচন করুন</option>';
      for (let mad in q.madhhab) {
        options += `<option value="${mad}">${mad}</option>`;
      }
      madhabHtml = `
        <div style="margin:20px 0;">
          <select id="madhabSelect" onchange="MisconceptionsModule.showMadhabNote(this.value)" style="width:100%; padding:14px; border-radius:14px; border:2px solid ${THEME.glassBorder}; background:rgba(255,255,255,0.7); color:${THEME.primary}; font-family:inherit; font-size:15px; backdrop-filter:blur(5px);">
            ${options}
          </select>
          <div id="madhabNote" style="margin-top:12px; padding:16px; ${glassCardStyle}; display:none; font-size:14px; border-left:4px solid ${THEME.gold};"></div>
        </div>
      `;
    }

    const answerHtml = q.a.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');

    detailView.innerHTML = `
      <div style="margin-bottom:16px;">
        <button onclick="MisconceptionsModule.backToQuestions()" style="${glassCardStyle}; border:none; cursor:pointer; padding:12px 20px; display:flex; align-items:center; gap:8px; color:${THEME.primary}; font-weight:600;">
          <span class="material-symbols-rounded">arrow_back</span>
          প্রশ্ন তালিকায় ফিরুন
        </button>
      </div>
      
      <div style="${glassCardStyle}; padding:24px;">
        <div style="display:flex; align-items:flex-start; gap:14px; margin-bottom:20px;">
          <div style="width:48px; height:48px; background:linear-gradient(135deg,${currentCategory.color},${currentCategory.color}cc); border-radius:14px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            <span class="material-symbols-rounded" style="color:white; font-size:26px;">help</span>
          </div>
          <div>
            <h3 style="margin:0; color:${THEME.primary}; font-size:18px; font-weight:700;">${q.q}</h3>
            <span style="background:${getTrustColor(q.trust_rating)}; color:#fff; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:600; margin-top:8px; display:inline-block;">★ বিশ্বাসযোগ্যতা: ${q.trust_rating}/10</span>
          </div>
        </div>
        
        <div style="font-size:16px; line-height:1.8; color:#333; padding:20px; background:rgba(255,255,255,0.5); border-radius:16px; margin-bottom:16px;">
          ${answerHtml}
        </div>
        
        <div style="font-size:13px; color:#666; background:rgba(0,0,0,0.03); padding:14px; border-radius:12px; margin-bottom:8px;">
          <strong style="color:${THEME.primary};">📚 তথ্যসূত্র:</strong> ${q.ref || 'উল্লেখিত নয়'}
        </div>
        
        ${madhabHtml}
        
        <div style="margin-top:24px; padding-top:20px; border-top:1px dashed rgba(0,0,0,0.1); display:flex; gap:12px; flex-wrap:wrap;">
          <button onclick="MisconceptionsModule.expandAnswer(this)" style="flex:1; min-width:140px; padding:14px 20px; border:none; border-radius:14px; background:linear-gradient(135deg,${THEME.primary},${THEME.primaryLight}); color:white; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 15px rgba(10,84,56,0.3);">
            ✨ AI বিস্তারিত
          </button>
          <button onclick="MisconceptionsModule.copyAnswer()" style="flex:1; min-width:140px; padding:14px 20px; border:2px solid ${THEME.primary}; border-radius:14px; background:rgba(255,255,255,0.8); color:${THEME.primary}; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; backdrop-filter:blur(5px);">
            <span class="material-symbols-rounded" style="font-size:20px;">content_copy</span> কপি
          </button>
        </div>
      </div>
    `;
  }

  function copyAnswer() {
    if (!currentQuestion) return;
    navigator.clipboard.writeText(currentQuestion.a).then(() => {
      showCustomToast('কপি হয়েছে! ✓');
    }).catch(() => {
      showCustomToast('কপি করতে সমস্যা হয়েছে');
    });
  }

  function showCustomToast(msg) {
    const existing = document.querySelector('.mc-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'mc-toast';
    toast.style.cssText = `
      position:fixed;top:max(20px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);
      background:linear-gradient(135deg,${THEME.primary},${THEME.primaryLight});color:white;
      padding:14px 28px;border-radius:50px;z-index:999999;
      font-size:14px;font-weight:700;box-shadow:0 8px 24px rgba(10,84,56,0.3);
      display:flex;align-items:center;gap:8px;animation:toastSlideIn 0.3s ease;
    `;
    toast.innerHTML = `<span class="material-symbols-rounded" style="font-size:18px;">info</span><span>${msg}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'toastSlideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 1000);
  }

  function showMadhabNote(madhab) {
    const noteDiv = document.getElementById('madhabNote');
    if (!madhab || !currentQuestion || !currentQuestion.madhhab) {
      if (noteDiv) noteDiv.style.display = 'none';
      return;
    }
    const note = currentQuestion.madhhab[madhab];
    if (note) {
      noteDiv.innerHTML = `<strong>${madhab}:</strong> ${note}`;
      noteDiv.style.display = 'block';
    } else {
      if (noteDiv) noteDiv.style.display = 'none';
    }
  }

  function backToQuestions() {
    detailView.style.display = 'none';
    questionList.style.display = 'grid';
    questionList.style.gridTemplateColumns = 'repeat(2, 1fr)';
    questionList.style.gap = '12px';
    if (window.history) {
      window.history.back();
    }
  }

  function backToCategories() {
    detailView.style.display = 'none';
    questionList.style.display = 'none';
    categoryGrid.style.display = 'grid';
    if (window.history) {
      window.history.back();
    }
  }

  async function expandAnswer(btnElement) {
    if (!currentQuestion) return;

    // ক্যাশ সিস্টেম: আগে চেক করবে এই প্রশ্নের উত্তর আগে থেকে সেভ করা আছে কিনা
    const cacheKey = 'ai_ans_' + currentQuestion.id;
    const cachedAnswer = localStorage.getItem(cacheKey);

    if (cachedAnswer) {
      // যদি ক্যাশে থাকে, তাহলে সরাসরি দেখিয়ে দেবে (API কল করবে না)
      UI.showAIModal(`✨ AI বিস্তারিত`, currentQuestion.q, cachedAnswer);
      return;
    }

    const originalHTML = btnElement.innerHTML;
    btnElement.disabled = true;
    btnElement.innerHTML = '<span class="material-symbols-rounded">hourglass_top</span> লেখা হচ্ছে...';

    // Strict Prompt: ডাটাবেসের বাইরে না যাওয়ার লজিক
    const prompt = `তুমি একজন সহকারী। তোমাকে কঠোরভাবে নির্দেশ দেওয়া হচ্ছে যে, তুমি শুধুমাত্র নিচের 'প্রশ্ন' এবং 'প্রদত্ত ডাটাবেসের উত্তর' এর উপর ভিত্তি করে বিস্তারিত লিখবে। এর বাইরে ইন্টারনেট, তোমার পূর্বের জ্ঞান বা অন্য কোনো সোর্স থেকে কোনো হাদিস, আয়াত বা স্কলারের নাম মনগড়াভাবে যুক্ত করা সম্পূর্ণ নিষেধ।

প্রশ্ন: ${currentQuestion.q}
প্রদত্ত ডাটাবেসের উত্তর: ${currentQuestion.a}

নির্দেশনা:
১. শুধুমাত্র 'প্রদত্ত ডাটাবেসের উত্তর' এ যে তথ্যগুলো দেওয়া আছে, সেগুলোকে একটু সহজ ও বিস্তারিত করে বুঝিয়ে লেখো। 
২. বাইরের কোনো তথ্য বা দলিল (Ref) দেওয়া যাবে না। ডাটাবেসে যে রেফারেন্স আছে, শুধু সেটাই ব্যবহার করবে।
৩. উত্তরটি সুন্দরভাবে "ভূমিকা" এবং "মূল আলোচনা" আকারে পয়েন্ট করে লিখবে।
৪. যদি ডাটাবেসের উত্তরে বিস্তারিত করার মতো কিছু না থাকে, তবে যা আছে ঠিক ততটুকুই সুন্দর করে গুছিয়ে দেবে, নিজের থেকে কিছু বানাবে না।`;

    try {
      const ans = await callGeminiAPI(prompt);
      if (ans) {
        // নতুন উত্তর আসলে তা ক্যাশে সেভ করে রাখা
        localStorage.setItem(cacheKey, ans);
        UI.showAIModal(`✨ AI বিস্তারিত`, currentQuestion.q, ans);
      } else {
        showCustomToast('AI উত্তর পাওয়া যায়নি');
      }
    } catch (e) {
      console.error('AI Error:', e);
      showCustomToast('AI কল ব্যর্থ: ' + e.message);
    } finally {
      btnElement.disabled = false;
      btnElement.innerHTML = originalHTML;
    }
  }

  // ক্যাশ রিমুভ করার ফাংশন
  window.clearAICache = function () {
    for (let key in localStorage) {
      if (key.startsWith('ai_ans_')) {
        localStorage.removeItem(key);
      }
    }
    console.log("AI Cache Removed Successfully!");
  };

  // ═══ AI CACHE SYSTEM ═══
  const AICache = {
    getKey: (qid) => `ai_mc_cache_${qid}`,

    get: function (qid) {
      try {
        const cached = localStorage.getItem(this.getKey(qid));
        if (cached) {
          const data = JSON.parse(cached);
          return data.answer;
        }
      } catch (e) { }
      return null;
    },

    set: function (qid, answer) {
      try {
        localStorage.setItem(this.getKey(qid), JSON.stringify({
          answer: answer,
          timestamp: Date.now()
        }));
      } catch (e) { }
    },

    clear: function (qid) {
      try {
        localStorage.removeItem(this.getKey(qid));
      } catch (e) { }
    }
  };

  // ═══ GEMINI API CALL ═══

  const GEMINI_KEYS = [
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

  async function callGeminiAPI(prompt) {
    const useCustomKey = localStorage.getItem('useCustomAPIKey') === 'true';
    const userKey = localStorage.getItem('geminiKey');

    let keysToTry = [];
    if (useCustomKey && userKey) {
      keysToTry = [userKey];
    } else {
      keysToTry = [...GEMINI_KEYS].sort(() => 0.5 - Math.random());
    }

    for (const key of keysToTry) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
          })
        });

        if (!res.ok) continue;

        const data = await res.json();
        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return data.candidates[0].content.parts[0].text;
        }
      } catch (e) {
        console.warn('Key failed:', e.message);
      }
    }
    throw new Error('সব API কী ব্যর্থ হয়েছে');
  }

  return {
    init: async function () {
      ensureContainers();
      await loadData();
      renderCategories();
    },
    renderCategories,
    showCategory,
    showQuestion,
    backToQuestions,
    backToCategories,
    showMadhabNote,
    expandAnswer,
    copyAnswer
  };
})();

window.MisconceptionsModule = MisconceptionsModule;
