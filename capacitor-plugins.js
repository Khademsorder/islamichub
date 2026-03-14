/**
 * ═══════════════════════════════════════════════════
 * Islamic Hub — Premium Native Bridge
 * Capacitor Plugin Initialization & Native Features
 * ═══════════════════════════════════════════════════
 */

// ── Wait for Capacitor to be ready ──
document.addEventListener('DOMContentLoaded', async () => {
  
  // Check if running inside Capacitor
  const isNative = window.Capacitor && window.Capacitor.isNativePlatform();
  
  if (!isNative) {
    console.log('[Islamic Hub] Running in browser mode');
    return;
  }

  console.log('[Islamic Hub] Native platform detected — initializing plugins...');

  // ═══ 0. LOCAL NOTIFICATIONS + SHORTCUTS + MUSIC CONTROLS (Core Feature Wiring) ═══
  // LocalNotifications: schedule prayer/daily reminders if enabled
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    try {
      await LocalNotifications.createChannel({
        id: 'islamic_hub',
        name: 'Islamic Hub',
        description: 'Prayer & daily reminders',
        importance: 4,
        visibility: 1,
        vibration: true
      });
    } catch (e) {
    }

    LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
      try {
        const extra = action && action.notification ? (action.notification.extra || {}) : {};
        if (extra && extra.type === 'daily') {
          if (typeof Logic !== 'undefined' && Logic.showHomeView) {
            Logic.showHomeView();
          }
        }
      } catch (e) {
      }
    });

    // Reschedule at app start (best effort)
    if (typeof NotificationService !== 'undefined') {
      try {
        if (NotificationService.isPrayerNotifEnabled && NotificationService.isPrayerNotifEnabled()) {
          NotificationService.schedulePrayerNotifications && NotificationService.schedulePrayerNotifications();
        }
        if (NotificationService.isDailyNotifEnabled && NotificationService.isDailyNotifEnabled()) {
          NotificationService.scheduleDailyNotification && NotificationService.scheduleDailyNotification();
        }
      } catch (e) {
      }
    }
  } catch (e) {
    console.warn('[Islamic Hub] LocalNotifications not available:', e.message);
  }

  // App Shortcuts: quick actions
  try {
    const { AppShortcuts } = await import('@capawesome/capacitor-app-shortcuts');
    await AppShortcuts.set({
      shortcuts: [
        { id: 'open_quran', title: 'কুরআন', description: 'কুরআন খুলুন', androidIcon: 'ic_menu_book' },
        { id: 'open_qibla', title: 'কিবলা', description: 'কিবলা কম্পাস', androidIcon: 'ic_menu_compass' },
        { id: 'open_scanner', title: 'স্ক্যানার', description: 'ফটো স্ক্যানার', androidIcon: 'ic_menu_camera' }
      ]
    });

    AppShortcuts.addListener('click', (event) => {
      try {
        const id = event && event.shortcutId;
        if (id === 'open_quran') {
          window.location.href = 'quran.html';
          return;
        }
        if (id === 'open_qibla') {
          if (typeof QiblaService !== 'undefined' && QiblaService.showQiblaView) {
            QiblaService.showQiblaView();
          }
          return;
        }
        if (id === 'open_scanner') {
          if (typeof VisionService !== 'undefined' && VisionService.initScanner) {
            VisionService.initScanner();
          }
          return;
        }
      } catch (e) {
      }
    });
  } catch (e) {
    console.warn('[Islamic Hub] AppShortcuts not available:', e.message);
  }

  // Music Controls: register listener (quran-module.js will handle if player exists)
  try {
    const { CapacitorMusicControls } = await import('capacitor-music-controls-plugin');
    // Expose globally for quran-module.js
    window.CapacitorMusicControls = CapacitorMusicControls;
  } catch (e) {
    console.warn('[Islamic Hub] MusicControls plugin not available:', e.message);
  }

  // ═══ 1. STATUS BAR SYNC ═══
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    
    // Get current theme
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    
    await StatusBar.setStyle({ 
      style: isDark ? Style.Dark : Style.Light 
    });
    await StatusBar.setBackgroundColor({ 
      color: isDark ? '#0a1a14' : '#0a5438' 
    });
    await StatusBar.setOverlaysWebView({ overlay: false });
    
    console.log('[Islamic Hub] ✅ StatusBar synced');

    // Listen for theme changes to auto-sync StatusBar
    const observer = new MutationObserver(async (mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'data-theme') {
          const dark = document.body.getAttribute('data-theme') === 'dark';
          try {
            await StatusBar.setStyle({ 
              style: dark ? Style.Dark : Style.Light 
            });
            await StatusBar.setBackgroundColor({ 
              color: dark ? '#0a1a14' : '#0a5438' 
            });
          } catch(e) {}
        }
      }
    });
    observer.observe(document.body, { attributes: true });
    
  } catch (e) {
    console.warn('[Islamic Hub] StatusBar not available:', e.message);
  }

  // ═══ 2. SPLASH SCREEN — Hide after app loads ═══
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    // Wait a bit for content to render, then hide native splash
    setTimeout(async () => {
      await SplashScreen.hide({ fadeOutDuration: 400 });
      console.log('[Islamic Hub] ✅ Splash screen hidden');
    }, 800);
  } catch (e) {
    console.warn('[Islamic Hub] SplashScreen not available:', e.message);
  }

  // ═══ 3. BACK BUTTON — Smart Navigation (Don't close app) ═══
  try {
    const { App } = await import('@capacitor/app');

    App.addListener('backButton', ({ canGoBack }) => {
      // Check if any modal/overlay is open first
      const openModal = document.querySelector('.modal-overlay.show');
      const openSidebar = document.querySelector('.sidebar.open');
      const resultArea = document.getElementById('resultArea');
      const namazArea = document.getElementById('namazArea');
      const storiesSection = document.getElementById('storiesSection');
      const isQuranPage = /\/quran\.html(\?|#|$)/i.test(window.location.pathname || '') || /quran\.html/i.test(window.location.href || '');

      // Priority 1: Close modal
      if (openModal) {
        openModal.classList.remove('show');
        return;
      }
      
      // Priority 2: Close sidebar
      if (openSidebar) {
        if (typeof UI !== 'undefined' && UI.toggleSidebar) {
          UI.toggleSidebar();
        }
        return;
      }

      // Priority 3: Go back from result/detail views
      if (resultArea && resultArea.style.display !== 'none') {
        if (typeof Logic !== 'undefined' && Logic.goBack) {
          Logic.goBack();
        }
        return;
      }

      if (namazArea && namazArea.style.display !== 'none') {
        if (typeof Logic !== 'undefined' && Logic.goBack) {
          Logic.goBack();
        }
        return;
      }

      const misconceptionsContainer = document.getElementById('misconceptionsContainer');
      if (misconceptionsContainer && misconceptionsContainer.style.display !== 'none') {
        if (typeof Logic !== 'undefined' && Logic.goBack) {
          Logic.goBack();
        }
        return;
      }

      const duaSection = document.getElementById('duaSection');
      if (duaSection && duaSection.style.display !== 'none') {
        if (typeof Logic !== 'undefined' && Logic.goBack) {
          Logic.goBack();
        }
        return;
      }

      if (storiesSection && storiesSection.style.display !== 'none' && storiesSection.innerHTML.trim() !== '') {
        if (typeof Logic !== 'undefined' && Logic.goBack) {
          Logic.goBack();
        }
        return;
      }

      // Priority 4: If on QA view (not home), go to home
      if (Logic && Logic.currentView === 'qa') {
        if (typeof Logic !== 'undefined' && Logic.showHomeView) {
          Logic.showHomeView();
        }
        return;
      }

      // Priority 4: If WebView can go back
      if (canGoBack) {
        window.history.back();
        return;
      }

      // Priority 5: Never exit on back. Navigate inside app.
      if (isQuranPage) {
        window.location.href = 'islamic.html';
        return;
      }

      if (typeof Logic !== 'undefined' && Logic.showHomeView) {
        Logic.showHomeView();
        return;
      }

      showNativeToast('Home চাপলে বের হবে');
    });

    // Deep Link handler
    App.addListener('appUrlOpen', (event) => {
      const url = event.url;
      console.log('[Islamic Hub] Deep link opened:', url);
      // Handle deep links - navigate to specific sections
      if (url.includes('/quran')) {
        window.location.href = 'quran.html';
      } else if (url.includes('/namaz')) {
        if (typeof NamazModule !== 'undefined') NamazModule.showNamazView();
      } else if (url.includes('/dua')) {
        if (typeof showDuaSection !== 'undefined') showDuaSection();
      }
    });

    // App state change (foreground/background)
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        console.log('[Islamic Hub] App resumed to foreground');
        // Refresh prayer times when app comes back
        if (typeof PrayerTimeModule !== 'undefined' && PrayerTimeModule.init) {
          PrayerTimeModule.init();
        }
      }
    });

    console.log('[Islamic Hub] ✅ Back button & Deep links configured');
  } catch (e) {
    console.warn('[Islamic Hub] App plugin not available:', e.message);
  }

  // ═══ 4. KEYBOARD — Adjust layout when keyboard opens ═══
  try {
    const { Keyboard } = await import('@capacitor/keyboard');
    
    Keyboard.addListener('keyboardWillShow', (info) => {
      document.body.style.paddingBottom = info.keyboardHeight + 'px';
      const bottomNav = document.querySelector('.bottom-nav');
      if (bottomNav) bottomNav.style.display = 'none';
    });

    Keyboard.addListener('keyboardWillHide', () => {
      document.body.style.paddingBottom = '70px';
      const bottomNav = document.querySelector('.bottom-nav');
      if (bottomNav) bottomNav.style.display = '';
    });

    console.log('[Islamic Hub] ✅ Keyboard handling configured');
  } catch (e) {
    console.warn('[Islamic Hub] Keyboard plugin not available:', e.message);
  }

  // ═══ 5. GEOLOCATION — Permission for Prayer Times & Qibla ═══
  try {
    const { Geolocation } = await import('@capacitor/geolocation');
    const perm = await Geolocation.checkPermissions();
    if (perm.location !== 'granted') {
      await Geolocation.requestPermissions();
    }
    console.log('[Islamic Hub] ✅ Geolocation permissions ready');
  } catch (e) {
    console.warn('[Islamic Hub] Geolocation not available:', e.message);
  }

  // ═══ 6. CAMERA — Permission for Vision Scanner ═══
  try {
    const { Camera } = await import('@capacitor/camera');
    const perm = await Camera.checkPermissions();
    if (perm.camera !== 'granted') {
      await Camera.requestPermissions();
    }
    console.log('[Islamic Hub] ✅ Camera permissions ready');
  } catch (e) {
    console.warn('[Islamic Hub] Camera not available:', e.message);
  }

  // ═══ 7. PUSH NOTIFICATIONS — Firebase Setup ═══
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    
    const permStatus = await PushNotifications.checkPermissions();
    
    if (permStatus.receive === 'prompt') {
      await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'denied') {
      await PushNotifications.register();

      PushNotifications.addListener('registration', (token) => {
        console.log('[Islamic Hub] ✅ Push token:', token.value);
        // Store token for server-side use
        try {
          localStorage.setItem('fcm_token', token.value);
        } catch(e) {}
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('[Islamic Hub] Push registration error:', error);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('[Islamic Hub] Push received:', notification);
        showNativeToast(notification.title || notification.body || 'নতুন নোটিফিকেশন');
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('[Islamic Hub] Push action:', notification);
      });

      console.log('[Islamic Hub] ✅ Push Notifications configured');
    }
  } catch (e) {
    console.warn('[Islamic Hub] Push Notifications not available:', e.message);
  }

  // ═══ 8. NATIVE PREFERENCES — High-speed data storage ═══
  try {
    const { Preferences } = await import('@capacitor/preferences');
    
    // Expose native storage helpers globally
    window.NativeStorage = {
      set: async (key, value) => {
        await Preferences.set({ key, value: JSON.stringify(value) });
      },
      get: async (key) => {
        const { value } = await Preferences.get({ key });
        return value ? JSON.parse(value) : null;
      },
      remove: async (key) => {
        await Preferences.remove({ key });
      },
      clear: async () => {
        await Preferences.clear();
      }
    };
    
    console.log('[Islamic Hub] ✅ Native Preferences ready');
  } catch (e) {
    console.warn('[Islamic Hub] Preferences not available:', e.message);
  }

  console.log('[Islamic Hub] 🎉 All native plugins initialized successfully!');
});


