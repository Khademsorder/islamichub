/**
 * ═══════════════════════════════════════════════════
 * Islamic Hub — Aero Ultra Engine v3.0 (Flagship)
 * Spring Physics, Intent Prefetching, Noise-Glass UI
 * ═══════════════════════════════════════════════════
 */

(function () {
    'use strict';

    // ═══ 1. ULTRA RENDERING — Glass & Noise ═══
    const injectUltraStyles = () => {
        const style = document.createElement('style');
        style.textContent = `
            :root {
                --spring-easing: linear(0, 0.45 10%, 0.65 20%, 0.76 30%, 0.84 40%, 0.89 50%, 0.94 60%, 0.97 70%, 0.99 80%, 1);
                --aero-blur: saturate(180%) blur(20px);
            }

            /* Flagship Glass with subtle Noise */
            .premium-glass {
                background: rgba(255, 255, 255, 0.72) !important;
                backdrop-filter: var(--aero-blur) !important;
                -webkit-backdrop-filter: var(--aero-blur) !important;
                position: relative;
                overflow: hidden;
            }

            .premium-glass::before {
                content: "";
                position: absolute;
                inset: 0;
                background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
                opacity: 0.04;
                pointer-events: none;
                z-index: -1;
            }

            [data-theme="dark"] .premium-glass {
                background: rgba(12, 26, 20, 0.82) !important;
            }

            /* Spring-based Transitions */
            .view-transition {
                transition: transform 0.6s var(--spring-easing), opacity 0.4s ease;
            }

            /* GPU Over-optimization */
            * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

            /* Aero-Skeleton System */
            .aero-skeleton {
                background: linear-gradient(-90deg, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%);
                background-size: 400% 400%;
                animation: aero-shimmer 1.5s ease-in-out infinite;
                border-radius: 12px;
                min-height: 20px;
            }
            @keyframes aero-shimmer {
                0% { background-position: 100% 0; }
                100% { background-position: -100% 0; }
            }
            [data-theme="dark"] .aero-skeleton {
                background: linear-gradient(-90deg, #2a2a2a 0%, #3a3a3a 50%, #2a2a2a 100%);
            }
        `;
        document.head.appendChild(style);
    };

    // ═══ 2. SPRING PHYSICS CONTROLLER ═══
    const Spring = {
        animate: (el, props, duration = 600) => {
            if (!el) return;
            el.style.transition = `all ${duration}ms var(--spring-easing)`;
            Object.assign(el.style, props);
        }
    };

    // ═══ 3. HAPTIC ORCHESTRATOR ═══
    const Haptics = {
        light: () => window.Capacitor?.Plugins?.Haptics?.impact({ style: 'LIGHT' }).catch(() => { }),
        medium: () => window.Capacitor?.Plugins?.Haptics?.impact({ style: 'MEDIUM' }).catch(() => { }),
        heavy: () => window.Capacitor?.Plugins?.Haptics?.impact({ style: 'HEAVY' }).catch(() => { }),
        selection: () => window.Capacitor?.Plugins?.Haptics?.selectionStart().catch(() => { }),
        success: () => window.Capacitor?.Plugins?.Haptics?.notification({ type: 'SUCCESS' }).catch(() => { }),
        impact: (options) => {
            const style = (options?.style || 'MEDIUM').toUpperCase();
            if (style === 'LIGHT') return Haptics.light();
            if (style === 'HEAVY') return Haptics.heavy();
            return Haptics.medium();
        }
    };

    // ═══ 4. INTENT PREFETCH v2 ═══
    const setupIntentPrefetch = () => {
        document.addEventListener('mouseover', (e) => {
            const el = e.target.closest('[data-prefetch-url]');
            if (el && el.dataset.prefetchUrl) {
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = el.dataset.prefetchUrl;
                document.head.appendChild(link);
            }
        }, { passive: true });
    };

    // ═══ 5. SCROLL BOUNDS HAPTIC ═══
    const initScrollLimits = () => {
        window.addEventListener('scroll', () => {
            const st = window.pageYOffset || document.documentElement.scrollTop;
            if (st <= 0 || st + window.innerHeight >= document.documentElement.scrollHeight) {
                Haptics.selection();
            }
        }, { passive: true });
    };

    // ═══ 6. MEMORY & CACHE ENGINE ═══
    const AI_CACHE_KEY = 'aero_universal_ai_cache';
    const getAICache = () => {
        try { return JSON.parse(localStorage.getItem(AI_CACHE_KEY) || '{}'); } catch (e) { return {}; }
    };
    const setAICache = (key, val) => {
        const cache = getAICache();
        // Multi-prop storage for backward/forward compatibility
        cache[key.substring(0, 100)] = {
            v: val, response: val,
            t: Date.now(), timestamp: Date.now()
        };
        const keys = Object.keys(cache);
        if (keys.length > 100) delete cache[keys[0]];
        localStorage.setItem(AI_CACHE_KEY, JSON.stringify(cache));
    };

    // ═══ 7. SKELETON MANAGER ═══
    const showSkeletons = (containerSelector, count = 5) => {
        const container = document.querySelector(containerSelector);
        if (!container) return;
        container.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const skel = document.createElement('div');
            skel.className = 'aero-skeleton';
            skel.style.margin = '10px 0';
            skel.style.height = '60px';
            container.appendChild(skel);
        }
    };

    // ═══ 8. CORE UPGRADE INITIALIZATION ═══
    const initUltra = () => {
        injectUltraStyles();
        setupIntentPrefetch();
        initScrollLimits();

        // Global Tap Delegate for Light Haptics
        document.addEventListener('click', (e) => {
            if (e.target.closest('button, .nav-item, .card, .q-card, .surah-item')) {
                Haptics.light();
            }
        }, { passive: true });

        console.log('[Aero Ultra] v3.0 Engine Initialized');
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUltra);
    } else {
        initUltra();
    }

    // Export Ultra API — The Flagship Suite
    window.AeroUltra = {
        animate: Spring.animate,
        haptics: Haptics,
        showSkeletons: showSkeletons,
        getAICache: getAICache,
        setAICache: setAICache,
        prefetch: (url) => {
            const link = document.createElement('link');
            link.rel = 'prefetch'; link.href = url; document.head.appendChild(link);
        },
        // Backward compatibility
        prefetchAudio: (url) => window.AeroUltra.prefetch(url),
        // Direct haptic aliases
        light: Haptics.light,
        medium: Haptics.medium,
        selection: Haptics.selection,
        success: Haptics.success
    };

    // Legacy Support
    window.AeroTurbo = window.AeroUltra;
})();

console.log('[Islamic Hub] ⚡ Aero Ultra Engine v3.0 Active');
