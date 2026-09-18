import { qs, on } from '../utils/dom';

export function initCanvasBackground(): void {
    const canvas = qs('#bg-canvas') as HTMLCanvasElement | null;
    const portfolioWrapper = qs('.portfolio-wrapper');
    if (!canvas || !portfolioWrapper) return;

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

    const DARK_BASE_ALPHA = 0.12;
    const DARK_GLOW_ALPHA = 0.9;
    const LIGHT_BASE_ALPHA = 0.12;
    const LIGHT_GLOW_ALPHA = 0.55;
    const DOT_SPACING = 28;
    const FADE_MARGIN = 100;

    function updateBounds(): void {
        if (!canvas || !portfolioWrapper) return;
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        const rect = portfolioWrapper.getBoundingClientRect();
        wrapperLeft = rect.left;
        wrapperRight = rect.right;
        draw();
    }

    on(window, 'resize', updateBounds, { passive: true });
    updateBounds();

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
            let flankFade = 1.0;
            if (!isMobile) {
                if (x < wrapperLeft) {
                    flankFade = Math.min(1, Math.max(0, (wrapperLeft - x) / FADE_MARGIN));
                } else if (x > wrapperRight) {
                    flankFade = Math.min(1, Math.max(0, (x - wrapperRight) / FADE_MARGIN));
                } else {
                    continue;
                }
            } else {
                flankFade = 0.65;
            }

            for (let y = DOT_SPACING / 2; y < height; y += DOT_SPACING) {
                const dx = mouseX - x;
                const dy = mouseY - y;
                const distSq = dx * dx + dy * dy;

                if (distSq < touchRadiusSq) {
                    activeDots.push({ x, y, distSq, flankFade });
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
