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

    let wrapperLeft = 0;
    let wrapperRight = 0;
    let wrapperTop = 0;
    let wrapperBottom = 0;
    let dockTop = 0;

    let leftPanelLeft = 0;
    let leftPanelRight = 0;
    let leftPanelTop = 0;
    let leftPanelBottom = 0;
    let rightPanelLeft = 0;
    let hasCenterGutter = false;

    // Bounding boxes of content that must NEVER have dots underneath
    let leftPanelExclusions: DOMRect[] = [];

    const DARK_BASE_ALPHA = 0.12;
    const DARK_GLOW_ALPHA = 0.9;
    const LIGHT_BASE_ALPHA = 0.12;
    const LIGHT_GLOW_ALPHA = 0.55;
    const DOT_SPACING = 28;
    const FADE_MARGIN = 100;
    const TEXT_SAFETY_CLEARANCE = 16; // 16px buffer around all text and cards

    function updateExclusionRects(): void {
        const selectors = [
            '.profile-card-container',
            '.profile-links',
            '.name-title',
            '.subtitle',
            '.cv-action-wrapper',
            '.intro-quote.bio-card',
            '.section-edu',
            '.section-skills',
            '.section-activity',
            '.theme-toggle',
            '.dock-mobile-lang',
            '.white-talk-bubble'
        ];

        leftPanelExclusions = [];
        for (let i = 0; i < selectors.length; i++) {
            const elements = document.querySelectorAll<HTMLElement>(selectors[i]);
            elements.forEach(el => {
                if (el.offsetWidth > 0 && el.offsetHeight > 0) {
                    leftPanelExclusions.push(el.getBoundingClientRect());
                }
            });
        }
    }

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
            leftPanelLeft = lpRect.left;
            leftPanelRight = lpRect.right;
            leftPanelTop = lpRect.top;
            leftPanelBottom = lpRect.bottom;
            rightPanelLeft = rpRect.left;
            hasCenterGutter = rightPanelLeft - leftPanelRight > 30;

            updateExclusionRects();
        } else {
            hasCenterGutter = false;
            leftPanelExclusions = [];
        }

        draw();
    }

    on(window, 'resize', updateBounds, { passive: true });
    updateBounds();

    // Re-calculate exclusion bounds whenever left panel scrolls
    const leftPanel = document.querySelector<HTMLElement>('.left-panel');
    if (leftPanel) {
        on(
            leftPanel,
            'scroll',
            () => {
                updateExclusionRects();
                wakeAnimation();
            },
            { passive: true }
        );
    }

    // Re-calculate when bio card expands or transitions
    const bioCard = document.querySelector<HTMLElement>('#bio-card');
    if (bioCard) {
        on(bioCard, 'transitionend', () => {
            updateExclusionRects();
            wakeAnimation();
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
        const isMobile = width <= 1024;
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
                let dotFade = 0;

                if (!isMobile) {
                    // 1. Center Canyon between panels (around the divider)
                    if (isInCenterGutter && y >= wrapperTop && y <= wrapperBottom) {
                        const gutterWidth = rightPanelLeft - leftPanelRight;
                        const normalized = (x - leftPanelRight) / gutterWidth;
                        dotFade = Math.sin(normalized * Math.PI) * 0.85;
                    }
                    // 2. Outer side flanks
                    else if (isLeftFlank) {
                        dotFade = Math.min(1, Math.max(0, (wrapperLeft - x) / FADE_MARGIN));
                    } else if (isRightFlank) {
                        dotFade = Math.min(1, Math.max(0, (x - wrapperRight) / FADE_MARGIN));
                    }
                    // 3. Top Void (above the container)
                    else if (y < wrapperTop && x >= wrapperLeft && x <= wrapperRight) {
                        const distToWrapper = wrapperTop - y;
                        dotFade = Math.min(1, Math.max(0, distToWrapper / 25)) * 0.7;

                        // Exclude top-left controls
                        for (let i = 0; i < leftPanelExclusions.length; i++) {
                            const r = leftPanelExclusions[i];
                            if (x >= r.left - 10 && x <= r.right + 10 && y >= r.top - 10 && y <= r.bottom + 10) {
                                dotFade = 0;
                                break;
                            }
                        }
                    }
                    // 4. Bottom Void (between container bottom and status dock)
                    else if (y > wrapperBottom && y < dockTop && x >= wrapperLeft && x <= wrapperRight) {
                        const distFromWrapper = y - wrapperBottom;
                        const distToDock = dockTop - y;
                        dotFade = Math.min(1, Math.max(0, Math.min(distFromWrapper, distToDock) / 16)) * 0.7;
                    }
                    // 5. Crevices inside Left Panel (between Bio, Education, Skills, and around title)
                    else if (x >= leftPanelLeft && x <= leftPanelRight && y >= leftPanelTop && y <= leftPanelBottom) {
                        let minDist = 9999;
                        let isInsideExcluded = false;

                        for (let i = 0; i < leftPanelExclusions.length; i++) {
                            const r = leftPanelExclusions[i];
                            // Direct hit with safety padding
                            if (x >= r.left - 12 && x <= r.right + 12 && y >= r.top - 12 && y <= r.bottom + 12) {
                                isInsideExcluded = true;
                                break;
                            }
                            const dx = Math.max(0, r.left - x, x - r.right);
                            const dy = Math.max(0, r.top - y, y - r.bottom);
                            const d = Math.hypot(dx, dy);
                            if (d < minDist) minDist = d;
                        }

                        // Only render if safely outside text clearance
                        if (!isInsideExcluded && minDist >= TEXT_SAFETY_CLEARANCE) {
                            dotFade = Math.min(0.42, (minDist - TEXT_SAFETY_CLEARANCE) / 20);
                        }
                    }

                    if (dotFade <= 0) {
                        continue;
                    }
                } else {
                    dotFade = 0.65;
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
