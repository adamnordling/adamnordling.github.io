import { qs, on } from '../utils/dom';

export function initCanvasBackground(): void {
    const canvas = qs('#bg-canvas') as HTMLCanvasElement | null;
    const portfolioWrapper = qs('.portfolio-wrapper');
    const contentContainer = qs('.main-container');
    if (!canvas || !portfolioWrapper || !contentContainer) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let mouseX = -1000;
    let mouseY = -1000;
    let isAnimating = false;
    let stopTimeout: ReturnType<typeof setTimeout> | null = null;
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;

    let wrapperLeft = 0;
    let wrapperRight = 0;
    let wrapperTop = 0;
    let wrapperBottom = 0;
    let dockTop = 0;

    let leftPanelRight = 0;
    let rightPanelLeft = 0;
    let hasCenterGutter = false;

    // Line-by-line text and icon bounding rects
    let textExclusions: DOMRect[] = [];
    const textRange = document.createRange();

    const DARK_BASE_ALPHA = 0.12;
    const DARK_GLOW_ALPHA = 0.9;
    const LIGHT_BASE_ALPHA = 0.12;
    const LIGHT_GLOW_ALPHA = 0.55;
    const DOT_SPACING = 28;
    const FADE_MARGIN = 100;

    // Clearance distance in pixels around letters & icons
    const TEXT_CLEARANCE = 4;
    const FADE_ZONE = 6;

    const textSelectors = [
        '.name-title',
        '.subtitle',
        '#view-title',
        '.section-edu h2',
        '.section-skills h2',
        '.right-header h2',
        '.section-activity h2',
        'h1',
        'h2',
        'h3',
        '.edu-degree-title',
        '.edu-date-badge',
        '.edu-school-preview span',
        '.edu-course-count',
        '.course-item > span:first-child',
        '.bio-teaser',
        '.bio-expandable-content p',
        '.skill-group-name',
        '.skill-horizontal-preview',
        '.sub-skill-item > span:first-child',
        '.app-content h3',
        '.app-content p',
        '.tech-drawer-label',
        '.tech-drawer-text',
        '.activity-title',
        '.activity-desc',
        '.activity-time',
        '.white-talk-bubble p',
        '.m-inspector-desc'
    ];

    const visualSelectors = [
        '.profile-img',
        '.profile-links a svg',
        '.profile-links button svg',
        '.cv-action-wrapper',
        '.bio-hint',
        '.thesis-btn',
        '.filter-trigger',
        '.app-img-container img',
        '.app-img-container svg',
        '.app-status-badge',
        '.btn-primary',
        '.btn-secondary',
        '.m-pill',
        '.stat-pill',
        '.activity-item'
    ];

    function isElementVisible(el: HTMLElement): boolean {
        if (el.offsetWidth === 0 || el.offsetHeight === 0) return false;

        const techDrawer = el.closest('.app-tech-drawer');
        if (techDrawer && !techDrawer.classList.contains('is-active')) return false;

        const eduDrawer = el.closest('.edu-vertical-drawer');
        if (eduDrawer) {
            const eduGroup = el.closest('.edu-group');
            if (!eduGroup || !eduGroup.classList.contains('is-expanded')) return false;
        }

        const courseBubble = el.closest('.course-item .white-talk-bubble');
        if (courseBubble) {
            const courseItem = el.closest('.course-item');
            if (!courseItem || !courseItem.classList.contains('has-bubble-open')) return false;
        }

        const bioExpandable = el.closest('.bio-expandable');
        if (bioExpandable) {
            const bioCard = el.closest('.bio-card');
            if (!bioCard || !bioCard.classList.contains('is-expanded')) return false;
        }

        const skillDrawer = el.closest('.skill-vertical-drawer');
        if (skillDrawer) {
            const skillGroup = el.closest('.skill-group');
            if (!skillGroup || !skillGroup.classList.contains('is-expanded')) return false;
        }

        const talkBubble = el.closest('.white-talk-bubble');
        if (talkBubble) {
            const subSkill = el.closest('.sub-skill-item');
            if (!subSkill || !subSkill.classList.contains('has-bubble-open')) return false;
        }

        const inspector = el.closest('.m-inspector-card');
        if (inspector && inspector.classList.contains('hidden')) return false;

        const modal = el.closest('#cv-modal');
        if (modal && !modal.classList.contains('is-open')) return false;

        return true;
    }

    function updateExclusionRects(): void {
        // 1. Mobile/tablet screens never need heavy text exclusion (background is behind cards)
        if (window.innerWidth <= 1150) {
            textExclusions = [];
            return;
        }

        textExclusions = [];

        // 2. Desktop line-by-line text measurements
        const textEls = document.querySelectorAll<HTMLElement>(textSelectors.join(', '));
        textEls.forEach(el => {
            if (!isElementVisible(el)) return;
            try {
                textRange.selectNodeContents(el);
                const rects = textRange.getClientRects();
                for (let i = 0; i < rects.length; i++) {
                    const r = rects[i];
                    if (r.width > 0 && r.height > 0 && r.bottom >= -15 && r.top <= height + 15) {
                        textExclusions.push(r);
                    }
                }
            } catch {
                const r = el.getBoundingClientRect();
                if (r.width > 0 && r.height > 0 && r.bottom >= -15 && r.top <= height + 15) {
                    textExclusions.push(r);
                }
            }
        });

        // 3. Desktop visual boundaries for buttons/images
        const visualEls = document.querySelectorAll<HTMLElement | SVGElement>(visualSelectors.join(', '));
        visualEls.forEach(el => {
            if (!isElementVisible(el as HTMLElement)) return;
            const r = el.getBoundingClientRect();
            if (r.width > 0 && r.height > 0 && r.bottom >= -15 && r.top <= height + 15) {
                textExclusions.push(r);
            }
        });
    }

    let hasMeasuredExclusions = false;

    function updateBounds(): void {
        if (!canvas || !contentContainer) return;
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;

        const rect = contentContainer.getBoundingClientRect();
        wrapperLeft = rect.left;
        wrapperRight = rect.right;
        wrapperTop = rect.top;
        wrapperBottom = rect.bottom;

        const dock = document.querySelector<HTMLElement>('.status-dock');
        dockTop = dock ? dock.getBoundingClientRect().top : height - 42;

        const leftPanel = document.querySelector<HTMLElement>('.left-panel');
        const rightPanel = document.querySelector<HTMLElement>('.right-panel');

        if (leftPanel && rightPanel && window.innerWidth > 1150) {
            const lpRect = leftPanel.getBoundingClientRect();
            const rpRect = rightPanel.getBoundingClientRect();
            leftPanelRight = lpRect.right;
            rightPanelLeft = rpRect.left;
            hasCenterGutter = rightPanelLeft - leftPanelRight > 30;
        } else {
            hasCenterGutter = false;
        }

        // Only measure text on desktop AND only after the deferred initialization has passed
        if (hasMeasuredExclusions && window.innerWidth > 1150) {
            updateExclusionRects();
        }
        draw();
    }

    // Debounced resize listener prevents mobile emulation boot from triggering layout reflows
    on(
        window,
        'resize',
        () => {
            if (resizeTimeout) clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                updateBounds();
            }, 150);
        },
        { passive: true }
    );

    function initCanvasDimensions(): void {
        if (!canvas) return;
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        draw();
    }

    initCanvasDimensions();

    function runDeferredExclusionUpdate(): void {
        if (hasMeasuredExclusions) return;
        hasMeasuredExclusions = true;
        if (window.innerWidth > 1150) {
            updateBounds();
        }
    }

    // Defer heavy text measurements well beyond initial render window
    window.addEventListener('load', () => {
        setTimeout(runDeferredExclusionUpdate, 1500);
    });

    window.addEventListener('mousemove', runDeferredExclusionUpdate, { once: true, passive: true });
    window.addEventListener('touchstart', runDeferredExclusionUpdate, { once: true, passive: true });

    let reflowTimeout: ReturnType<typeof setTimeout> | null = null;

    function scheduleExclusionUpdate(): void {
        // Skip entirely on mobile/tablet screens
        if (window.innerWidth <= 1150 || !hasMeasuredExclusions) return;

        if (reflowTimeout) clearTimeout(reflowTimeout);
        reflowTimeout = setTimeout(() => {
            requestAnimationFrame(() => {
                updateExclusionRects();
                wakeAnimation();
            });
        }, 60);
    }

    const leftPanel = document.querySelector<HTMLElement>('.left-panel');
    if (leftPanel) {
        on(leftPanel, 'scroll', scheduleExclusionUpdate, { passive: true });
    }

    const rightPanel = document.querySelector<HTMLElement>('.right-panel');
    if (rightPanel) {
        on(rightPanel, 'scroll', scheduleExclusionUpdate, { passive: true });
    }

    const mainWrapper = document.querySelector<HTMLElement>('.portfolio-wrapper');
    if (mainWrapper) {
        on(mainWrapper, 'transitionend', () => {
            if (window.innerWidth > 1150) {
                updateExclusionRects();
                wakeAnimation();
            }
        });
    }

    function renderLoop(): void {
        if (!isAnimating) return;
        draw();
        requestAnimationFrame(renderLoop);
    }

    function wakeAnimation(): void {
        if (!isAnimating) {
            isAnimating = true;
            requestAnimationFrame(renderLoop);
        }
        if (stopTimeout) clearTimeout(stopTimeout);
        stopTimeout = setTimeout(() => {
            isAnimating = false;
            draw();
        }, 400);
    }

    on(document, 'visibilitychange', () => {
        if (document.hidden) {
            isAnimating = false;
            if (stopTimeout) clearTimeout(stopTimeout);
        } else {
            draw();
        }
    });

    on(
        window,
        'mousemove',
        (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            wakeAnimation();
        },
        { passive: true }
    );

    on(window, 'mouseleave', () => {
        mouseX = -1000;
        mouseY = -1000;
        wakeAnimation();
    });

    on(
        window,
        'touchmove',
        (e: TouchEvent) => {
            if (e.touches.length > 0) {
                mouseX = e.touches[0].clientX;
                mouseY = e.touches[0].clientY;
                wakeAnimation();
            }
        },
        { passive: true }
    );

    on(
        window,
        'touchend',
        () => {
            setTimeout(() => {
                mouseX = -1000;
                mouseY = -1000;
                wakeAnimation();
            }, 200);
        },
        { passive: true }
    );

    interface ActiveDot {
        x: number;
        y: number;
        distSq: number;
        flankFade: number;
    }

    function draw(): void {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);

        const isLight = document.body.classList.contains('light-theme');
        const isMobile = width <= 1150;
        const baseColor = isLight ? 'rgba(0, 0, 0, ' : 'rgba(255, 255, 255, ';
        const touchRadius = isMobile ? 100 : 140;
        const touchRadiusSq = touchRadius * touchRadius;
        const defaultAlpha = (isLight ? LIGHT_BASE_ALPHA : DARK_BASE_ALPHA) * 0.7;

        ctx.beginPath();
        ctx.fillStyle = `${baseColor}${defaultAlpha.toString()})`;

        const activeDots: ActiveDot[] = [];

        for (let x = DOT_SPACING / 2; x < width; x += DOT_SPACING) {
            const isLeftFlank = x < wrapperLeft;
            const isRightFlank = x > wrapperRight;
            const isInCenterGutter = hasCenterGutter && x > leftPanelRight && x < rightPanelLeft;

            for (let y = DOT_SPACING / 2; y < height; y += DOT_SPACING) {
                let dotFade: number;

                if (!isMobile) {
                    if (isInCenterGutter && y >= wrapperTop && y <= wrapperBottom) {
                        const gutterWidth = rightPanelLeft - leftPanelRight;
                        const normalized = (x - leftPanelRight) / gutterWidth;
                        dotFade = Math.sin(normalized * Math.PI) * 0.85;
                    } else if (isLeftFlank) {
                        dotFade = Math.min(1, Math.max(0, (wrapperLeft - x) / FADE_MARGIN));
                    } else if (isRightFlank) {
                        dotFade = Math.min(1, Math.max(0, (x - wrapperRight) / FADE_MARGIN));
                    } else if (y < wrapperTop && x >= wrapperLeft && x <= wrapperRight) {
                        const distToWrapper = wrapperTop - y;
                        dotFade = Math.min(1, Math.max(0, distToWrapper / 25)) * 0.7;
                    } else if (y > wrapperBottom && y < dockTop && x >= wrapperLeft && x <= wrapperRight) {
                        const distFromWrapper = y - wrapperBottom;
                        const distToDock = dockTop - y;
                        dotFade = Math.min(1, Math.max(0, Math.min(distFromWrapper, distToDock) / 16)) * 0.7;
                    } else {
                        dotFade = 0.55;
                    }
                } else {
                    dotFade = 0.65;
                }

                if (dotFade <= 0) continue;

                // On mobile, textExclusions is empty, skipping this entire loop
                if (textExclusions.length > 0) {
                    const maxZone = TEXT_CLEARANCE + FADE_ZONE;
                    const maxZoneSq = maxZone * maxZone;
                    const clearSq = TEXT_CLEARANCE * TEXT_CLEARANCE;
                    let minTextDistSq = 999999;

                    for (let i = 0; i < textExclusions.length; i++) {
                        const r = textExclusions[i];
                        const dx = Math.max(0, r.left - x, x - r.right);
                        const dy = Math.max(0, r.top - y, y - r.bottom);
                        const dSq = dx * dx + dy * dy;

                        if (dSq < minTextDistSq) {
                            minTextDistSq = dSq;
                            if (minTextDistSq === 0) break;
                        }
                    }

                    if (minTextDistSq <= clearSq) {
                        continue;
                    }

                    if (minTextDistSq < maxZoneSq) {
                        const dist = Math.sqrt(minTextDistSq);
                        dotFade *= (dist - TEXT_CLEARANCE) / FADE_ZONE;
                        if (dotFade <= 0.02) continue;
                    }
                }

                const dx = mouseX - x;
                const dy = mouseY - y;
                const distSq = dx * dx + dy * dy;

                if (distSq < touchRadiusSq) {
                    activeDots.push({ x, y, distSq, flankFade: dotFade });
                } else {
                    ctx.moveTo(x + 1.3, y);
                    ctx.arc(x, y, 1.3, 0, Math.PI * 2);
                }
            }
        }
        ctx.fill();

        const glowAlphaMax = isLight ? LIGHT_GLOW_ALPHA : DARK_GLOW_ALPHA;

        for (let i = 0; i < activeDots.length; i++) {
            const dot = activeDots[i];
            const dist = Math.sqrt(dot.distSq);
            const influence = 1 - dist / touchRadius;
            const radius = 1.3 + influence * 2.2;
            const alpha = (defaultAlpha + influence * (glowAlphaMax - defaultAlpha)) * dot.flankFade;

            ctx.beginPath();
            ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(59, 130, 246, ${alpha.toString()})`;
            ctx.fill();
        }
    }
}
