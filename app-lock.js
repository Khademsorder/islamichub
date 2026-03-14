const AppLockService = (() => {
    const LOCK_KEY = 'app_lock_enabled';
    const LAST_UNLOCK_KEY = 'app_lock_last_unlock';

    let _isChecking = false;

    const isEnabled = () => localStorage.getItem(LOCK_KEY) === 'true';

    const setEnabled = (enabled) => {
        localStorage.setItem(LOCK_KEY, enabled ? 'true' : 'false');
    };

    const _markUnlockedNow = () => {
        try {
            localStorage.setItem(LAST_UNLOCK_KEY, String(Date.now()));
        } catch (e) {
        }
    };

    const _needsUnlock = () => {
        if (!isEnabled()) return false;
        const last = parseInt(localStorage.getItem(LAST_UNLOCK_KEY) || '0');
        // Re-lock quickly after background; 30s grace
        return (Date.now() - last) > 30000;
    };

    async function _verifyBiometric() {
        try {
            const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
            const avail = await NativeBiometric.isAvailable({ useFallback: true });
            if (!avail || !avail.isAvailable) {
                return false;
            }
            await NativeBiometric.verifyIdentity({
                reason: 'অ্যাপ আনলক করতে যাচাই করুন',
                title: 'App Lock',
                subtitle: 'Islamic Hub',
                description: 'আপনার ডিভাইসের বায়োমেট্রিক/পিন ব্যবহার করুন'
            });
            _markUnlockedNow();
            return true;
        } catch (e) {
            return false;
        }
    }

    async function ensureUnlocked() {
        if (!_needsUnlock()) return true;
        if (_isChecking) return false;
        _isChecking = true;
        try {
            const ok = await _verifyBiometric();
            if (!ok) {
                try {
                    if (typeof PermissionService !== 'undefined' && PermissionService.showDeniedMessage) {
                        PermissionService.showDeniedMessage('App Lock যাচাই করা যায়নি।');
                    } else if (typeof UI !== 'undefined' && UI.showToast) {
                        UI.showToast('App Lock যাচাই করা যায়নি।');
                    }
                } catch (e2) {
                }
            }
            return ok;
        } finally {
            _isChecking = false;
        }
    }

    async function init() {
        try {
            if (!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform())) {
                return;
            }
            const { App } = await import('@capacitor/app');
            App.addListener('resume', async () => {
                await ensureUnlocked();
            });

            // Initial gate
            setTimeout(() => {
                ensureUnlocked();
            }, 350);
        } catch (e) {
        }
    }

    return {
        init,
        ensureUnlocked,
        isEnabled,
        setEnabled
    };
})();

// Auto-init
try {
    document.addEventListener('DOMContentLoaded', () => {
        if (AppLockService && AppLockService.init) AppLockService.init();
    });
} catch (e) {
}
