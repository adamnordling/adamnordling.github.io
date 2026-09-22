import { qs, on } from '../utils/dom';

export function initCardTilt(): void {
    // Only run on desktop devices with hover and a mouse pointer
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        return;
    }

    const container = qs('.profile-card-container');
    const card = qs('.profile-card-inner');
    const spotlight = qs('.spotlight');

    if (!container || !card) return;

    // Explicit non-null bindings preserve narrowing across hoisted function closures
    const cardContainer: HTMLElement = container;
    const cardElement: HTMLElement = card;

    let containerRect: DOMRect | null = null;
    let mouseX = 0;
    let mouseY = 0;
    let isHovering = false;
    let rafId: number | null = null;

    on(cardContainer, 'mouseenter', () => {
        containerRect = cardContainer.getBoundingClientRect();
        isHovering = true;
        cardElement.style.transition = 'transform 120ms ease-out, box-shadow 200ms ease-out';
    });

    on(
        window,
        'resize',
        () => {
            if (isHovering) {
                containerRect = cardContainer.getBoundingClientRect();
            }
        },
        { passive: true }
    );

    function updateTilt(): void {
        if (!isHovering) return;

        if (!containerRect) {
            containerRect = cardContainer.getBoundingClientRect();
        }

        const x = mouseX - containerRect.left;
        const y = mouseY - containerRect.top;
        const centerX = containerRect.width / 2;
        const centerY = containerRect.height / 2;

        const rotateX = -((y - centerY) / centerY) * 10;
        const rotateY = ((x - centerX) / centerX) * 10;

        cardElement.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(1.02)`;
        cardElement.style.boxShadow = 'rgba(0, 0, 0, 0.45) 0 16px 36px 0, rgba(255, 255, 255, 0.08) 0 0 0 1px';

        if (spotlight) {
            spotlight.style.opacity = '1';
            spotlight.style.background = `radial-gradient(circle at ${x.toFixed(0)}px ${y.toFixed(0)}px, rgba(255, 255, 255, 0.18), transparent 55%)`;
        }

        rafId = null;
    }

    on(
        cardContainer,
        'mousemove',
        (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            if (rafId === null) {
                rafId = requestAnimationFrame(updateTilt);
            }
        },
        { passive: true }
    );

    on(cardContainer, 'mouseleave', () => {
        isHovering = false;
        containerRect = null;
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        cardElement.style.transition =
            'transform 1000ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 1000ms cubic-bezier(0.34, 1.56, 0.64, 1)';
        cardElement.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
        cardElement.style.boxShadow = '';
        if (spotlight) spotlight.style.opacity = '0';
    });
}
