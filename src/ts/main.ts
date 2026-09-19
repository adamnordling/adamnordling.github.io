import { initTheme } from './core/theme';
import { initI18n } from './core/i18n';
import { initClock } from './core/clock';
import { initShortcuts } from './core/shortcuts';
import { initPerformanceMonitoring } from './utils/dom';
import { initCanvasBackground } from './features/canvas-bg';
import { initCardTilt } from './features/tilt';
import { initModal } from './features/modal';
import { initProjectFilter } from './features/filter';
import { initSkillsAndBio } from './features/skills';
import { initClipboard } from './features/clipboard';
import { loadGitHubActivity } from './services/github';

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initI18n();
    initClock();
    initShortcuts();
    initCanvasBackground();
    initCardTilt();
    initModal();
    initProjectFilter();
    initSkillsAndBio();
    initClipboard();

    // 2. Defer network API call until main thread is idle (Removes 1.4s critical chain!)
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            void loadGitHubActivity();
        });
    } else {
        setTimeout(() => {
            void loadGitHubActivity();
        }, 300);
    }

    initPerformanceMonitoring();

    // Register Service Worker
    if (
        'serviceWorker' in navigator &&
        (window.location.protocol === 'https:' ||
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1')
    ) {
        window.addEventListener('load', () => {
            navigator.serviceWorker
                .register('./sw.js')
                .then(reg => {
                    console.warn('Service Worker registered! Scope:', reg.scope);
                })
                .catch((err: unknown) => {
                    console.error('Service Worker registration failed:', err);
                });
        });
    }
});
