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

// Lägg till denna funktion längst ner i src/ts/main.ts (eller anropa den i DOMContentLoaded)
function initZoneScrolling(): void {
    const leftPanel = document.querySelector<HTMLElement>('.left-panel');
    const rightPanel = document.querySelector<HTMLElement>('.right-panel');
    const divider = document.querySelector<HTMLElement>('.panel-divider');
    if (!leftPanel || !rightPanel) return;

    window.addEventListener(
        'wheel',
        (e: WheelEvent) => {
            // Only active on desktop split view
            if (window.innerWidth <= 1150) return;

            const target = e.target as HTMLElement | null;
            const isInsideLeft = !!target?.closest('.left-panel');
            const isInsideRight = !!target?.closest('.right-panel');

            // If mouse is outside the content panels (flanks, divider canyon, top/bottom voids):
            if (!isInsideLeft && !isInsideRight) {
                e.preventDefault();

                // Exact physical X coordinate of the 1px divider
                const dividerX = divider
                    ? divider.getBoundingClientRect().left + divider.offsetWidth / 2
                    : window.innerWidth / 2;

                if (e.clientX < dividerX) {
                    leftPanel.scrollBy({ top: e.deltaY, behavior: 'auto' });
                } else {
                    rightPanel.scrollBy({ top: e.deltaY, behavior: 'auto' });
                }
            }
        },
        { passive: false }
    );
}

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
    initZoneScrolling();

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
