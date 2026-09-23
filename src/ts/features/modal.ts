import { qs, qsa, on } from '../utils/dom';

let previousActiveElement: HTMLElement | null = null;

function getFocusableElements(element: HTMLElement): HTMLElement[] {
    return qsa('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', element).filter(
        el => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true'
    );
}

export function openModal(): void {
    const cvModal = qs('#cv-modal');
    const mainContent = qs('.portfolio-wrapper');
    if (!cvModal) return;

    if (mainContent) mainContent.setAttribute('inert', '');

    previousActiveElement = document.activeElement as HTMLElement | null;
    const cvIframe = cvModal.querySelector('iframe');

    if (cvIframe && !cvIframe.getAttribute('src')) {
        const dataSrc = cvIframe.getAttribute('data-src');
        if (dataSrc) cvIframe.setAttribute('src', dataSrc);
    }

    cvModal.classList.add('is-open');
    cvModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    const focusables = getFocusableElements(cvModal);
    if (focusables.length > 0) {
        focusables[0].focus();
    }
}

export function closeModal(): void {
    const cvModal = qs('#cv-modal');
    const mainContent = qs('.portfolio-wrapper');
    if (!cvModal) return;

    if (mainContent) mainContent.removeAttribute('inert');

    cvModal.classList.remove('is-open');
    cvModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    // Smoothly restore focus to the button that triggered the modal
    if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        requestAnimationFrame(() => {
            previousActiveElement?.focus();
        });
    }
}

export function isModalOpen(): boolean {
    const cvModal = qs('#cv-modal');
    return cvModal?.classList.contains('is-open') ?? false;
}

export function initModal(): void {
    const openCvBtn = qs('#open-cv-modal');
    const closeCvBtn = qs('#close-cv-modal');
    const cvModal = qs('#cv-modal');

    on(openCvBtn, 'click', openModal);
    on(closeCvBtn, 'click', closeModal);

    if (cvModal) {
        on(cvModal, 'click', (e: MouseEvent) => {
            if (e.target === cvModal) closeModal();
        });

        on(cvModal, 'keydown', (e: KeyboardEvent) => {
            if (!cvModal.classList.contains('is-open')) return;

            if (e.key === 'Escape') {
                e.preventDefault();
                closeModal();
                return;
            }

            if (e.key === 'Tab') {
                const focusables = getFocusableElements(cvModal);
                if (focusables.length === 0) return;

                const first = focusables[0];
                const last = focusables[focusables.length - 1];

                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });
    }
}
