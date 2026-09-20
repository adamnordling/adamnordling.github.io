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
    initZoneScrolling();
    initMobileMarqueeTelemetry();

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

interface MetricInfo {
    title: { en: string; sv: string };
    desc: { en: string; sv: string };
}

function initMobileMarqueeTelemetry(): void {
    // 1. Get the elements
    // 1. Fetch raw elements
    const rawTrack = document.getElementById('mobile-marquee-track');
    const rawCard = document.getElementById('m-inspector-card');
    const rawTitle = document.getElementById('m-inspector-title');
    const rawDesc = document.getElementById('m-inspector-desc');
    const rawCloseBtn = document.getElementById('m-inspector-close');
    const pills = document.querySelectorAll<HTMLElement>('.m-pill');

    // 2. Early return if any are missing
    if (!rawTrack || !rawCard || !rawTitle || !rawDesc || !rawCloseBtn) return;

    // 3. Re-assign to strict constants.
    // This permanently proves to TypeScript's closure analysis that these are HTMLElement (NEVER null)
    const track: HTMLElement = rawTrack;
    const inspectorCard: HTMLElement = rawCard;
    const inspectorTitle: HTMLElement = rawTitle;
    const inspectorDesc: HTMLElement = rawDesc;
    const closeBtn: HTMLElement = rawCloseBtn;

    const metricData: Record<string, MetricInfo> = {
        lh: {
            title: { en: 'Lighthouse 4×100', sv: 'Lighthouse 4×100' },
            desc: {
                en: 'Verified perfect 100/100/100/100 score across Performance, Accessibility, Best Practices, and SEO.',
                sv: 'Verifierade perfekta 100/100/100/100 poäng inom Prestanda, Tillgänglighet, Bästa praxis och SEO.'
            }
        },
        lcp: {
            title: { en: 'Largest Contentful Paint', sv: 'Largest Contentful Paint' },
            desc: {
                en: 'Measures perceived page load speed in real-time via PerformanceObserver API. Sub-200ms target.',
                sv: 'Mäter faktisk laddningshastighet i realtid via PerformanceObserver API. Målvärde under 200ms.'
            }
        },
        cls: {
            title: { en: 'Cumulative Layout Shift', sv: 'Cumulative Layout Shift' },
            desc: {
                en: 'Real-time visual stability score. 0.000 verifies zero layout shift or jumping content during render.',
                sv: 'Visuell layoutstabilitet i realtid. 0.000 bekräftar noll layout-ryck eller hoppande text.'
            }
        },
        runtime: {
            title: { en: 'Vite 5 · ESNext', sv: 'Vite 5 · ESNext' },
            desc: {
                en: 'Compiled directly to native ECMAScript modules with zero client framework overhead (no React/Vue weight).',
                sv: 'Kompilerat direkt till webbläsarens native ES-moduler helt utan tunga ramverk som React eller Vue.'
            }
        },
        ts: {
            title: { en: 'TypeScript Strict', sv: 'TypeScript Strict' },
            desc: {
                en: 'Built with strictNullChecks, noImplicitAny, and zero type bypasses for strict runtime reliability.',
                sv: 'Utvecklat med strictNullChecks, noImplicitAny och noll typfusk för maximal kodstabilitet.'
            }
        },
        layer: {
            title: { en: 'CSS @layer Architecture', sv: 'CSS @layer Arkitektur' },
            desc: {
                en: 'Architectural cascade layer organization (reset, base, components, utilities) eliminating specificity clashes.',
                sv: 'Kaskad-lager (reset, base, components, utilities) som eliminerar CSS-konflikter och minimerar filstorlek.'
            }
        }
    };

    function closeInspector(): void {
        track.classList.remove('is-paused');
        inspectorCard.classList.add('hidden');
        pills.forEach(p => {
            p.classList.remove('is-active');
        });
    }

    pills.forEach(pill => {
        pill.addEventListener('click', e => {
            e.stopPropagation();

            const metricKey = pill.getAttribute('data-metric');
            if (!metricKey || !(metricKey in metricData)) return;

            const isAlreadyActive = pill.classList.contains('is-active');
            if (isAlreadyActive) {
                closeInspector();
                return;
            }

            // 1. Pausa rullningen
            track.classList.add('is-paused');
            pills.forEach(p => {
                p.classList.remove('is-active');
            });

            // 2. Markera samma märke i båda uppsättningarna
            document.querySelectorAll<HTMLElement>(`.m-pill[data-metric="${metricKey}"]`).forEach(p => {
                p.classList.add('is-active');
            });

            // 3. Fyll i data baserat på valt språk
            const currentLang = document.documentElement.lang === 'sv' ? 'sv' : 'en';
            const data = metricData[metricKey];
            inspectorTitle.textContent = data.title[currentLang];
            inspectorDesc.textContent = data.desc[currentLang];

            // 4. Visa kortet
            inspectorCard.classList.remove('hidden');
        });
    });

    closeBtn.addEventListener('click', e => {
        e.stopPropagation();
        closeInspector();
    });

    document.addEventListener('click', e => {
        const target = e.target as HTMLElement | null;
        if (!target || !target.closest('.m-pill')) {
            closeInspector();
        }
    });
}

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
