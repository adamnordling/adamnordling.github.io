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
    initPerformanceMonitoring();

    window.addEventListener('load', () => {
        setTimeout(() => {
            void loadGitHubActivity();
        }, 1500);
    });

    // Döda alla kvarvarande gamla service workers för gott
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .getRegistrations()
            .then(regs => {
                for (const r of regs) {
                    void r.unregister();
                }
            })
            .catch(() => {});
    }
});

interface MetricInfo {
    title: { en: string; sv: string };
    desc: { en: string; sv: string };
}

function initMobileMarqueeTelemetry(): void {
    const rawViewport = document.getElementById('mobile-marquee-viewport');
    const rawTrack = document.getElementById('mobile-marquee-track');
    const rawCard = document.getElementById('m-inspector-card');
    const rawTitle = document.getElementById('m-inspector-title');
    const rawDesc = document.getElementById('m-inspector-desc');
    const rawCloseBtn = document.getElementById('m-inspector-close');
    const pills = document.querySelectorAll<HTMLElement>('.m-pill');

    if (!rawViewport || !rawTrack || !rawCard || !rawTitle || !rawDesc || !rawCloseBtn) return;

    const viewport: HTMLElement = rawViewport;
    const track: HTMLElement = rawTrack;
    const inspectorCard: HTMLElement = rawCard;
    const inspectorTitle: HTMLElement = rawTitle;
    const inspectorDesc: HTMLElement = rawDesc;
    const closeBtn: HTMLElement = rawCloseBtn;

    const MARQUEE_DURATION = 22; // Matches CSS animation 22s
    let currentTrackX = 0;
    let activeMetricKey: string | null = null;
    let resumeTimeout: ReturnType<typeof setTimeout> | null = null;

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
            title: { en: 'Vite 8 · ESNext', sv: 'Vite 8 · ESNext' },
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

    function getTrackTranslateX(): number {
        const style = window.getComputedStyle(track);
        const transform = style.transform;
        if (!transform || transform === 'none') return 0;
        try {
            const matrix = new DOMMatrix(transform);
            return matrix.m41;
        } catch {
            const match = /matrix\([^,]+,[^,]+,[^,]+,[^,]+,\s*([^,]+)/.exec(transform);
            return match ? parseFloat(match[1]) : 0;
        }
    }

    function resumeRolling(atX: number): void {
        const halfWidth = track.scrollWidth / 2;
        if (halfWidth <= 0) return;

        let normalizedX = atX;
        while (normalizedX > 0) normalizedX -= halfWidth;
        while (normalizedX < -halfWidth) normalizedX += halfWidth;
        currentTrackX = normalizedX;

        const progress = Math.abs(normalizedX) / halfWidth;
        const elapsed = progress * MARQUEE_DURATION;

        track.classList.remove('is-paused');
        track.style.animation = `marquee-roll ${MARQUEE_DURATION.toString()}s linear infinite`;
        track.style.animationDelay = `-${elapsed.toFixed(3)}s`;
        track.style.transform = '';
    }

    function freezeRolling(): void {
        currentTrackX = getTrackTranslateX();
        track.style.animation = 'none';
        track.style.transform = `translateX(${currentTrackX.toFixed(2)}px)`;
        track.classList.add('is-paused');
    }

    function closeInspector(): void {
        activeMetricKey = null;
        inspectorCard.classList.add('hidden');
        pills.forEach(p => {
            p.classList.remove('is-active');
        });

        if (track.style.animation === 'none') {
            resumeRolling(currentTrackX);
        } else {
            track.classList.remove('is-paused');
        }
    }

    function scheduleResume(): void {
        if (resumeTimeout) clearTimeout(resumeTimeout);
        resumeTimeout = setTimeout(() => {
            // Only resume if user does NOT currently have an open inspector card
            if (!activeMetricKey && inspectorCard.classList.contains('hidden')) {
                resumeRolling(currentTrackX);
            }
        }, 1000);
    }

    // --- SWIPE / DRAG HANDLERS ---
    let isPointerDown = false;
    let isDragging = false;
    let justSwiped = false;
    let startX = 0;
    let startY = 0;
    let dragStartX = 0;

    viewport.addEventListener('pointerdown', (e: PointerEvent) => {
        if (resumeTimeout) clearTimeout(resumeTimeout);
        isPointerDown = true;
        isDragging = false;
        startX = e.clientX;
        startY = e.clientY;
        freezeRolling();
        dragStartX = currentTrackX;
    });

    window.addEventListener('pointermove', (e: PointerEvent) => {
        if (!isPointerDown) return;

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        if (!isDragging) {
            // Check if user is scrolling sideways vs vertical document scroll
            if (Math.abs(deltaX) > 5 && Math.abs(deltaX) > Math.abs(deltaY)) {
                isDragging = true;
                viewport.classList.add('is-dragging');
                try {
                    track.setPointerCapture(e.pointerId);
                } catch {
                    // Ignored if capture unsupported
                }
            } else if (Math.abs(deltaY) > 5) {
                // Vertical page scroll: abort marquee drag
                isPointerDown = false;
                scheduleResume();
                return;
            }
        }

        if (isDragging) {
            const halfWidth = track.scrollWidth / 2;
            if (halfWidth > 0) {
                let nextX = dragStartX + deltaX;
                while (nextX > 0) nextX -= halfWidth;
                while (nextX < -halfWidth) nextX += halfWidth;
                currentTrackX = nextX;
                track.style.transform = `translateX(${currentTrackX.toFixed(2)}px)`;
            }
        }
    });

    const onPointerUp = (e: PointerEvent): void => {
        if (!isPointerDown) return;
        isPointerDown = false;
        viewport.classList.remove('is-dragging');

        if (isDragging) {
            isDragging = false;
            justSwiped = true;
            setTimeout(() => {
                justSwiped = false;
            }, 60);

            try {
                if (track.hasPointerCapture(e.pointerId)) {
                    track.releasePointerCapture(e.pointerId);
                }
            } catch {
                // Ignored
            }
        }

        scheduleResume();
    };

    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    // --- PILL CLICK LOGIC ---
    pills.forEach(pill => {
        pill.addEventListener('click', e => {
            e.stopPropagation();

            // Prevent mobile browser focus-scroll fighting our layout
            pill.blur();

            if (justSwiped) return;

            const metricKey = pill.getAttribute('data-metric');
            if (!metricKey || !(metricKey in metricData)) return;

            const isAlreadyActive = pill.classList.contains('is-active');
            if (isAlreadyActive) {
                closeInspector();
                return;
            }

            if (resumeTimeout) clearTimeout(resumeTimeout);
            freezeRolling();

            activeMetricKey = metricKey;
            pills.forEach(p => {
                p.classList.remove('is-active');
            });

            // Highlight in both sets
            document.querySelectorAll<HTMLElement>(`.m-pill[data-metric="${metricKey}"]`).forEach(p => {
                p.classList.add('is-active');
            });

            const currentLang = document.documentElement.lang === 'sv' ? 'sv' : 'en';
            const data = metricData[metricKey];
            inspectorTitle.textContent = data.title[currentLang];
            inspectorDesc.textContent = data.desc[currentLang];
            inspectorCard.classList.remove('hidden');

            // Anchor view to the true bottom so BOTH the card text and pills stay in view
            const anchorToBottom = (): void => {
                window.scrollTo({
                    top: document.documentElement.scrollHeight,
                    behavior: 'smooth'
                });
            };

            requestAnimationFrame(() => {
                anchorToBottom();
                setTimeout(anchorToBottom, 120);
            });
        });
    });

    closeBtn.addEventListener('click', e => {
        e.stopPropagation();
        closeInspector();
    });

    // Dismiss only when clicking outside pills AND outside inspector card
    document.addEventListener('click', e => {
        const target = e.target as HTMLElement | null;
        if (!target || !target.closest('.m-pill, .m-inspector-card')) {
            if (!inspectorCard.classList.contains('hidden')) {
                closeInspector();
            }
        }
    });

    window.addEventListener('site:languagechange', (e: Event) => {
        const custom = e as CustomEvent<{ lang: 'en' | 'sv' }>;
        const lang = custom.detail.lang;
        if (activeMetricKey !== null) {
            const data = metricData[activeMetricKey];
            inspectorTitle.textContent = data.title[lang];
            inspectorDesc.textContent = data.desc[lang];
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