// ── Haptic Feedback Helper ──
window.hapticFeedback = async (style = 'MEDIUM') => {
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    const impactStyle = ImpactStyle[style] || ImpactStyle.Medium;
    await Haptics.impact({ style: impactStyle });
  } catch (e) {
    // Silently fail in browser
  }
};

// ── Native Toast Helper ──
function showNativeToast(message, duration = 1000) {
  // Remove existing
  const existing = document.getElementById('nativeToast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.id = 'nativeToast';
  toast.style.cssText = `
    position:fixed;top:max(20px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);
    background:linear-gradient(135deg,#0A5438,#059669);color:#fff;
    padding:14px 28px;border-radius:50px;z-index:999999;
    font-weight:700;font-size:14px;font-family:'Noto Sans Bengali',sans-serif;
    display:flex;align-items:center;gap:8px;
    box-shadow:0 8px 24px rgba(10,84,56,0.3);
    animation:toastSlideIn 0.3s ease;
  `;
  toast.innerHTML = `<span class="material-symbols-rounded" style="font-size:18px;">info</span><span>${message}</span>`;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'toastSlideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── Expose toast globally ──
window.showNativeToast = showNativeToast;

// ── Native Share Helper ──
window.nativeShare = async (options = {}) => {
  const shareData = {
    title: options.title || 'Islamic Hub',
    text: options.text || 'অসাধারণ একটি ইসলামিক অ্যাপ!',
    url: options.url || window.location.href,
    dialogTitle: options.dialogTitle || 'শেয়ার করুন'
  };

  // Try Capacitor Share first (native app)
  if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
    try {
      const { Share } = await import('@capacitor/share');
      await Share.share(shareData);
      return true;
    } catch (e) {
      console.warn('[Islamic Hub] Native share failed:', e.message);
    }
  }

  // Fallback to Web Share API
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return true;
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.warn('[Islamic Hub] Web share failed:', e);
      }
      return false;
    }
  }

  // Final fallback - copy to clipboard
  try {
    await navigator.clipboard.writeText(shareData.url);
    showNativeToast('লিঙ্ক কপি করা হয়েছে!');
    return true;
  } catch (e) {
    showNativeToast('শেয়ার সাপোর্ট করছে না');
    return false;
  }
};
