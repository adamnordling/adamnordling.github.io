import { qs, on } from '../utils/dom';

export function initCardTilt(): void {
    const container = qs('.profile-card-container');
    const card = qs('.profile-card-inner');
    const spotlight = qs('.spotlight');

    if (!container || !card) return;

    let containerRect = container.getBoundingClientRect();
    let mouseX = 0;
    let mouseY = 0;
    let isHovering = false;
    let rafId: number | null = null;

    on(container, 'mouseenter', () => {
        containerRect = container.getBoundingClientRect();
        isHovering = true;
        // Smooth direct tracking without 1000ms elastic overshoot while moving
        card.style.transition = 'transform 120ms ease-out, box-shadow 200ms ease-out';
    });

    on(
        window,
        'resize',
        () => {
            containerRect = container.getBoundingClientRect();
        },
        { passive: true }
    );

    function updateTilt(): void {
        if (!isHovering || !card) return;

        const x = mouseX - containerRect.left;
        const y = mouseY - containerRect.top;
        const centerX = containerRect.width / 2;
        const centerY = containerRect.height / 2;

        // Controlled 10-degree tilt that keeps corner geometry stable
        const rotateX = -((y - centerY) / centerY) * 10;
        const rotateY = ((x - centerX) / centerX) * 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(1.02)`;
        card.style.boxShadow = 'rgba(0, 0, 0, 0.45) 0 16px 36px 0, rgba(255, 255, 255, 0.08) 0 0 0 1px';

        if (spotlight) {
            spotlight.style.opacity = '1';
            spotlight.style.background = `radial-gradient(circle at ${x.toFixed(0)}px ${y.toFixed(0)}px, rgba(255, 255, 255, 0.18), transparent 55%)`;
        }

        rafId = null;
    }

    on(
        container,
        'mousemove',
        (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            if (!rafId) {
                rafId = requestAnimationFrame(updateTilt);
            }
        },
        { passive: true }
    );

    on(container, 'mouseleave', () => {
        isHovering = false;
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        // Restore smooth elastic return animation
        card.style.transition =
            'transform 1000ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 1000ms cubic-bezier(0.34, 1.56, 0.64, 1)';
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
        card.style.boxShadow = '';
        if (spotlight) spotlight.style.opacity = '0';
    });
}
