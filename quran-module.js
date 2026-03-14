(function (global) {
  const DB_NAME = 'IslamicKnowledgeCoreStore';
  let dbInstance = null;

  const QARI_LIST = [
    { id: 'ar.alafasy', name: 'Mishary Alafasy' },
    { id: 'ar.husary', name: 'Husary' },
    { id: 'ar.parhizgar', name: 'Parhizgar' },
    { id: 'ar.minshawi', name: 'Minshawi' }
  ];
  let currentQari = localStorage.getItem('preferredQari') || 'ar.alafasy';
  // Validation: if stored qari is no longer in list, reset to default
  if (!QARI_LIST.some(q => q.id === currentQari)) {
    currentQari = 'ar.alafasy';
    localStorage.setItem('preferredQari', currentQari);
  }
  let autoAdvanceEnabled = localStorage.getItem('autoAdvance') === 'true';

  const PARA_MAP = {
    1: [{ surah: 1, start: 1, end: 7 }, { surah: 2, start: 1, end: 141 }],
    2: [{ surah: 2, start: 142, end: 252 }],
    3: [{ surah: 2, start: 253, end: 286 }, { surah: 3, start: 1, end: 92 }],
    4: [{ surah: 3, start: 93, end: 200 }, { surah: 4, start: 1, end: 23 }],
    5: [{ surah: 4, start: 24, end: 147 }],
    6: [{ surah: 4, start: 148, end: 176 }, { surah: 5, start: 1, end: 81 }],
    7: [{ surah: 5, start: 82, end: 120 }, { surah: 6, start: 1, end: 110 }],
    8: [{ surah: 6, start: 111, end: 165 }, { surah: 7, start: 1, end: 87 }],
    9: [{ surah: 7, start: 88, end: 206 }, { surah: 8, start: 1, end: 40 }],
    10: [{ surah: 8, start: 41, end: 75 }, { surah: 9, start: 1, end: 92 }],
    11: [{ surah: 9, start: 93, end: 129 }, { surah: 10, start: 1, end: 109 }, { surah: 11, start: 1, end: 5 }],
    12: [{ surah: 11, start: 6, end: 123 }, { surah: 12, start: 1, end: 52 }],
    13: [{ surah: 12, start: 53, end: 111 }, { surah: 13, start: 1, end: 43 }, { surah: 14, start: 1, end: 52 }],
    14: [{ surah: 15, start: 1, end: 99 }, { surah: 16, start: 1, end: 128 }],
    15: [{ surah: 17, start: 1, end: 111 }, { surah: 18, start: 1, end: 74 }],
    16: [{ surah: 18, start: 75, end: 110 }, { surah: 19, start: 1, end: 98 }, { surah: 20, start: 1, end: 135 }],
    17: [{ surah: 21, start: 1, end: 112 }, { surah: 22, start: 1, end: 78 }],
    18: [{ surah: 23, start: 1, end: 118 }, { surah: 24, start: 1, end: 64 }, { surah: 25, start: 1, end: 20 }],
    19: [{ surah: 25, start: 21, end: 77 }, { surah: 26, start: 1, end: 227 }, { surah: 27, start: 1, end: 55 }],
    20: [{ surah: 27, start: 56, end: 93 }, { surah: 28, start: 1, end: 88 }, { surah: 29, start: 1, end: 45 }],
    21: [{ surah: 29, start: 46, end: 69 }, { surah: 30, start: 1, end: 60 }, { surah: 31, start: 1, end: 34 }, { surah: 32, start: 1, end: 30 }, { surah: 33, start: 1, end: 30 }],
    22: [{ surah: 33, start: 31, end: 73 }, { surah: 34, start: 1, end: 54 }, { surah: 35, start: 1, end: 45 }, { surah: 36, start: 1, end: 27 }],
    23: [{ surah: 36, start: 28, end: 83 }, { surah: 37, start: 1, end: 182 }, { surah: 38, start: 1, end: 88 }, { surah: 39, start: 1, end: 31 }],
    24: [{ surah: 39, start: 32, end: 75 }, { surah: 40, start: 1, end: 85 }, { surah: 41, start: 1, end: 46 }],
    25: [{ surah: 41, start: 47, end: 54 }, { surah: 42, start: 1, end: 53 }, { surah: 43, start: 1, end: 89 }, { surah: 44, start: 1, end: 59 }, { surah: 45, start: 1, end: 37 }],
    26: [{ surah: 46, start: 1, end: 35 }, { surah: 47, start: 1, end: 38 }, { surah: 48, start: 1, end: 29 }, { surah: 49, start: 1, end: 18 }, { surah: 50, start: 1, end: 45 }, { surah: 51, start: 1, end: 30 }],
    27: [{ surah: 51, start: 31, end: 60 }, { surah: 52, start: 1, end: 49 }, { surah: 53, start: 1, end: 62 }, { surah: 54, start: 1, end: 55 }, { surah: 55, start: 1, end: 78 }, { surah: 56, start: 1, end: 96 }, { surah: 57, start: 1, end: 29 }],
    28: [{ surah: 58, start: 1, end: 22 }, { surah: 59, start: 1, end: 24 }, { surah: 60, start: 1, end: 13 }, { surah: 61, start: 1, end: 14 }, { surah: 62, start: 1, end: 11 }, { surah: 63, start: 1, end: 11 }, { surah: 64, start: 1, end: 18 }, { surah: 65, start: 1, end: 12 }, { surah: 66, start: 1, end: 12 }],
    29: [{ surah: 67, start: 1, end: 30 }, { surah: 68, start: 1, end: 52 }, { surah: 69, start: 1, end: 52 }, { surah: 70, start: 1, end: 44 }, { surah: 71, start: 1, end: 28 }, { surah: 72, start: 1, end: 28 }, { surah: 73, start: 1, end: 20 }, { surah: 74, start: 1, end: 56 }, { surah: 75, start: 1, end: 40 }, { surah: 76, start: 1, end: 31 }, { surah: 77, start: 1, end: 50 }],
    30: [{ surah: 78, start: 1, end: 40 }, { surah: 79, start: 1, end: 46 }, { surah: 80, start: 1, end: 42 }, { surah: 81, start: 1, end: 29 }, { surah: 82, start: 1, end: 19 }, { surah: 83, start: 1, end: 36 }, { surah: 84, start: 1, end: 25 }, { surah: 85, start: 1, end: 22 }, { surah: 86, start: 1, end: 17 }, { surah: 87, start: 1, end: 19 }, { surah: 88, start: 1, end: 26 }, { surah: 89, start: 1, end: 30 }, { surah: 90, start: 1, end: 20 }, { surah: 91, start: 1, end: 15 }, { surah: 92, start: 1, end: 21 }, { surah: 93, start: 1, end: 11 }, { surah: 94, start: 1, end: 8 }, { surah: 95, start: 1, end: 8 }, { surah: 96, start: 1, end: 19 }, { surah: 97, start: 1, end: 5 }, { surah: 98, start: 1, end: 8 }, { surah: 99, start: 1, end: 8 }, { surah: 100, start: 1, end: 11 }, { surah: 101, start: 1, end: 11 }, { surah: 102, start: 1, end: 8 }, { surah: 103, start: 1, end: 3 }, { surah: 104, start: 1, end: 9 }, { surah: 105, start: 1, end: 5 }, { surah: 106, start: 1, end: 4 }, { surah: 107, start: 1, end: 7 }, { surah: 108, start: 1, end: 3 }, { surah: 109, start: 1, end: 6 }, { surah: 110, start: 1, end: 3 }, { surah: 111, start: 1, end: 5 }, { surah: 112, start: 1, end: 4 }, { surah: 113, start: 1, end: 5 }, { surah: 114, start: 1, end: 6 }]
  };

  const HADITH_TOPICS = [
    { id: 'iman', name: 'ঈমান ও আকীদা', keywords: ['ঈমান', 'আকীদা', 'তাওহীদ', 'শিরক', 'কুফর', 'মুনাফিক', 'আল্লাহ', 'রাসূল', 'ফেরেশতা', 'কিতাব', 'আখিরাত', 'তকদির', 'ভাগ্য'] },
    { id: 'ilm', name: 'ইল্ম ও জ্ঞান', keywords: ['ইল্ম', 'জ্ঞান', 'শিক্ষা', 'আলিম', 'মুহাদ্দিস', 'ফকীহ', 'মাদরাসা', 'দারস', 'তালিব'] },
    { id: 'taharah', name: 'পবিত্রতা', keywords: ['পবিত্র', 'ওযু', 'গোসল', 'তায়াম্মুম', 'নাপাক', 'হায়েজ', 'নিফাস', 'ইস্তিনজা', 'মিসওয়াক'] },
    { id: 'salat', name: 'নামাজ', keywords: ['নামাজ', 'সালাত', 'ফরজ', 'সুন্নত', 'নফল', 'ওয়াক্ত', 'রুকু', 'সিজদা', 'তাশাহহুদ', 'সালাম', 'আযান', 'ইকামত', 'জামাত', 'মসজিদ', 'কিবলা', 'ইমাম', 'মুক্তাদি', 'কসর', 'জুমা', 'ঈদ', 'জানাজা', 'তাহাজ্জুদ', 'ইশরাক', 'চাশত', 'তারাবীহ', 'বিতর'] },
    { id: 'zakat', name: 'জাকাত ও সদকা', keywords: ['জাকাত', 'সদকা', 'ফিতরা', 'দান', 'সাওয়াব', 'গরীব', 'মিসকিন', 'ইবনুস সাবীল'] },
    { id: 'sawm', name: 'রোজা', keywords: ['রোজা', 'সিয়াম', 'ইফতার', 'সেহরি', 'রমজান', 'শাওয়াল', 'আশুরা', 'আরাফা', 'কাজা', 'কাফফারা'] },
    { id: 'hajj', name: 'হজ্জ ও উমরাহ', keywords: ['হজ্জ', 'উমরাহ', 'কাবা', 'তাওয়াফ', 'সাফা', 'মারওয়া', 'মীকাত', 'ইহরাম', 'আরাফাত', 'মুযদালিফা', 'মিনা', 'জামরাত', 'কুরবানী', 'সায়ী'] },
    { id: 'nikah', name: 'বিবাহ ও পরিবার', keywords: ['বিবাহ', 'নিকাহ', 'স্ত্রী', 'স্বামী', 'সন্তান', 'তালাক', 'খুলা', 'ইদ্দত', 'মোহর', 'যিহার', "লি'আন"] },
    { id: 'tijarah', name: 'ব্যবসা ও লেনদেন', keywords: ['ক্রয়', 'বিক্রয়', 'ব্যবসা', 'লেনদেন', 'সুদ', 'ঘুষ', 'ইজারা', 'ওয়াকফ', 'উত্তরাধিকার', 'মীরাস', 'ঋণ', 'দেনা', 'প্রতিশ্রুতি'] },
    { id: 'jihad', name: 'জিহাদ ও রাজনীতি', keywords: ['জিহাদ', 'যুদ্ধ', 'খিলাফত', 'ইমামত', 'শাসক', 'প্রজা', 'নেতা', 'সেনা', 'গনীমত', 'ফায়'] },
    { id: 'atima', name: 'খাদ্য ও পানীয়', keywords: ['খাদ্য', 'পানীয়', 'হালাল', 'হারাম', 'জবাই', 'শিকার', 'দুধ', 'মধু'] },
    { id: 'libas', name: 'পোশাক ও সাজসজ্জা', keywords: ['পোশাক', 'কাপড়', 'সতর', 'পর্দা', 'হিজাব', 'সোনা', 'রেশম', 'আংটি', 'মেহেদি'] },
    { id: 'adab', name: 'আদব ও শিষ্টাচার', keywords: ['আদব', 'আখলাক', 'শিষ্টাচার', 'সালাম', 'মুসাফাহা', 'হাঁচি', 'হাই তোলা', 'বসা', 'শোয়া', 'ঘুম'] },
    { id: 'dua', name: 'দোয়া ও যিকির', keywords: ['দোয়া', 'প্রার্থনা', 'যিকির', 'তাসবীহ', 'তাহলীল', 'তাকবীর', 'তাহমীদ', 'ইস্তিগফার', 'দরূদ'] },
    { id: 'tibb', name: 'চিকিৎসা ও রোগ', keywords: ['রোগ', 'চিকিৎসা', 'ঔষধ', 'ঝাড়ফুঁক', 'রুকইয়াহ', 'মৃত্যু', 'জানাযা', 'কবর'] },
    { id: 'fitan', name: 'ফিতনা ও কিয়ামত', keywords: ['ফিতনা', 'দাজ্জাল', 'ইয়াজুজ-মাজুজ', 'কিয়ামত', 'মৃত্যু', 'কবর', 'হাশর', 'জান্নাত', 'জাহান্নাম'] },
    { id: 'tafsir', name: 'তাফসীর ও কুরআন', keywords: ['তাফসীর', 'কুরআন', 'আয়াত', 'সূরা', 'নাযিল', 'ওহী'] },
    { id: 'akhlaq', name: 'নৈতিকতা ও চরিত্র', keywords: ['ভালোবাসা', 'ঘৃণা', 'হিংসা', 'অহংকার', 'বিনয়', 'ক্ষমা', 'রাগ', 'ধৈর্য', 'সত্য', 'মিথ্যা'] }
  ];

  function setQari(qariId) {
    if (QARI_LIST.some(q => q.id === qariId)) {
      currentQari = qariId;
      localStorage.setItem('preferredQari', qariId);
    }
  }

  function toggleAutoAdvance() {
    autoAdvanceEnabled = !autoAdvanceEnabled;
    localStorage.setItem('autoAdvance', autoAdvanceEnabled);
    return autoAdvanceEnabled;
  }


  // --- AI CACHE ---
  async function getAICache(key) {
    try {
      const cache = await getFromDB('keyval', 'isom_ai_cache') || {};
      if (cache[key] && (Date.now() - cache[key].time < 7 * 24 * 60 * 60 * 1000)) { // 7 days cache
        return cache[key].response;
      }
      return null;
    } catch (e) { return null; }
  }

  async function setAICache(key, response) {
    try {
      const cache = await getFromDB('keyval', 'isom_ai_cache') || {};
      cache[key] = { response, time: Date.now() };

      // Limit cache size to 100 items
      const keys = Object.keys(cache);
      if (keys.length > 100) {
        delete cache[keys[0]];
      }
      await saveToDB('keyval', 'isom_ai_cache', cache);
    } catch (e) { }
  }

  async function initDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 4);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('surahs')) db.createObjectStore('surahs', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('ayat')) db.createObjectStore('ayat', { keyPath: 'key' });
        if (!db.objectStoreNames.contains('hadith')) db.createObjectStore('hadith', { keyPath: 'key' });
        if (!db.objectStoreNames.contains('keyval')) db.createObjectStore('keyval', { keyPath: 'id' });
      };
      req.onsuccess = e => { dbInstance = e.target.result; resolve(dbInstance); };
      req.onerror = e => reject(e);
    });
  }

  async function getFromDB(storeName, key) {
    if (!dbInstance) await initDB();
    return new Promise(resolve => {
      const tx = dbInstance.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).get(key);
      req.onsuccess = () => resolve(req.result ? req.result.data : null);
      req.onerror = () => resolve(null);
    });
  }

  async function saveToDB(storeName, key, data, isComplete = false) {
    if (!dbInstance) await initDB();
    return new Promise((resolve, reject) => {
      const tx = dbInstance.transaction(storeName, 'readwrite');
      const obj = { id: key, key: key, data: data }; // both id and key for compatibility
      if (isComplete) obj.isComplete = true;
      const req = tx.objectStore(storeName).put(obj);
      req.onsuccess = () => resolve();
      req.onerror = () => reject();
    });
  }

  async function deleteFromDB(storeName, keyPattern) {
    if (!dbInstance) await initDB();
    return new Promise((resolve, reject) => {
      const tx = dbInstance.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.openCursor();
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (String(cursor.key).startsWith(keyPattern)) cursor.delete();
          cursor.continue();
        } else resolve();
      };
      request.onerror = reject;
    });
  }

  // --- QURAN API ---
  const QuranAPI = {
    getQariList: () => QARI_LIST,
    getCurrentQari: () => currentQari,
    setQari: setQari,
    getAutoAdvance: () => autoAdvanceEnabled,
    toggleAutoAdvance: toggleAutoAdvance,
    _editionId: (entry) => entry?.edition?.identifier || '',
    _byEdition: (entries, wanted) => entries?.find(x => QuranAPI._editionId(x) === wanted) || null,

    _fetchEditions: async (path, editionsCsv) => {
      const url = `https://api.alquran.cloud/v1/${path}/editions/${editionsCsv}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.code !== 200 || !Array.isArray(json.data)) throw new Error("Edition fetch failed");
      return json.data;
    },

    clearSurahCache: async (surahId) => {
      await deleteFromDB('surahs', `${surahId}`);
      await deleteFromDB('ayat', `${surahId}_`);
    },

    clearAllSurahCache: async () => {
      await deleteFromDB('surahs', '');
      await deleteFromDB('ayat', '');
    },

    getSurah: async (surahId) => {
      // Fix: One-time force clear to revert back to original English transliteration
      if (localStorage.getItem('quran_transliteration_v4') !== 'true') {
        await QuranAPI.clearAllSurahCache();
        localStorage.setItem('quran_transliteration_v4', 'true');
      }

      // Check cache first
      if (!dbInstance) await initDB();
      const tx = dbInstance.transaction('surahs', 'readonly');
      const req = tx.objectStore('surahs').get(surahId);

      const cached = await new Promise(r => {
        req.onsuccess = () => r(req.result);
        req.onerror = () => r(null);
      });

      if (cached && cached.isComplete) return cached.data;

      try {
        const audioEdition = currentQari;
        const editions = await QuranAPI._fetchEditions(
          `surah/${surahId}`,
          `quran-uthmani,bn.bengali,bn.transliteration,en.sahih,en.transliteration,${audioEdition}`
        );

        const bn_tr = QuranAPI._byEdition(editions, 'bn.transliteration');
        const ar = QuranAPI._byEdition(editions, 'quran-uthmani') || editions[0];
        const bn = QuranAPI._byEdition(editions, 'bn.bengali') || editions.find(x => QuranAPI._editionId(x).startsWith('bn.'));
        const en = QuranAPI._byEdition(editions, 'en.sahih') || editions.find(x => QuranAPI._editionId(x).startsWith('en.'));
        const tr = QuranAPI._byEdition(editions, 'en.transliteration');
        const aud = QuranAPI._byEdition(editions, audioEdition) || editions.find(x => QuranAPI._editionId(x).startsWith('ar.'));
        if (!ar) throw new Error("Surah not found");

        const data = {
          id: surahId,
          name: ar.name,
          englishName: ar.englishName,
          revelationType: ar.revelationType,
          ayahs: []
        };

        for (let i = 0; i < ar.ayahs.length; i++) {
          data.ayahs.push({
            numberInSurah: ar.ayahs[i].numberInSurah,
            arabic: ar.ayahs[i].text,
            bangla: bn?.ayahs?.[i]?.text || '',
            english: en?.ayahs?.[i]?.text || '',
            transliteration: tr?.ayahs?.[i]?.text || '',
            bangla_transliteration: bn_tr?.ayahs?.[i]?.text || '',
            audio: aud?.ayahs?.[i]?.audio || ''
          });
        }

        await saveToDB('surahs', surahId, data, true);
        return data;
      } catch (e) {
        console.error("Error fetching full Surah:", e);
        // Fallback to minimal data if needed, but return null for caller to handle
        return null;
      }
    },

    getMetadata: async () => {
      const cached = await getFromDB('surahs', 'metadata');
      if (cached) return cached;
      try {
        const res = await fetch('https://api.alquran.cloud/v1/surah');
        const json = await res.json();
        if (json.code === 200) {
          // Add Bengali names if available or use a static mapping if needed
          // For now just return the data
          await saveToDB('surahs', 'metadata', json.data);
          return json.data;
        }
        return [];
      } catch (e) {
        return [];
      }
    },

    getQariList: () => QARI_LIST,
    getCurrentQari: () => currentQari,
    setQari,

    // Default API Keys for AI features
    DEFAULT_AI_KEYS: [
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
    ],

    // AI Backstory (Modified Prompt for detail context)
    getAyahBackstory: async (surah, ayah, arabic, bangla) => {

      // Check cache first
      const cacheKey = `ayah_story_${surah}_${ayah}`;
      const cached = await getAICache(cacheKey);
      if (cached) return cached;

      const prompt = `You are an expert Islamic Scholar and Bengali language expert. I need a detailed analysis for Surah ${surah}, Ayah ${ayah}.

**CRITICAL LANGUAGE RULE: Write EVERYTHING in pure Bengali (বাংলা) script. Absolutely NO English, NO Banglish (Roman + Bengali mix), NO Latin characters. All Arabic words must be phonetically written using Bengali alphabet characters only (অ, আ, ব, ক, র etc., NOT 'a', 'b', 'k', 'r'). This is the most important rule.**

**Response Structure (STRICTLY FOLLOW):**

1. **বাংলা উচ্চারণ (Bengali Pronunciation):**
   Write the COMPLETE Arabic verse phonetically in pure Bengali script only.
   Example format: "বিসমিল্লাহির রাহমানির রাহিম" (NOT "Bismillahir Rahmanir Rahim")
   Every single word MUST be in Bengali characters. Do not skip any word.
   
2. **প্রতিটি শব্দের অর্থ (Word-by-Word Meaning):**
   List each Arabic word followed by its Bengali meaning. Format: (আরবি শব্দ) = (বাংলা অর্থ).
   
3. **গভীর প্রেক্ষাপট (Backstory & Tafsir):** 
   Historical context, reason for revelation (Sabab al-Nuzul), and spiritual significance in detail.
   
4. **উপসংহার (Conclusion):**
   Concise lesson for modern life.
   
**Verse Data:**
- Arabic: ${arabic}
- Bengali Meaning: ${bangla}
- Language: Pure Bengali only. Tone: Compassionate and scholarly.`;

      // Try user's key first
      const userKey = localStorage.getItem('geminiKey');
      if (userKey) {
        try {
          const model = localStorage.getItem('geminiModel') || 'gemini-2.5-flash-lite';
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${userKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          });

          const data = await res.json();
          if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            const result = data.candidates[0].content.parts[0].text;
            setAICache(cacheKey, result);
            return result;
          }

        } catch (e) { }
      }

      // Try default keys
      for (const key of QuranAPI.DEFAULT_AI_KEYS) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          });

          const data = await res.json();
          if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            const result = data.candidates[0].content.parts[0].text;
            setAICache(cacheKey, result);
            return result;
          }

        } catch (e) { continue; }
      }
      return "বিস্তারিত লোড করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।";
    }
  };

  // --- HADITH API ---
  const HadithAPI = {
    // CDN fallback URLs for Hadith API
    _hadithUrls: (bookId) => [
      `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ben-${bookId}.min.json`,
      `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ben-${bookId}.json`,
      `https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions/ben-${bookId}.min.json`,
      `https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions/ben-${bookId}.json`
    ],

    // Fetch from any working CDN
    _fetchHadithJson: async (bookId) => {
      const urls = HadithAPI._hadithUrls(bookId);
      for (const url of urls) {
        try {
          const res = await fetch(url, { cache: 'no-store' });
          if (res.ok) return await res.json();
        } catch (e) { /* try next */ }
      }
      return null;
    },

    getBookList: async () => {
      const books = [
        { id: 'bukhari', name: 'সহীহ বুখারী', count: 7563, icon: '📚', color: '#064e3b' },
        { id: 'abudawud', name: 'সুনান আবু দাউদ', count: 5274, icon: '📜', color: '#7c3aed' },
        { id: 'tirmidhi', name: 'সুনান তিরমিযী', count: 3956, icon: '📗', color: '#dc2626' },
        { id: 'nasai', name: 'সুনান নাসাঈ', count: 5758, icon: '📘', color: '#d97706' },
        { id: 'ibnmajah', name: 'সুনান ইবনে মাজাহ', count: 4341, icon: '📙', color: '#059669' }
      ];

      for (const b of books) {
        const meta = await getFromDB('hadith', `book_meta_${b.id}`);
        b.isDownloaded = !!meta;
        if (meta) b.count = meta.totalCount || b.count;
      }
      return books;
    },

    downloadBook: async (bookId, progressCallback) => {
      try {
        if (progressCallback) progressCallback(5, 'CDN থেকে ডাউনলোড শুরু...');
        const json = await HadithAPI._fetchHadithJson(bookId);
        if (!json) throw new Error('সব CDN ব্যর্থ');
        const hadiths = Array.isArray(json) ? json : (json.hadiths || json.data || []);
        if (!hadiths.length) throw new Error('হাদিস ডাটা খালি');
        if (progressCallback) progressCallback(20, `${hadiths.length} হাদিস পাওয়া গেছে...`);
        if (!dbInstance) await initDB();
        let inserted = 0;
        const total = hadiths.length;
        const chunkSize = 150;
        for (let i = 0; i < total; i += chunkSize) {
          const chunk = hadiths.slice(i, i + chunkSize);
          await new Promise(r => setTimeout(r, 30));
          await new Promise((resolve, reject) => {
            const tx = dbInstance.transaction('hadith', 'readwrite');
            tx.oncomplete = resolve; tx.onerror = reject;
            const store = tx.objectStore('hadith');
            for (const h of chunk) {
              const bangla = h.text || h.body || h.bangla || '';
              const num = h.hadithnumber || h.number || h.id || (inserted + 1);
              const grade = h.grades?.[0]?.grade || h.grade || 'অজানা';
              const topics = HADITH_TOPICS
                .filter(t => t.keywords.some(kw => bangla.toLowerCase().includes(kw)))
                .map(t => t.id);
              store.put({
                key: `${bookId}_${String(num).padStart(6, '0')}`,
                data: { book: bookId, number: num, bangla, grade, topics }
              });
            }
          });
          inserted += chunk.length;
          if (progressCallback) progressCallback(20 + Math.floor((inserted / total) * 78), `${inserted}/${total}`);
        }
        await saveToDB('hadith', `book_meta_${bookId}`, { totalCount: total });
        if (progressCallback) progressCallback(100, 'সম্পন্ন!');
        return true;
      } catch (err) { console.error('downloadBook:', err); return false; }
    },

    getHadithsByTopic: async (topicId) => {
      if (!dbInstance) await initDB();
      return new Promise((resolve) => {
        const tx = dbInstance.transaction('hadith', 'readonly');
        const req = tx.objectStore('hadith').getAll();
        req.onsuccess = () => {
          const all = req.result;
          resolve(all.filter(item => item.data?.topics?.includes(topicId)).map(i => i.data));
        };
        req.onerror = () => resolve([]);
      });
    },

    getHadithsByBook: async (bookId, pageSize = 50, offset = 0) => {
      if (!dbInstance) await initDB();
      return new Promise((resolve) => {
        const tx = dbInstance.transaction('hadith', 'readonly');
        const req = tx.objectStore('hadith').getAll();
        req.onsuccess = () => {
          const all = req.result;
          const filtered = all
            .filter(item => item.data?.book === bookId)
            .sort((a, b) => a.data.number - b.data.number)
            .slice(offset, offset + pageSize)
            .map(i => i.data);
          resolve(filtered);
        };
        req.onerror = () => resolve([]);
      });
    },

    clearBookCache: async (bookId) => {
      if (!dbInstance) await initDB();
      return new Promise((resolve, reject) => {
        const tx = dbInstance.transaction('hadith', 'readwrite');
        const store = tx.objectStore('hadith');

        // 1. Delete all hadiths for this book
        const req = store.getAll();
        req.onsuccess = () => {
          const all = req.result;
          all.forEach(item => {
            if (item.data?.book === bookId) store.delete(item.key);
          });
        };

        // 2. Delete metadata
        store.delete(`book_meta_${bookId}`);

        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    },

    globalSearch: async (query) => {
      const books = ['bukhari', 'tirmidhi', 'abudawud', 'nasai', 'ibnmajah'];

      // 1. Try local IndexedDB first
      if (dbInstance) {
        const tx = dbInstance.transaction('hadith', 'readonly');
        const store = tx.objectStore('hadith');
        const req = store.getAll();
        const localResults = await new Promise(r => { req.onsuccess = () => r(req.result); req.onerror = () => r([]); });

        if (localResults.length > 500) { // If significant data exists locally
          const matches = localResults.filter(item =>
            item.data?.bangla?.includes(query) ||
            String(item.data?.number) === query
          ).map(i => i.data);
          if (matches.length > 0) return matches;
        }
      }

      // 2. Fallback to API/CDN if no local matches found
      const searchTasks = books.map(book =>
        fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/info/${book}/bn.json`)
          .then(res => res.json())
          .catch(() => null)
      );

      const allData = await Promise.all(searchTasks);
      let globalResults = [];

      allData.forEach((data, index) => {
        if (!data) return;
        const hadiths = Array.isArray(data) ? data : (data.hadiths || []);
        const matches = hadiths.filter(h =>
          (h.text || '').includes(query) || (h.hadithnumber || '').toString() === query
        ).map(h => ({ ...h, bookName: books[index] }));
        globalResults = [...globalResults, ...matches];
      });

      return globalResults;
    },

    renderAllItems: (container, items, createCardFn) => {
      container.innerHTML = '';
      items.forEach(item => {
        const card = createCardFn(item);
        container.appendChild(card);
      });
    }
    ,

    // Verify Hadith Authenticity with AI
    verifyHadith: async (book, number, arabic, bangla) => {
      const cacheKey = `hadith_verify_${book}_${number}`;
      const cached = await getAICache(cacheKey);
      if (cached) return cached;

      const prompt = `তুমি একজন বিশেষজ্ঞ মুহাদ্দিস (হাদিস বিশারদ)। নিচের হাদিসটি যাচাই করো:

হাদিস:
${bangla}

গ্রন্থ: ${book}
হাদিস নম্বর: ${number}

যাচাই করো:
1. এই হাদিসের সনদ (chain) সহিহ কি না?
2. হাদিসের শ্রেণী (সহিহ, হাসান, যয়ীফ, মাওদু) কী?
3. হাদিসের বিষয়বস্তু কুরআনের সাথে সাংঘর্ষিক কি না?
4. হাদিসের রাবীদের নাম ও তাদের নির্ভরযোগ্যতা।

সংক্ষিপ্ত উত্তর দাও বাংলায়।`;

      const _shuffledKeys = [...QuranAPI.DEFAULT_AI_KEYS].sort(() => 0.5 - Math.random());
      for (const key of _shuffledKeys) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          });
          if (!res.ok) continue;

          const data = await res.json();
          const result = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (result) {
            setAICache(cacheKey, result);
            return result;
          }
        } catch (e) { continue; }
      }
      return "AI সার্ভিস সাময়িকভাবে অনুপলব্ধ। পরে আবার চেষ্টা করুন।";
    },

    getHadithExplanation: async (book, number, text) => {
      const cacheKey = `hadith_exp_${book}_${number}`;
      const cached = await getAICache(cacheKey);
      if (cached) return cached;

      const prompt = `তুমি একজন প্রাজ্ঞ ইসলামিক পণ্ডিত। নিচের হাদিসটির বিস্তারিত ব্যাখ্যা ও শিক্ষা দাও:
গ্রন্থ: ${book}
হাদিস নম্বর: ${number}
হাদিসের বর্ণনা: ${text}

উত্তরে অবশ্যই নিচের বিষয়গুলো অন্তর্ভুক্ত করবে:
১. হাদিসের মূল শিক্ষা ও তাৎপর্য
২. বর্তমান সময়ে এই হাদিসের গুরুত্ব ও প্রয়োগ
৩. আমাদের জীবনের জন্য প্রয়োজনীয় নসিহত

উত্তর বাংলায়, গুছিয়ে এবং সুন্দর পয়েন্ট আকারে দেবে।`;

      const userKey = localStorage.getItem('geminiKey');
      if (userKey) {
        try {
          const model = localStorage.getItem('geminiModel') || 'gemini-2.5-flash-lite';
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${userKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          });
          const data = await res.json();
          if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            const result = data.candidates[0].content.parts[0].text;
            setAICache(cacheKey, result);
            return result;
          }
        } catch (e) { }
      }

      for (const key of QuranAPI.DEFAULT_AI_KEYS) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          });
          const data = await res.json();
          if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            const result = data.candidates[0].content.parts[0].text;
            setAICache(cacheKey, result);
            return result;
          }
        } catch (e) { continue; }
      }
      return "বিস্তারিত ব্যাখ্যা লোড করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।";
    }
  };


  // --- AUDIO MANAGER (Full Surah Offline Download) ---
  const AudioManagerObj = {
    cacheName: 'islamic-audio-cache-v1',
    getCacheKey: (s, a) => `https://offline-audio.local/${s}/${a}`,

    // Ayah count for each surah (index = surah number)
    // Source: api.alquran.cloud - verified accurate
    SURAH_AYAH_COUNTS: [
      0, // Index 0 (not used)
      7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 20, 52, 15, 19, 20, 56, 27, 93, 20, 18, 45, 37, 25, 25, 53, 11, 85, 19, 20, 32, 32, 44, 43, 66, 52, 48, 54, 35, 43, 54, 78, 60, 45, 42, 50, 46, 46, 42, 57, 53, 58, 44, 36, 34, 28, 25, 18, 12, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6
    ],

    // Calculate global ayah number from surah and ayah number
    getGlobalAyahNumber: (surahId, ayahInSurah) => {
      if (surahId < 1 || surahId > 114 || ayahInSurah < 1) return -1;
      if (ayahInSurah > AudioManagerObj.SURAH_AYAH_COUNTS[surahId]) return -1;

      let globalNum = 0;
      for (let i = 1; i < surahId; i++) {
        globalNum += AudioManagerObj.SURAH_AYAH_COUNTS[i];
      }
      return globalNum + ayahInSurah;
    },

    resolveAudioUrl: async (surahId, ayah) => {
      // 1. Check cache first (offline downloaded)
      const cache = await caches.open(AudioManagerObj.cacheName);

      // Try multiple URL patterns that might be cached
      const possibleUrls = [
        `https://cdn.islamic.network/quran/audio/128/${currentQari}/${AudioManagerObj.getGlobalAyahNumber(surahId, ayah)}.mp3`,
        `https://api.alquran.cloud/v1/ayah/${surahId}:${ayah}/${currentQari}`
      ];

      for (const url of possibleUrls) {
        try {
          const cached = await cache.match(url);
          if (cached) {
            console.log('[Audio] Using cached:', url);
            return url;
          }
        } catch (e) { }
      }

      // 2. If online, get from API
      if (navigator.onLine) {
        try {
          const res = await fetch(`https://api.alquran.cloud/v1/ayah/${surahId}:${ayah}/${currentQari}`);
          if (res.ok) {
            const json = await res.json();
            if (json.data && json.data.audio) {
              return json.data.audio;
            }
          }
        } catch (e) { console.warn('[Audio] API failed, using CDN'); }
      }

      // 3. Fallback: CDN URL
      const globalAyah = AudioManagerObj.getGlobalAyahNumber(surahId, ayah);
      if (globalAyah > 0 && globalAyah <= 6236) {
        return `https://cdn.islamic.network/quran/audio/128/${currentQari}/${globalAyah}.mp3`;
      }

      console.error('[Audio] Invalid surah/ayah:', surahId, ayah);
      return null;
    },

    downloadFullSurah: async (surahId, totalAyahs, btn) => {
      const originalText = btn.innerHTML;
      btn.disabled = true;
      try {
        if (!navigator.onLine) throw new Error("offline");
        const cache = await caches.open(AudioManagerObj.cacheName);

        for (let i = 1; i <= totalAyahs; i++) {
          btn.innerHTML = `<span class="material-symbols-rounded">hourglass_top</span> নামছে... (${i}/${totalAyahs})`;
          const url = await AudioManagerObj.resolveAudioUrl(surahId, i);

          const cached = await cache.match(url);
          if (!cached) {
            const res = await fetch(url, { mode: 'no-cors' });
            if (res.ok || res.type === 'opaque') await cache.put(url, res.clone());
          }
        }
        // Persist offline status
        let offlineSurahs = JSON.parse(localStorage.getItem('offline_surahs') || '[]');
        if (!offlineSurahs.includes(parseInt(surahId))) {
          offlineSurahs.push(parseInt(surahId));
          localStorage.setItem('offline_surahs', JSON.stringify(offlineSurahs));
        }
        btn.innerHTML = '<span class="material-symbols-rounded">task_alt</span> সেভড';
        if (typeof showToast !== 'undefined') showToast("সম্পূর্ণ সূরা অফলাইনের জন্য সেভ করা হয়েছে!");
        else if (typeof showToastMsg !== 'undefined') showToastMsg("সম্পূর্ণ সূরা অফলাইনের জন্য সেভ করা হয়েছে!");
        else alert("সম্পূর্ণ সূরা অফলাইনের জন্য সেভ করা হয়েছে!");
      } catch (error) {
        console.error("Surah Download Error:", error);
        btn.innerHTML = '<span class="material-symbols-rounded">error</span> ব্যর্থ';
      } finally {
        setTimeout(() => {
          btn.disabled = false;
          if (btn.innerHTML.includes('ব্যর্থ') || btn.innerHTML.includes('সেভড')) {
            btn.innerHTML = originalText;
          }
        }, 3000);
      }
    }
  };

  // --- OFFLINE MANAGER (Sync & Tracking) ---
  const OfflineManager = {
    isSyncing: false,
    syncProgress: 0,

    getStats: async () => {
      const audioIds = JSON.parse(localStorage.getItem('offline_surahs') || '[]');
      const books = await HadithAPI.getBookList();
      const downloadedBooks = books.filter(b => b.isDownloaded);

      return {
        surahs: audioIds.length,
        hadithBooks: downloadedBooks.length,
        isFullySync: (audioIds.length === 114 && downloadedBooks.length === 5)
      };
    },

    syncAll: async (progressCb) => {
      if (OfflineManager.isSyncing) return;
      OfflineManager.isSyncing = true;

      try {
        const books = ['bukhari', 'tirmidhi', 'abudawud', 'nasai', 'ibnmajah'];
        let totalSteps = books.length + 114 + 114; // Books + Text + Audio
        let completedSteps = 0;

        const updateProgress = (msg) => {
          completedSteps++;
          const pct = Math.min(Math.floor((completedSteps / totalSteps) * 100), 99);
          if (progressCb) progressCb(pct, msg);
        };

        // 1. Download Hadith Books
        for (const book of books) {
          const meta = await getFromDB('hadith', `book_meta_${book}`);
          if (!meta) {
            await HadithAPI.downloadBook(book, (p, m) => { /* internal progress ignored for batch */ });
          }
          updateProgress(`হাদিস বই ডাউনলোড হচ্ছে: ${book}`);
        }

        // 2. Download Quran Text (114 Surahs)
        for (let i = 1; i <= 114; i++) {
          updateProgress(`সূরা টেক্সট ডাউনলোড হচ্ছে: ${i}/114`);
          await QuranAPI.getSurah(i);
        }

        // 3. Download Quran Audio (114 Surahs)
        for (let i = 1; i <= 114; i++) {
          const currentAudioIds = JSON.parse(localStorage.getItem('offline_surahs') || '[]');
          if (!currentAudioIds.includes(parseInt(i))) {
            // Minor hack: create a mock button to pass to downloadFullSurah
            const mockBtn = { innerHTML: '', disabled: false };
            await AudioManagerObj.downloadFullSurah(i, AudioManagerObj.SURAH_AYAH_COUNTS[i], mockBtn);

            // Re-fetch and update to ensure consistency
            const updatedIds = JSON.parse(localStorage.getItem('offline_surahs') || '[]');
            if (!updatedIds.includes(parseInt(i))) {
              updatedIds.push(parseInt(i));
              localStorage.setItem('offline_surahs', JSON.stringify(updatedIds));
            }
          }
          updateProgress(`সূরা অডিও ডাউনলোড হচ্ছে: ${i}/114`);
        }

        if (progressCb) progressCb(100, 'পুরো অ্যাপ অফলাইন সম্পন্ন!');
      } catch (e) {
        console.error('Batch Sync Error:', e);
        if (progressCb) progressCb(-1, 'ডাউনলোড ব্যর্থ হয়েছে।');
      } finally {
        OfflineManager.isSyncing = false;
      }
    }
  };

  // --- VIEW MANAGER ---
  const ViewObject = {
    activeView: 'main',
    switchView: function (viewId) {
      if (!this.activeView) this.activeView = 'main';
      const views = ['main', 'para', 'khatam', 'hadith'];
      views.forEach(v => {
        const el = document.getElementById(v + 'Section');
        if (el) el.style.display = (v === viewId) ? 'block' : 'none';
      });
      this.activeView = viewId;
      console.log('View switched to:', viewId);
    }
  };

  // --- ADVANCED AUDIO PLAYER (Continuous Playback) ---
  const AdvancedAudioPlayer = {
    audio: new Audio(),
    playlist: [],
    currentIndex: -1,
    isPlaying: false,
    currentSurah: 0,
    currentTitle: '',
    uiContainer: null,

    // Khatam Specific Variables
    isKhatamMode: false,
    _isTransitioning: false,
    _isPrevLocked: false,
    khatamEndSurah: null,
    khatamEndAyah: null,

    _musicControlsReady: false,
    _useMediaSession: true,
    _showUI: true,
    _musicControlsCreated: false,

    _getQariName: () => {
      const q = QARI_LIST.find(x => x.id === currentQari);
      return q ? q.name : currentQari;
    },

    _setupMusicControlsPlugin: async () => {
      try {
        if (AdvancedAudioPlayer._musicControlsReady) return;
        if (!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform())) return;
        const mc = window.CapacitorMusicControls;
        if (!mc) return;

        // iOS
        try {
          await mc.addListener('controlsNotification', (info) => {
            AdvancedAudioPlayer._handleMusicControlsEvent(info);
          });
        } catch (e) {
        }

        // Android (plugin uses triggerJSEvent in some versions)
        try {
          document.addEventListener('controlsNotification', (event) => {
            const info = event && event.detail ? event.detail : event;
            AdvancedAudioPlayer._handleMusicControlsEvent(info);
          });
        } catch (e) {
        }

        AdvancedAudioPlayer._musicControlsReady = true;
      } catch (e) {
      }
    },

    _handleMusicControlsEvent: (payload) => {
      try {
        const message = payload && (payload.message || payload?.detail?.message);
        switch (message) {
          case 'music-controls-next':
            AdvancedAudioPlayer.playNext();
            break;
          case 'music-controls-previous':
            AdvancedAudioPlayer.playPrev();
            break;
          case 'music-controls-pause':
            if (!AdvancedAudioPlayer.audio.src) return;
            AdvancedAudioPlayer.audio.pause();
            AdvancedAudioPlayer.isPlaying = false;
            AdvancedAudioPlayer.updateUIContext();
            break;
          case 'music-controls-play':
            if (!AdvancedAudioPlayer.audio.src) return;
            AdvancedAudioPlayer.audio.play();
            AdvancedAudioPlayer.isPlaying = true;
            AdvancedAudioPlayer.updateUIContext();
            break;
          case 'music-controls-destroy':
            AdvancedAudioPlayer.stop();
            break;
          default:
            break;
        }
      } catch (e) {
      }
    },

    _updateMusicControls: async () => {
      try {
        if (!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform())) return;
        const mc = window.CapacitorMusicControls;
        if (!mc) return;

        const item = AdvancedAudioPlayer.currentIndex !== -1
          ? (AdvancedAudioPlayer.playlist[AdvancedAudioPlayer.currentIndex] || null)
          : null;
        const track = item
          ? `Surah ${AdvancedAudioPlayer.currentSurah} - Ayah ${item.ayah}`
          : 'Al Quran';

        // Use data URL for cover to avoid file:// scheme issues
        const cover = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzBlODk3ZSIvPjxyZWN0IHg9IjE1JSIgeT0iMTUlIiB3aWR0aD0iNzAlIiBoZWlnaHQ9IjcwJSIgcng9IjIwIiBmaWxsPSIjMGE1NDM4Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMjAiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj4rPC90ZXh0Pjwvc3ZnPg==';

        if (!AdvancedAudioPlayer._musicControlsCreated && item) {
          await mc.create({
            track,
            artist: AdvancedAudioPlayer._getQariName(),
            album: 'Al Quran',
            cover,
            isPlaying: !!AdvancedAudioPlayer.isPlaying,
            dismissable: true,
            hasPrev: true,
            hasNext: true,
            hasClose: true,
            elapsed: Math.floor(AdvancedAudioPlayer.audio.currentTime || 0),
            duration: Math.floor(AdvancedAudioPlayer.audio.duration || 0)
          });
          AdvancedAudioPlayer._musicControlsCreated = true;
        } else if (AdvancedAudioPlayer._musicControlsCreated) {
          try {
            mc.updateIsPlaying({ isPlaying: !!AdvancedAudioPlayer.isPlaying });
          } catch (e) {
          }
          try {
            mc.updateElapsed({
              elapsed: Math.floor(AdvancedAudioPlayer.audio.currentTime || 0),
              isPlaying: !!AdvancedAudioPlayer.isPlaying
            });
          } catch (e) {
          }
        }
      } catch (e) {
      }
    },

    _updateMediaSession: (title) => {
      if (!AdvancedAudioPlayer._useMediaSession) return;
      if ('mediaSession' in navigator) {
        const item = AdvancedAudioPlayer.playlist[AdvancedAudioPlayer.currentIndex];
        const displayTitle = title || (item ? `সূরা ${item.surah} • আয়াত ${item.ayah}` : 'Islamic Hub');

        // Use data URL for artwork to avoid file:// scheme issues
        const artworkUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgZmlsbD0iIzBlODk3ZSIvPjxyZWN0IHg9IjE1JSIgeT0iMTUlIiB3aWR0aD0iNzAlIiBoZWlnaHQ9IjcwJSIgcng9IjIwIiBmaWxsPSIjMGE1NDM4Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMjAiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj4rPC90ZXh0Pjwvc3ZnPg==';

        navigator.mediaSession.metadata = new MediaMetadata({
          title: displayTitle,
          artist: 'Islamic Hub Premium',
          album: 'Quran & Knowledge',
          artwork: [
            { src: artworkUrl, sizes: '512x512', type: 'image/png' }
          ]
        });

        if (AdvancedAudioPlayer.audio && AdvancedAudioPlayer.audio.duration) {
          navigator.mediaSession.setPositionState({
            duration: AdvancedAudioPlayer.audio.duration,
            playbackRate: AdvancedAudioPlayer.audio.playbackRate || 1,
            position: AdvancedAudioPlayer.audio.currentTime || 0
          });
        }

        navigator.mediaSession.playbackState = AdvancedAudioPlayer.isPlaying ? 'playing' : 'paused';
      }
    },

    play: async (url, title, showUI = true, useMediaSession = true) => {
      AdvancedAudioPlayer._showUI = showUI;
      AdvancedAudioPlayer._useMediaSession = useMediaSession;

      if (AdvancedAudioPlayer.audio.src !== url) {
        AdvancedAudioPlayer.audio.src = url;
      }

      try {
        await AdvancedAudioPlayer.audio.play();
        AdvancedAudioPlayer.isPlaying = true;
        if (showUI) AdvancedAudioPlayer.showUI();
        else AdvancedAudioPlayer.hideUI();

        if (useMediaSession) {
          AdvancedAudioPlayer._updateMediaSession(title);
        }
      } catch (e) {
        console.error("Playback failed:", e);
      }
    },

    _setupMediaSessionHandlers: () => {
      try {
        if (!('mediaSession' in navigator)) return;
        navigator.mediaSession.setActionHandler('play', () => {
          if (!AdvancedAudioPlayer.audio.src) return;
          AdvancedAudioPlayer.audio.play();
          AdvancedAudioPlayer.isPlaying = true;
          AdvancedAudioPlayer.updateUIContext();
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          if (!AdvancedAudioPlayer.audio.src) return;
          AdvancedAudioPlayer.audio.pause();
          AdvancedAudioPlayer.isPlaying = false;
          AdvancedAudioPlayer.updateUIContext();
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => AdvancedAudioPlayer.playPrev());
        navigator.mediaSession.setActionHandler('nexttrack', () => AdvancedAudioPlayer.playNext());
        navigator.mediaSession.setActionHandler('stop', () => AdvancedAudioPlayer.stop());
      } catch (e) {
      }
    },

    init: (containerId) => {
      AdvancedAudioPlayer.uiContainer = document.getElementById(containerId);
      AdvancedAudioPlayer._setupMediaSessionHandlers();
      AdvancedAudioPlayer._setupMusicControlsPlugin();

      // ENSURE SINGLE LISTENERS
      AdvancedAudioPlayer.audio.removeEventListener('ended', AdvancedAudioPlayer._handleAudioEnded);
      AdvancedAudioPlayer.audio.removeEventListener('ended', AdvancedAudioPlayer.playNext);
      AdvancedAudioPlayer.audio.addEventListener('ended', AdvancedAudioPlayer._handleAudioEnded);

      AdvancedAudioPlayer.audio.addEventListener('error', () => {
        if (AdvancedAudioPlayer.currentIndex === -1 || !AdvancedAudioPlayer.audio.src) return;
        console.warn("Audio playback error, trying next ayah...");
        setTimeout(AdvancedAudioPlayer.playNext, 1000);
      });
      AdvancedAudioPlayer.audio.addEventListener('timeupdate', AdvancedAudioPlayer.updateProgress);
    },

    _handleAudioEnded: () => {
      console.log("[Audio] Ayah ended");
      AdvancedAudioPlayer.playNext();
    },

    loadSurah: async (surahId, totalAyahs, autoStart = true) => {
      AdvancedAudioPlayer.currentSurah = surahId;
      AdvancedAudioPlayer.playlist = [];
      AdvancedAudioPlayer.currentIndex = 0;

      for (let i = 1; i <= totalAyahs; i++) {
        AdvancedAudioPlayer.playlist.push({ surah: surahId, ayah: i });
      }

      AdvancedAudioPlayer.showUI();
      if (autoStart) {
        // Dynamic Header Color Sync
        const colors = ['#064e3b', '#0891b2', '#7c3aed', '#dc2626', '#d97706', '#059669', '#0284c7', '#9333ea', '#ea580c', '#16a34a', '#0369a1', '#7e22ce', '#b91c1c', '#b45309', '#047857'];
        const color = colors[(surahId - 1) % colors.length];
        const opacity = document.documentElement.getAttribute('data-theme') === 'dark' ? '0.9' : '0.85';
        document.documentElement.style.setProperty('--header-accent', color + (Math.round(parseFloat(opacity) * 255).toString(16).padStart(2, '0')));

        await AdvancedAudioPlayer.playIndex(0);
      } else {
        AdvancedAudioPlayer.updateUIContext();
      }
    },

    playIndex: async (index) => {
      if (index < 0 || index >= AdvancedAudioPlayer.playlist.length) return;

      // Reset error count on successful start if NOT coming from an error skip
      if (!AdvancedAudioPlayer._isErrorSkipping) {
        AdvancedAudioPlayer._errorCount = 0;
      }
      AdvancedAudioPlayer._isErrorSkipping = false;

      AdvancedAudioPlayer.currentIndex = index;
      const item = AdvancedAudioPlayer.playlist[index];

      // DETECT SURAH CHANGE TO UPDATE UI READER
      if (item.surah && item.surah !== AdvancedAudioPlayer.currentSurah) {
        console.log("[Audio] Surah changed to:", item.surah);
        AdvancedAudioPlayer.currentSurah = item.surah;
        if (typeof window.openSurah === 'function') {
          await window.openSurah(item.surah);
        }
      }

      const url = await AudioManagerObj.resolveAudioUrl(item.surah, item.ayah);
      if (!url) {
        AdvancedAudioPlayer.playNext();
        return;
      }

      // আগের অডিওকে সম্পূর্ণভাবে পজ এবং ক্লিয়ার করা হচ্ছে যেন স্প্যাম এরর না দেয়
      AdvancedAudioPlayer.audio.pause();
      AdvancedAudioPlayer.audio.src = url;
      AdvancedAudioPlayer.audio.load();

      try {
        await AdvancedAudioPlayer.audio.play();
        AdvancedAudioPlayer.isPlaying = true;
        AdvancedAudioPlayer.showUI();
        AdvancedAudioPlayer.updateUIContext();
        AdvancedAudioPlayer.highlightCurrentVerse(item.ayah);

        // EVENT-DRIVEN STREAK: Update streak when audio actually plays
        if (typeof window.updateReadingStreak === 'function') {
          window.updateReadingStreak();
        }

        // TRACK READING SPEED
        if (!AdvancedAudioPlayer._readingStartTime) {
          AdvancedAudioPlayer._readingStartTime = Date.now();
          let readCount = 0;
          try { readCount = JSON.parse(localStorage.getItem('khatam_read_ayahs') || '[]').length; } catch (e) { }
          AdvancedAudioPlayer._initialAyahCount = readCount;
        }

        // SAVE RESUME STATE
        const state = { surah: item.surah, ayah: item.ayah, total: AdvancedAudioPlayer.playlist.length, time: Date.now() };
        if (AdvancedAudioPlayer.isKhatamMode) {
          localStorage.setItem('khatam_last_playback', JSON.stringify(state));
          if (window.SyncService) SyncService.pushToCloud('khatam_last_playback');
        } else {
          localStorage.setItem('islamic_last_playback', JSON.stringify(state));
          if (window.SyncService) SyncService.pushToCloud('islamic_last_playback');
        }

        // INTELLIGENT PREFETCH: Prepare next Ayah while current one plays
        if (window.AeroTurbo && index + 1 < AdvancedAudioPlayer.playlist.length) {
          const nextItem = AdvancedAudioPlayer.playlist[index + 1];
          AudioManagerObj.resolveAudioUrl(nextItem.surah, nextItem.ayah).then(nextUrl => {
            if (nextUrl) AeroTurbo.prefetchAudio(nextUrl);
          });
        }
      } catch (e) {
        console.warn("Audio Play Error, skipping to next:", e);
        AdvancedAudioPlayer.isPlaying = false;
        AdvancedAudioPlayer.updateUIContext();

        // Prevent infinite loop if multiple files are missing
        AdvancedAudioPlayer._errorCount = (AdvancedAudioPlayer._errorCount || 0) + 1;
        if (AdvancedAudioPlayer._errorCount > 3) {
          console.error("[Audio] Too many consecutive errors. Stopping.");
          AdvancedAudioPlayer.stop();
          AdvancedAudioPlayer._errorCount = 0;
          if (typeof showToastMsg !== 'undefined') showToastMsg("অডিও লোড করতে সমস্যা হচ্ছে। প্লেব্যাক বন্ধ করা হয়েছে।");
        } else {
          AdvancedAudioPlayer._isErrorSkipping = true;
          setTimeout(AdvancedAudioPlayer.playNext, 1500);
        }
      }
    },

    buildKhatamPlaylist: () => {
      const playlist = [];
      for (let para = 1; para <= 30; para++) {
        const ranges = PARA_MAP[para];
        ranges.forEach(r => {
          for (let ay = r.start; ay <= r.end; ay++) {
            playlist.push({ surah: r.surah, ayah: ay, para: para });
          }
        });
      }
      return playlist;
    },

    buildParaPlaylist: (para) => {
      const ranges = PARA_MAP[para];
      const playlist = [];
      ranges.forEach(r => {
        for (let ay = r.start; ay <= r.end; ay++) {
          playlist.push({ surah: r.surah, ayah: ay, para: para });
        }
      });
      return playlist;
    },

    playNext: () => {
      const next = AdvancedAudioPlayer.currentIndex + 1;

      // ── Range-play Guard: Stop at the user-defined end position ──
      if (next < AdvancedAudioPlayer.playlist.length) {
        const nextItem = AdvancedAudioPlayer.playlist[next];
        const endSurah = AdvancedAudioPlayer.khatamEndSurah;
        const endAyah = AdvancedAudioPlayer.khatamEndAyah;

        if (endSurah !== null && endAyah !== null) {
          // Has the next item gone PAST the end range?
          const pastEnd =
            nextItem.surah > endSurah ||
            (nextItem.surah === endSurah && nextItem.ayah > endAyah);

          if (pastEnd) {
            console.log("[Audio] Range end reached. Stopping playback.");
            AdvancedAudioPlayer.stop();
            if (typeof showToastMsg !== 'undefined') showToastMsg("নির্বাচিত পরিসীমার তিলাওয়াত শেষ হয়েছে।");
            return;
          }
        }
      }

      if (next >= AdvancedAudioPlayer.playlist.length) {
        console.log("[Audio] Playlist finished");
        AdvancedAudioPlayer.stop();
        return;
      }
      AdvancedAudioPlayer.playIndex(next);
    },
    updateProgress: () => {
      if (!AdvancedAudioPlayer.audio || !AdvancedAudioPlayer.audio.duration) return;
      const progress = (AdvancedAudioPlayer.audio.currentTime / AdvancedAudioPlayer.audio.duration) * 100;
      const fill = document.getElementById('apProgress');
      if (fill) fill.style.width = progress + '%';
    },

    hide: () => {
      AdvancedAudioPlayer.stop();
      if (typeof hidePlayer === 'function') hidePlayer();
      else {
        const p = document.getElementById('floatingPlayer');
        if (p) p.classList.remove('show');
      }
    },

    playPrev: () => {
      if (!AdvancedAudioPlayer.audio) return;
      const prev = AdvancedAudioPlayer.currentIndex - 1;
      if (prev < 0) {
        AdvancedAudioPlayer.audio.currentTime = 0;
        return;
      }
      AdvancedAudioPlayer.playIndex(prev);
    },

    togglePlay: () => {
      const mainAudio = AdvancedAudioPlayer.audio;

      // Sync with actual audio element state
      if (mainAudio.src && mainAudio.src !== window.location.href) {
        if (!mainAudio.paused) {
          mainAudio.pause();
          AdvancedAudioPlayer.isPlaying = false;
        } else {
          mainAudio.play().then(() => {
            AdvancedAudioPlayer.isPlaying = true;
            AdvancedAudioPlayer.updateUIContext();
          }).catch(e => {
            console.warn("Main audio play failed:", e);
            AdvancedAudioPlayer.isPlaying = false;
          });
        }
        AdvancedAudioPlayer.updateUIContext();
        return;
      }

      // Legacy fallback
      if (window.currentAyahAudio && window.currentAyahAudio.src) {
        if (!window.currentAyahAudio.paused) {
          window.currentAyahAudio.pause();
          AdvancedAudioPlayer.isPlaying = false;
        } else {
          window.currentAyahAudio.play().then(() => {
            AdvancedAudioPlayer.isPlaying = true;
          }).catch(e => console.error("currentAyahAudio play failed", e));
        }
        AdvancedAudioPlayer.updateUIContext();
        return;
      }
    },

    // Play next ayah (works with both playlist and currentAyahAudio)
    playNextAyah: () => {
      if (window.currentAyahNo && window.currentAyahTotal) {
        const nextNo = window.currentAyahNo + 1;
        if (nextNo <= window.currentAyahTotal) {
          const nextAyah = document.getElementById(`ayah-${nextNo}`);
          if (nextAyah) {
            const nextBtn = nextAyah.querySelector('.ayah-act-btn:nth-child(2)') || nextAyah.querySelector('.ayah-act-btn[onclick*="playSingleAyah"]');
            if (nextBtn) {
              nextAyah.scrollIntoView({ behavior: 'smooth', block: 'center' });
              setTimeout(() => nextBtn.click(), 300);
              return;
            }
          }
        } else {
          AdvancedAudioPlayer.playNext();
        }
      } else {
        AdvancedAudioPlayer.playNext();
      }
    },

    // Play previous ayah
    playPrevAyah: () => {
      if (window.currentAyahNo && window.currentAyahNo > 1) {
        const prevNo = window.currentAyahNo - 1;
        const prevAyah = document.getElementById(`ayah-${prevNo}`);
        if (prevAyah) {
          // Robustly find the play button (usually the 2nd child in actions or contains playSingleAyah)
          const prevBtn = prevAyah.querySelector('.ayah-act-btn:nth-child(2)') || prevAyah.querySelector('.ayah-act-btn[onclick*="playSingleAyah"]');
          if (prevBtn) {
            prevAyah.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => prevBtn.click(), 300);
            return;
          }
        }
      }
      AdvancedAudioPlayer.playPrev();
    },

    // ALIASES for compatibility with UI calls
    toggle: () => AdvancedAudioPlayer.togglePlay(),


    // Play a single audio URL directly (for individual ayah playback or external namaz audio)
    play: async (url, title, showUI = true, isQuranic = false) => {
      console.log('AdvancedAudioPlayer: play request', { url, title, showUI, isQuranic });
      if (!url) return;

      try {
        AdvancedAudioPlayer.audio.pause();
        AdvancedAudioPlayer.audio.src = '';
        AdvancedAudioPlayer.audio.load();
      } catch (e) { }

      AdvancedAudioPlayer.currentIndex = -1;
      AdvancedAudioPlayer.currentTitle = title || 'অডিও প্লে হচ্ছে...';
      AdvancedAudioPlayer.audio.src = url;

      if (showUI) {
        AdvancedAudioPlayer.showUI();
      } else {
        AdvancedAudioPlayer.hideUI();
      }

      const titleEl = document.getElementById('apTitle');
      if (titleEl) titleEl.textContent = AdvancedAudioPlayer.currentTitle;

      AdvancedAudioPlayer.audio.load();
      AdvancedAudioPlayer.audio.play().then(() => {
        AdvancedAudioPlayer.isPlaying = true;
        AdvancedAudioPlayer.updateUIContext();
      }).catch(e => {
        console.warn('AdvancedAudioPlayer: play() failed, trying reconstruction', e);
        if (e.name === 'NotSupportedError') {
          AdvancedAudioPlayer._reconstructAudio();
          AdvancedAudioPlayer.audio.src = url;
          AdvancedAudioPlayer.audio.load();
          AdvancedAudioPlayer.audio.play().then(() => {
            AdvancedAudioPlayer.isPlaying = true;
            AdvancedAudioPlayer.updateUIContext();
          }).catch(e2 => console.error("Reconstruction retry failed", e2));
        }
        AdvancedAudioPlayer.isPlaying = false;
        AdvancedAudioPlayer.updateUIContext();
      });
    },


    _reconstructAudio: () => {
      console.warn("AdvancedAudioPlayer: Manual Audio reconstruction triggered.");
      try {
        AdvancedAudioPlayer.audio.pause();
        AdvancedAudioPlayer.audio.src = '';
        AdvancedAudioPlayer.audio.load();
      } catch (e) { }
      AdvancedAudioPlayer.audio = new Audio();
      AdvancedAudioPlayer.audio.addEventListener('ended', AdvancedAudioPlayer._handleAudioEnded);
      AdvancedAudioPlayer.audio.addEventListener('timeupdate', AdvancedAudioPlayer.updateProgress);
      AdvancedAudioPlayer.audio.addEventListener('error', () => {
        if (AdvancedAudioPlayer.currentIndex === -1 || !AdvancedAudioPlayer.audio.src) return;
        setTimeout(AdvancedAudioPlayer.playNext, 1000);
      });
    },

    stop: () => {
      // Stop window.currentAyahAudio if available
      if (window.currentAyahAudio) {
        window.currentAyahAudio.pause();
        window.currentAyahAudio.src = '';
      }
      if (window.currentAyahBtn) {
        window.currentAyahBtn.innerHTML = '<span class="material-symbols-rounded">play_circle</span>';
        window.currentAyahBtn.classList.remove('audio-playing');
        window.currentAyahBtn = null;
      }

      AdvancedAudioPlayer.audio.pause();
      AdvancedAudioPlayer.audio.src = '';
      AdvancedAudioPlayer.isPlaying = false;
      AdvancedAudioPlayer.currentIndex = -1;
      AdvancedAudioPlayer.hideUI();
      try {
        if (AdvancedAudioPlayer._musicControlsCreated && window.CapacitorMusicControls) {
          window.CapacitorMusicControls.destroy();
        }
      } catch (e) {
      }
      AdvancedAudioPlayer._musicControlsCreated = false;
      // Remove all highlights
      document.querySelectorAll('.ayah-card').forEach(el => {
        el.style.border = '';
        el.style.backgroundColor = '';
        el.classList.remove('playing-pulse');
      });
      AdvancedAudioPlayer.updateUIContext();
    },

    highlightCurrentVerse: (ayahNum, retryCount = 0) => {
      document.querySelectorAll('.ayah-card').forEach(el => {
        el.style.border = '';
        el.style.backgroundColor = '';
        el.classList.remove('playing-pulse');
      });
      const vp = document.getElementById(`ayah-${ayahNum}`);
      if (vp) {
        vp.style.border = '2px solid var(--accent-secondary)';
        vp.style.backgroundColor = 'var(--accent-glow)';
        vp.classList.add('playing-pulse');
        // Auto-scroll so it's visible in the middle
        vp.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (retryCount < 10) {
        // If not found (due to chunked rendering), try again 
        setTimeout(() => AdvancedAudioPlayer.highlightCurrentVerse(ayahNum, retryCount + 1), 300);
      }
    },

    updateProgress: () => {
      const prog = document.getElementById('audioProgressFill');
      if (prog && AdvancedAudioPlayer.audio.duration) {
        const percent = (AdvancedAudioPlayer.audio.currentTime / AdvancedAudioPlayer.audio.duration) * 100;
        prog.style.width = `${percent}%`;
      }

      AdvancedAudioPlayer._updateMediaSession();
      AdvancedAudioPlayer._updateMusicControls();
    },

    showUI: () => {
      if (AdvancedAudioPlayer.uiContainer) {
        AdvancedAudioPlayer.uiContainer.style.display = 'flex';
        AdvancedAudioPlayer.uiContainer.style.opacity = '1';
        AdvancedAudioPlayer.uiContainer.style.pointerEvents = 'auto';
        AdvancedAudioPlayer.uiContainer.classList.add('show');
        AdvancedAudioPlayer.uiContainer.classList.add('active');
        AdvancedAudioPlayer.updateUIContext();
      }
    },

    hideUI: () => {
      if (AdvancedAudioPlayer.uiContainer) {
        AdvancedAudioPlayer.uiContainer.classList.remove('active');
        // Force opacity/pointer-events reset after transition
        setTimeout(() => {
          if (!AdvancedAudioPlayer.uiContainer.classList.contains('active')) {
            AdvancedAudioPlayer.uiContainer.style.opacity = '0';
            AdvancedAudioPlayer.uiContainer.style.pointerEvents = 'none';
          }
        }, 600);
      }
    },

    updateUIContext: () => {
      if (!AdvancedAudioPlayer.uiContainer) return;
      const btn = document.getElementById('apPlayBtn');
      if (btn) {
        btn.innerHTML = AdvancedAudioPlayer.isPlaying ? '<span class="material-symbols-rounded">pause</span>' : '<span class="material-symbols-rounded">play_arrow</span>';
        btn.style.background = AdvancedAudioPlayer.isPlaying ? '#ef4444' : 'var(--accent)';
      }
      const titleEl = document.getElementById('apTitle');
      if (titleEl) {
        if (AdvancedAudioPlayer.currentIndex !== -1) {
          const item = AdvancedAudioPlayer.playlist[AdvancedAudioPlayer.currentIndex] || { ayah: 0 };
          titleEl.innerText = `সূরা ${AdvancedAudioPlayer.currentSurah} • আয়াত ${item.ayah}`;
        } else if (AdvancedAudioPlayer.currentTitle) {
          titleEl.innerText = AdvancedAudioPlayer.currentTitle;
        }
      }

      AdvancedAudioPlayer._updateMediaSession();
      AdvancedAudioPlayer._updateMusicControls();
    }
  };

  // --- UI RENDERER ---
  const UIRenderer = {
    currentAudio: null,
    currentBtn: null,

    playAudio: (url, btnElement, onEndCallback) => {
      if (!url) {
        if (typeof UI !== 'undefined') UI.showToast("এই আয়াতের অডিও পাওয়া যায়নি");
        else alert("এই আয়াতের অডিও পাওয়া যায়নি");
        return;
      }
      // Toggle Play/Pause if clicking the same button
      if (UIRenderer.currentBtn === btnElement && UIRenderer.currentAudio) {
        if (!UIRenderer.currentAudio.paused) {
          UIRenderer.currentAudio.pause();
          btnElement.classList.remove('audio-playing');
          btnElement.innerHTML = '<span class="material-symbols-rounded">play_circle</span>';
          return;
        } else {
          UIRenderer.currentAudio.play();
          btnElement.classList.add('audio-playing');
          btnElement.innerHTML = '<span class="material-symbols-rounded">pause_circle</span>';
          return;
        }
      }

      // Stop previous audio and reset previous button
      if (UIRenderer.currentAudio) {
        UIRenderer.currentAudio.pause();
        if (UIRenderer.currentBtn) {
          UIRenderer.currentBtn.classList.remove('audio-playing');
          UIRenderer.currentBtn.innerHTML = '<span class="material-symbols-rounded">play_circle</span>';
        }
      }

      if (url) {
        UIRenderer.currentAudio = new Audio(url);
        UIRenderer.currentAudio.play();
        UIRenderer.currentBtn = btnElement;

        if (btnElement) {
          btnElement.classList.add('audio-playing');
          btnElement.innerHTML = '<span class="material-symbols-rounded">pause_circle</span>';
        }

        UIRenderer.currentAudio.onended = () => {
          if (btnElement) {
            btnElement.classList.remove('audio-playing');
            btnElement.innerHTML = '<span class="material-symbols-rounded">play_circle</span>';
          }
          UIRenderer.currentBtn = null;
          if (onEndCallback) onEndCallback();
        };
      }
    },

    // TTS Removed As Requested
    createModal: (title, question, answer) => {
      // Remove any existing modal
      const existing = document.getElementById('quran-ai-modal');
      if (existing) existing.remove();

      const overlay = document.createElement('div');
      overlay.id = 'quran-ai-modal';
      overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        display: flex; align-items: center; justify-content: center;
        z-index: 9999999; padding: 20px; box-sizing: border-box;
        font-family: 'Hind Siliguri', 'Inter', sans-serif;
      `;

      // Premium Formatting (Matches 2nd photo's bold green headers)
      const formattedAnswer = answer
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #175033; font-size: 17px; display: block; margin-top: 20px; margin-bottom: 8px;">$1</strong>')
        .replace(/\n\n/g, '<div style="height:12px"></div>')
        .replace(/\n/g, '<br>');

      overlay.innerHTML = `
        <div style="background: #E6F0EA; border-radius: 20px; width: 100%; max-width: 480px; overflow: hidden; box-shadow: 0 15px 40px rgba(0,0,0,0.4); display: flex; flex-direction: column; max-height: 90vh; border: 1px solid rgba(26, 87, 56, 0.1);">
          
          <!-- Header (Dark Green - Colourful) -->
          <div style="background: #1A5738; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; color: white;">
            <div style="font-size: 19px; font-weight: 800; display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 20px;">✨</span> AI বিস্তারিত
            </div>
            <button onclick="document.getElementById('quran-ai-modal').remove()" style="background: rgba(255, 255, 255, 0.2); border: none; width: 34px; height: 34px; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold; transition: background 0.2s;">
              ✕
            </button>
          </div>

          <!-- Body -->
          <div style="padding: 24px; overflow-y: auto; color: #2A3B32; line-height: 1.8; font-size: 15px; scrollbar-width: thin; scrollbar-color: #1A5738 #E6F0EA;">
            <h3 style="color: #175033; font-size: 22px; margin: 0 0 14px 0; font-weight: 900; line-height: 1.4; font-family: 'Inter', sans-serif;">
              ${question}
            </h3>
            <div style="height: 3px; background: #175033; margin-bottom: 24px; width: 60px; border-radius: 2px;"></div>
            
            <div style="color: #2A3B32;">
              ${formattedAnswer}
            </div>
          </div>

          <!-- Footer Buttons (Matches 2nd photo's layout) -->
          <div style="padding: 16px 24px; display: flex; gap: 14px; border-top: 1px solid rgba(26, 87, 56, 0.1); background: #E6F0EA;">
            <button id="quran-ai-copy-btn" style="flex: 1; padding: 14px; border: 2px solid #1A5738; background: white; color: #1A5738; border-radius: 12px; font-weight: 800; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s;">
               <span class="material-symbols-rounded" style="font-size: 18px;">content_copy</span> কপি
            </button>
            
            <button onclick="document.getElementById('quran-ai-modal').remove()" style="flex: 1; padding: 14px; border: none; background: #1A5738; color: white; border-radius: 12px; font-weight: 800; font-size: 15px; cursor: pointer; transition: opacity 0.2s;">
              বন্ধ করুন
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      // Copy Logic
      const copyBtn = document.getElementById('quran-ai-copy-btn');
      copyBtn.onclick = function () {
        const cleanText = answer.replace(/\*\*/g, '').replace(/<br>/g, '\n');
        navigator.clipboard.writeText(cleanText).then(() => {
          const original = copyBtn.innerHTML;
          copyBtn.innerHTML = '✓ কপি হয়েছে';
          copyBtn.style.background = '#1A5738';
          copyBtn.style.color = 'white';
          setTimeout(() => {
            copyBtn.innerHTML = original;
            copyBtn.style.background = 'white';
            copyBtn.style.color = '#1A5738';
          }, 2000);
        });
      };
    },

    showBackstory: async (surah, ayah, arabic, bangla, btn) => {
      const originalHtml = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span class="material-symbols-rounded">hourglass_top</span>';
      try {
        const story = await QuranAPI.getAyahBackstory(surah, ayah, arabic, bangla);
        UIRenderer.createModal(`আয়াতের বিস্তারিত`, `সূরা ${surah}, আয়াত ${ayah}`, story);
      } catch (e) {
        if (typeof showToast !== 'undefined') showToast("লোড করতে সমস্যা হয়েছে।");
        else alert("লোড করতে সমস্যা হয়েছে।");
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
      }
    },

    showHadithExplanation: async (book, number, text, btn) => {
      const originalHtml = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span class="material-symbols-rounded">hourglass_top</span> লোড হচ্ছে...';
      try {
        const exp = await HadithAPI.getHadithExplanation(book, number, text);
        UIRenderer.createModal(`হাদিস ব্যাখ্যা`, `${book} - হাদিস নং ${number}`, exp);
      } catch (e) {
        if (typeof showToast !== 'undefined') showToast("লোড করতে সমস্যা হয়েছে।");
        else alert("লোড করতে সমস্যা হয়েছে।");
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
      }
    },

    showHadithVerification: async (book, number, arabic, bangla, btn) => {
      const originalHtml = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span class="material-symbols-rounded">hourglass_top</span>';
      try {
        const result = await HadithAPI.verifyHadith(book, number, arabic, bangla);
        UIRenderer.createModal(`হাদিস যাচাই`, `${book} - #${number}`, result);
      } catch (e) {
        if (typeof showToast !== 'undefined') showToast("যাচাই করতে সমস্যা হয়েছে।");
        else alert("যাচাই করতে সমস্যা হয়েছে।");
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
      }
    }
  };

  // Audio Controller for simple ayah playback with memory management
  let currentAudioInstance = null;
  const AudioController = {
    stop: () => {
      if (currentAudioInstance) {
        currentAudioInstance.pause();
        currentAudioInstance.src = "";
        currentAudioInstance = null;
      }
      // Stop Advanced Player if it's playing
      if (AdvancedAudioPlayer && typeof AdvancedAudioPlayer.stop === 'function') {
        AdvancedAudioPlayer.stop();
      }
      document.querySelectorAll('.playing-ayah, .playing').forEach(el => el.classList.remove('playing-ayah', 'playing'));
      const floatingPlayer = document.getElementById('floatingPlayer');
      if (floatingPlayer) floatingPlayer.classList.remove('show');
    },
    play: (surahNum, ayahNum, totalAyahs) => {
      AudioController.stop();
      const qari = localStorage.getItem('preferredQari') || 'ar.alafasy';
      const url = `https://cdn.islamic.network/quran/audio/128/${qari}/${surahNum}${ayahNum}.mp3`;
      currentAudioInstance = new Audio(url);
      currentAudioInstance.onended = () => {
        const isAutoEnabled = localStorage.getItem('autoAdvance') === 'true';
        if (ayahNum < totalAyahs) {
          if (isAutoEnabled) {
            AudioController.play(surahNum, ayahNum + 1, totalAyahs);
            document.getElementById(`ayah-${ayahNum + 1}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            AudioController.stop();
          }
        } else {
          AudioController.stop();
        }
      };
      currentAudioInstance.play().catch(e => console.log("Audio play failed", e));
    }
  };

  // Expose AudioController globally
  global.AudioController = AudioController;

  // Final Module Exposure to global scope
  global.IslamicModule = {
    init: async () => {
      try { await initDB(); } catch (e) { console.warn("DB Init failed", e); }
    },
    Quran: {
      ...QuranAPI,
      toggleAutoAdvance,
      getAutoAdvance: () => autoAdvanceEnabled
    },
    Hadith: HadithAPI,
    UI: UIRenderer,
    AudioManager: AudioManagerObj,
    Player: AdvancedAudioPlayer,
    OfflineManager: OfflineManager,
    View: ViewObject,
    getAICache,
    setAICache,
    renderDuaSection: (container, catId) => {
      if (typeof window.renderDuaSection === 'function') {
        window.renderDuaSection(container, catId);
      } else {
        console.error("renderDuaSection not found in global scope");
      }
    }
  };
})(window);
