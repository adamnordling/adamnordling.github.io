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

        const rotateX = -((y - centerY) / centerY) * 12;
        const rotateY = ((x - centerX) / centerX) * 12;

        card.style.transform = `perspective(800px) rotateX(${rotateX.toString()}deg) rotateY(${rotateY.toString()}deg) scale(1.03)`;
        card.style.boxShadow = 'rgba(255, 255, 255, 0.08) 0 15px 35px 0';

        if (spotlight) {
            spotlight.style.opacity = '1';
            spotlight.style.background = `radial-gradient(circle at ${x.toString()}px ${y.toString()}px, rgba(255, 255, 255, 0.18), transparent 55%)`;
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
        card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
        card.style.boxShadow = 'rgba(0, 0, 0, 0.29) 0 4px 25px 0';
        if (spotlight) spotlight.style.opacity = '0';
    });
}
