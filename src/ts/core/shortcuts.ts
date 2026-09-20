import { qs, qsa, on } from '../utils/dom';
import { toggleTheme } from './theme';
import { setLanguage } from './i18n';
import { openModal, closeModal, isModalOpen } from '../features/modal';

const fontTypes = ['default', 'serif', 'monospace'] as const;
let currentFontIndex = 0;

export function initShortcuts(): void {
    const leftPanel = qs('.left-panel');
    const rightPanel = qs('.right-panel');
    let activeScrollTarget: HTMLElement | null = leftPanel;

    if (leftPanel)
        on(leftPanel, 'mouseenter', () => {
            activeScrollTarget = leftPanel;
        });
    if (rightPanel)
        on(rightPanel, 'mouseenter', () => {
            activeScrollTarget = rightPanel;
        });

    on(document, 'keydown', (e: KeyboardEvent) => {
        const activeTag = (document.activeElement?.tagName || '').toUpperCase();
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        const key = e.key.toLowerCase();

        // [ T ] -> Toggle Theme
        if (key === 't') {
            toggleTheme();
        }

        // [ L ] -> Toggle Language
        if (key === 'l') {
            const currentLang = document.documentElement.lang;
            setLanguage(currentLang === 'sv' ? 'en' : 'sv');
        }

        // [ C ] -> Toggle CV Modal
        if (key === 'c') {
            e.preventDefault();
            if (isModalOpen()) {
                closeModal();
            } else {
                openModal();
            }
        }

        // [ F ] -> Cycle Fonts
        if (key === 'f') {
            currentFontIndex = (currentFontIndex + 1) % fontTypes.length;
            const fontName = fontTypes[currentFontIndex];
            const targetFontBtn = qs(`.font-btn[data-font="${fontName}"]`);
            targetFontBtn?.click();
        }

        // [ 1 - 3 ] -> Open Project
        if (/^[1-3]$/.test(key)) {
            const visibleCards = qsa('.app-card').filter(card => card.style.display !== 'none');
            const targetIndex = parseInt(key, 10) - 1;
            if (targetIndex >= 0 && targetIndex < visibleCards.length) {
                const targetCard = visibleCards[targetIndex];
                const link = targetCard.querySelector<HTMLAnchorElement>('a.btn-primary[href]');
                if (link && link.href.length > 0) {
                    window.open(link.href, '_blank', 'noopener,noreferrer');
                }
            }
        }

        on(
            window,
            'mousemove',
            (e: MouseEvent) => {
                if (window.innerWidth > 1150) {
                    const divider = qs('.panel-divider');
                    const dividerX = divider
                        ? divider.getBoundingClientRect().left + divider.offsetWidth / 2
                        : window.innerWidth / 2;
                    activeScrollTarget = e.clientX < dividerX ? leftPanel : rightPanel;
                }
            },
            { passive: true }
        );
        // [ ↑ / ↓ ] -> Smart Scroll
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const scrollAmount = e.key === 'ArrowDown' ? 140 : -140;

            if (window.innerWidth <= 1024) {
                window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
            } else if (activeScrollTarget) {
                activeScrollTarget.scrollBy({ top: scrollAmount, behavior: 'smooth' });
            }
        }
    });
}
