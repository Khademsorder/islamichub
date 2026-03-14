/**
 * daily-content.js
 * Handles the logic for the "Daily Content" (Today's Ayah and Today's Hadith)
 * caching it locally so it only changes once per day.
 * Theme-synced version — uses CSS variables for full light/dark support.
 */

const DailyContentModule = (function () {
  const CACHE_KEY = "islamic_daily_content";

  // Hijri month names in Bangla
  const HIJRI_MONTHS = [
    'মুহাররম', 'সফর', 'রবিউল আওয়াল', 'রবিউস সানি',
    'জুমাদাল আওয়াল', 'জুমাদাস সানি', 'রজব', 'শাবান',
    'রমযান', 'শাওয়াল', 'যিলকদ', 'যিলহজ'
  ];

  const fallbackAyahs = [
    { text: "যে ব্যক্তি আল্লাহর উপর ভরসা করে তার জন্য তিনিই যথেষ্ট।", ref: "সূরা তালাক: ৩", arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", transliteration: "ওয়া মাইঁ ইয়াতাওয়াক্কাল আলাল্লাহি ফাহুয়া হাসবুহ।" },
    { text: "নিশ্চয়ই কষ্টের সাথেই রয়েছে স্বস্তি।", ref: "সূরা ইনশিরাহ: ৫", arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا", transliteration: "ফা-ইন্না মা'আল উসরি ইউসরা।" },
    { text: "তোমরা আমাকে ডাকো, আমি তোমাদের ডাকে সাড়া দিব।", ref: "সূরা গাফির: ৬০", arabic: "ادْعُونِي أَسْتَجِبْ لَكُمْ", transliteration: "উদ'ঊনী আস্তাজিব লাকুম।" },
    { text: "আর তোমরা নিরাশ হয়ো না এবং দুঃখ করো না।", ref: "সূরা আল-ইমরান: ১৩৯", arabic: "وَلَا تَهِنُوا وَلَا تَحْزَنُوا", transliteration: "ওয়া লা তাহিনূ ওয়া লা তাহযানূ।" }
  ];

  const fallbackHadiths = [
    { text: "যে ব্যক্তি মানুষের প্রতি দয়া করে না, আল্লাহ তার প্রতি দয়া করেন না।", ref: "সহিহ বুখারি, ৭৩৭৬" },
    { text: "তোমাদের মধ্যে সর্বোত্তম ওই ব্যক্তি, যে কোরআন শেখে এবং অন্যদের শেখায়।", ref: "সহিহ বুখারি, ৫০২৭" },
    { text: "বিশুদ্ধ নিয়ত ছাড়া কোনো আমল কবুল হয় না।", ref: "সহিহ বুখারি, ১" },
    { text: "পরিষ্কার-পরিচ্ছন্নতা ঈমানের অঙ্গ।", ref: "সহিহ মুসলিম, ২২৩" }
  ];

  const fallbackDuas = [
    { text: "হে আমাদের পালনকর্তা! আমাদেরকে দুনিয়াতে কল্যাণ দান করুন এবং আখেরাতেও কল্যাণ দান করুন এবং আমাদেরকে জাহান্নামের আযাব থেকে রক্ষা করুন।", ref: "সূরা বাকারাহ: ২০১", arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ" },
    { text: "হে আমার পালনকর্তা! আমার জ্ঞান বৃদ্ধি করুন।", ref: "সূরা ত্বাহা: ১১৪", arabic: "رَّبِّ زِدْنِي عِلْمًا" },
    { text: "হে আল্লাহ! আমি চিরঞ্জীব, চিরস্থায়ী সত্তার দোহাই দিয়ে আপনার রহমত কামনা করছি।", ref: "সুনান তিরমিজি, ৩৫২৪", arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ" }
  ];

  const getTodayIndex = (length) => {
    const today = Math.floor(Date.now() / 86400000);
    return today % length;
  };

  const getHijriDate = () => {
    try {
      // Adjusted for Bangladesh (usually 1 day behind standard ar-SA calculation during certain months)
      const date = new Date();

      const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
        day: 'numeric', month: 'numeric', year: 'numeric'
      });
      const parts = formatter.formatToParts(date);
      const normalize = (str) => String(str || '').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
      const day = normalize(parts.find(p => p.type === 'day')?.value);
      const month = parseInt(normalize(parts.find(p => p.type === 'month')?.value) || '1') - 1;
      const year = normalize(parts.find(p => p.type === 'year')?.value);
      const monthName = HIJRI_MONTHS[month] || '';
      return `${convertToBangla(day)} ${monthName}, ${convertToBangla(year)} হিজরি`;
    } catch (e) {
      return '';
    }
  };

  const convertToBangla = (str) => {
    const d = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(str).replace(/\d/g, n => d[n]);
  };

  const loadDailyContent = () => {
    const todayStr = new Date().toDateString();
    let cached = null;
    try {
      cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    } catch (e) { }

    // If cache belongs to today and has all required properties (ayah, hadith, dua), return it.
    // Check for .dua specifically to handle migration from older versions.
    if (cached && cached.date === todayStr && cached.dua && cached.ayah && cached.hadith) {
      return cached;
    }

    const newContent = {
      date: todayStr,
      ayah: fallbackAyahs[getTodayIndex(fallbackAyahs.length)],
      hadith: fallbackHadiths[getTodayIndex(fallbackHadiths.length)],
      dua: fallbackDuas[getTodayIndex(fallbackDuas.length)]
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(newContent));
    return newContent;
  };

  const renderDailyContent = () => {
    const container = document.getElementById("dailyContentArea");
    if (!container) return;
    const data = loadDailyContent();
    const gregDate = new Date().toLocaleDateString('bn-BD', { weekday: 'long', day: 'numeric', month: 'long' });

    const style = document.createElement('style');
    style.id = 'dailyCarouselStyle';
    if (!document.getElementById('dailyCarouselStyle')) {
      style.textContent = `
        .daily-carousel-container {
          position: relative;
          overflow: hidden;
          border-radius: 28px;
          background-color: #064e3b;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          border: 1px solid rgba(255,255,255,0.4);
          color: white;
          box-shadow: 0 15px 45px rgba(6, 78, 59, 0.12);
        }
        .daily-carousel-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(6, 78, 59, 0.50) 0%, rgba(13, 148, 136, 0.60) 100%);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          z-index: 1;
        }
        .daily-content-inner {
          position: relative;
          z-index: 2;
          padding: 16px;
          text-shadow: 0 2px 10px rgba(0,0,0,0.6);
        }
        .daily-slides-viewport {
          overflow: hidden;
          width: 100%;
          position: relative;
        }
        .daily-slides-wrapper {
          display: flex;
          transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
          width: 300%;
        }
        .daily-slide {
          width: 33.3333%;
          flex-shrink: 0;
          box-sizing: border-box;
          padding: 0 4px;
        }
        .daily-slide-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          text-shadow: 0 2px 12px rgba(0,0,0,0.8);
        }
        .daily-indicators {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin-top: 12px;
          padding-bottom: 4px;
        }
        .daily-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transition: all 0.3s;
          cursor: pointer;
        }
        .daily-dot.active {
          background: #fbbf24;
          width: 18px;
          border-radius: 6px;
        }
      `;
      document.head.appendChild(style);
    }

    const randomId = Math.floor(Math.random() * 5) + 1;
    const bgUrl = `./img/streak-bg-${randomId}.png`;

    container.innerHTML = `
      <div class="daily-carousel-container" id="dailyCarousel" style="background-image: url('${bgUrl}')">
        <div class="daily-content-inner">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h2 style="font-size:14px; font-weight:800; margin:0; display:flex; align-items:center; gap:6px; color:white;">
              <span class="material-symbols-rounded" style="color:#fbbf24; font-size:18px;">auto_awesome</span> আজকের অনুপ্রেরণা
            </h2>
            <div style="font-size:10px; font-weight:700; color:white; background:rgba(255,255,255,0.15); padding:3px 10px; border-radius:12px; border:1px solid rgba(255,255,255,0.2);">${gregDate}</div>
          </div>

          <div class="daily-slides-viewport">
            <div class="daily-slides-wrapper" id="dailySlidesWrapper">
              <!-- Slide 1: Ayah -->
              <div class="daily-slide">
                 <div class="daily-slide-content">
                    <div style="margin-bottom:6px;"><span style="font-size:9px; background:#fbbf24; color:#064e3b; font-weight:800; letter-spacing:0.5px; text-transform:uppercase; padding:2px 6px; border-radius:4px;">📖 আল-কুরআন</span></div>
                    <div style="font-family:'Scheherazade New',serif; font-size:18px; text-align:right; margin-bottom:6px; line-height:1.4; direction:rtl; color:#fbbf24; font-weight:bold;">${data.ayah.arabic}</div>
                    <div style="font-size:13px; font-weight:700; color:white; margin-bottom:4px; line-height:1.4;">${data.ayah.text}</div>
                    <div style="font-size:11px; text-align:right; color:rgba(255,255,255,0.8); font-weight:700;">— ${data.ayah.ref}</div>
                 </div>
              </div>
              <!-- Slide 2: Hadith -->
              <div class="daily-slide">
                 <div class="daily-slide-content">
                    <div style="margin-bottom:6px;"><span style="font-size:9px; background:#fbbf24; color:#064e3b; font-weight:800; letter-spacing:0.5px; text-transform:uppercase; padding:2px 6px; border-radius:4px;">📜 আল-হাদিস</span></div>
                    <div style="font-size:13px; font-weight:700; color:white; line-height:1.5; margin-bottom:6px;">"${data.hadith.text}"</div>
                    <div style="font-size:11px; text-align:right; color:rgba(255,255,255,0.8); font-weight:700;">— ${data.hadith.ref}</div>
                 </div>
              </div>
              <!-- Slide 3: Dua -->
              <div class="daily-slide">
                 <div class="daily-slide-content">
                    <div style="margin-bottom:6px;"><span style="font-size:9px; background:#fbbf24; color:#064e3b; font-weight:800; letter-spacing:0.5px; text-transform:uppercase; padding:2px 6px; border-radius:4px;">🤲 মাসনুন দোয়া</span></div>
                    <div style="font-family:'Scheherazade New',serif; font-size:18px; text-align:right; margin-bottom:6px; line-height:1.4; direction:rtl; color:#fbbf24; font-weight:bold;">${data.dua.arabic}</div>
                    <div style="font-size:13px; font-weight:700; color:white; margin-bottom:6px; line-height:1.4;">${data.dua.text}</div>
                    <div style="font-size:11px; text-align:right; color:rgba(255,255,255,0.8); font-weight:700;">— ${data.dua.ref}</div>
                 </div>
              </div>
            </div>
          </div>

          <div class="daily-indicators" id="dailyIndicators">
             <div class="daily-dot active" data-index="0"></div>
             <div class="daily-dot" data-index="1"></div>
             <div class="daily-dot" data-index="2"></div>
          </div>
        </div>
      </div>
    `;

    setTimeout(initCarousel, 50);
  };

  const initCarousel = () => {
    const wrapper = document.getElementById('dailySlidesWrapper');
    const dots = document.querySelectorAll('.daily-dot');
    if (!wrapper || !dots.length) return;

    let currentIndex = 0;
    const totalSlides = dots.length;
    let autoPlayInterval;

    const goToSlide = (idx) => {
      currentIndex = idx;
      wrapper.style.transform = `translateX(-${currentIndex * 33.333}%)`;
      dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
    };

    const startAutoPlay = () => {
      clearInterval(autoPlayInterval);
      autoPlayInterval = setInterval(() => goToSlide((currentIndex + 1) % totalSlides), 8000);
    };

    dots.forEach((dot, idx) => {
      dot.onclick = () => {
        goToSlide(idx);
        startAutoPlay();
      };
    });

    // Touch Support
    let startX = 0;
    const carousel = document.getElementById('dailyCarousel');
    if (carousel) {
      carousel.ontouchstart = (e) => {
        startX = e.touches[0].clientX;
        clearInterval(autoPlayInterval);
      };
      carousel.ontouchend = (e) => {
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) goToSlide((currentIndex + 1) % totalSlides);
          else goToSlide((currentIndex - 1 + totalSlides) % totalSlides);
        }
        startAutoPlay();
      };
    }

    startAutoPlay();
  };

  return { renderDailyContent };
})();
