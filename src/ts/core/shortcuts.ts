import { qs, qsa, on } from '../utils/dom';
import { toggleTheme } from './theme';
import { setLanguage } from './i18n';
import { openModal, closeModal, isModalOpen } from '../features/modal';

const fontTypes = ['default', 'serif', 'monospace'] as const;
let currentFontIndex = 0;
let lastFocusedElement: HTMLElement | null = null;

// Track last focused interactive element for tab memory
document.addEventListener('focusin', e => {
    const target = e.target as HTMLElement | null;
    if (target && target !== document.body && !target.classList.contains('skip-link')) {
        lastFocusedElement = target;
    }
});

// Helper: Safely find the first currently VISIBLE project card
function getFirstVisibleProjectCard(): HTMLElement | null {
    const cards = qsa('.app-card');
    const visible = cards.find(card => card.style.display !== 'none' && card.offsetWidth > 0);
    if (visible) return visible;
    if (cards.length > 0) return cards[0];
    return null;
}

// Helper: Focusable elements in the main portfolio wrapper
function getMainContentElements(): HTMLElement[] {
    const wrapper = qs('.portfolio-wrapper');
    if (!wrapper) return [];
    return Array.from(
        wrapper.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter(el => {
        // Exclude closed profile menu items
        if (
            el.closest('.profile-img-menu') &&
            !el.closest('.profile-card-inner')?.classList.contains('profile-menu-open')
        ) {
            return false;
        }
        // Exclude hidden cards
        const card = el.closest<HTMLElement>('.app-card');
        if (card && card.style.display === 'none') {
            return false;
        }
        return (
            el.offsetWidth > 0 &&
            el.offsetHeight > 0 &&
            window.getComputedStyle(el).visibility !== 'hidden' &&
            !el.closest('[aria-hidden="true"]')
        );
    });
}

// Helper: Focusable elements in the footer dock
function getFooterDockElements(): HTMLElement[] {
    const dock = qs('.status-dock');
    if (!dock) return [];
    return Array.from(
        dock.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter(el => {
        return (
            el.offsetWidth > 0 &&
            el.offsetHeight > 0 &&
            !el.classList.contains('theme-toggle') &&
            !el.classList.contains('lang-trigger') &&
            !el.closest('.lang-menu') &&
            window.getComputedStyle(el).visibility !== 'hidden'
        );
    });
}

export function initShortcuts(): void {
    const leftPanel = qs('.left-panel');
    const rightPanel = qs('.right-panel');
    let activeScrollTarget: HTMLElement | null = leftPanel;

    // 1. Mouse Tracking
    if (leftPanel) {
        on(leftPanel, 'mouseenter', () => {
            activeScrollTarget = leftPanel;
        });
    }
    if (rightPanel) {
        on(rightPanel, 'mouseenter', () => {
            activeScrollTarget = rightPanel;
        });
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

    // 2. Keyboard Tracking
    document.addEventListener('focusin', e => {
        const target = e.target as HTMLElement | null;
        if (target && target !== document.body && !target.classList.contains('skip-link')) {
            lastFocusedElement = target;

            if (rightPanel && target.closest('.right-panel')) {
                activeScrollTarget = rightPanel;
            } else if (leftPanel && target.closest('.left-panel')) {
                activeScrollTarget = leftPanel;
            }
        }
    });

    on(document, 'keydown', (e: KeyboardEvent) => {
        const activeEl = document.activeElement as HTMLElement | null;
        const activeTag = (activeEl?.tagName || '').toUpperCase();

        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        const key = e.key.toLowerCase();

        // 1. Modal handling
        if (isModalOpen()) {
            if (e.key === 'Escape' || key === 'c') {
                e.preventDefault();
                closeModal();
            }
            return;
        }

        // 2. Escape: closes open menus and untargets focus
        if (e.key === 'Escape') {
            const cardTrigger = qs('#profile-card-trigger');
            const shouldRefocusCard = cardTrigger !== null && cardTrigger.classList.contains('profile-menu-open');

            document.querySelectorAll('.menu-open, .has-bubble-open, .profile-menu-open').forEach(el => {
                el.classList.remove('menu-open', 'has-bubble-open', 'profile-menu-open');
            });

            if (shouldRefocusCard) {
                cardTrigger.focus();
            } else if (activeEl) {
                activeEl.blur();
            }
            return;
        }

        // 3. Tab Memory Restoration
        if (e.key === 'Tab' && (!activeEl || activeEl === document.body)) {
            const cardTrigger = qs('#profile-card-trigger');
            if (
                cardTrigger &&
                lastFocusedElement &&
                lastFocusedElement.closest('.profile-img-menu') &&
                !cardTrigger.classList.contains('profile-menu-open')
            ) {
                lastFocusedElement = cardTrigger;
            }

            if (lastFocusedElement && document.contains(lastFocusedElement)) {
                e.preventDefault();
                lastFocusedElement.focus();
                return;
            }
        }

        // 4. Enter on Language Button: Toggles language directly
        if ((e.key === 'Enter' || e.key === ' ') && activeEl && activeEl.classList.contains('lang-trigger')) {
            e.preventDefault();
            const currentLang = document.documentElement.lang;
            setLanguage(currentLang === 'sv' ? 'en' : 'sv');
            return;
        }

        // 5. CATEGORY SELECTION WITH ENTER: Selects category & moves directly to visible project card
        if ((e.key === 'Enter' || e.key === ' ') && activeEl && activeEl.classList.contains('filter-btn')) {
            e.preventDefault();
            activeEl.click();
            requestAnimationFrame(() => {
                const firstProject = getFirstVisibleProjectCard();
                if (firstProject) firstProject.focus();
            });
            return;
        }

        // 6. CATEGORY NAVIGATION (Tab / Shift+Tab and ArrowDown / ArrowUp)
        if (
            activeEl &&
            activeEl.classList.contains('filter-btn') &&
            (e.key === 'Tab' || e.key === 'ArrowDown' || e.key === 'ArrowUp')
        ) {
            const isForward = e.key === 'Tab' ? !e.shiftKey : e.key === 'ArrowDown';
            const filterBtns = qsa('.filter-btn');
            const currentIndex = filterBtns.indexOf(activeEl);

            if (currentIndex !== -1) {
                if (isForward) {
                    if (currentIndex < filterBtns.length - 1) {
                        e.preventDefault();
                        filterBtns[currentIndex + 1].focus();
                        return;
                    } else {
                        // Pass through forward past Security: default to "All", then focus first visible project card
                        e.preventDefault();
                        if (!filterBtns[0].classList.contains('active')) {
                            filterBtns[0].click();
                        }
                        requestAnimationFrame(() => {
                            const firstProject = getFirstVisibleProjectCard();
                            if (firstProject) firstProject.focus();
                        });
                        return;
                    }
                } else {
                    if (currentIndex > 0) {
                        e.preventDefault();
                        filterBtns[currentIndex - 1].focus();
                        return;
                    } else {
                        // Pass through backward past All: default to "All", then return to Left Panel
                        e.preventDefault();
                        if (!filterBtns[0].classList.contains('active')) {
                            filterBtns[0].click();
                        }
                        const lastActivityItem = qs('.activity-feed a:last-child');
                        if (lastActivityItem) {
                            lastActivityItem.focus();
                        } else if (leftPanel) {
                            leftPanel.focus();
                        }
                        return;
                    }
                }
            }
        }

        // 7. Backward navigation from first VISIBLE project card into Category (Security)
        if (
            activeEl &&
            (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) &&
            activeEl.classList.contains('app-card') &&
            activeEl === getFirstVisibleProjectCard()
        ) {
            const filterBtns = qsa('.filter-btn');
            if (filterBtns.length > 0) {
                e.preventDefault();
                const dropdown = qs('.filter-dropdown');
                if (dropdown) dropdown.classList.remove('menu-closed');
                filterBtns[filterBtns.length - 1].focus();
                return;
            }
        }

        // 8. Global Desktop Navigation Sequence
        if (window.innerWidth > 1150 && (e.key === 'Tab' || e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            const isForward = e.key === 'Tab' ? !e.shiftKey : e.key === 'ArrowDown';
            const skipLink = qs('.skip-link');
            const themeToggle = qs('.theme-toggle');
            const langTrigger = qs('.lang-trigger');
            const profileCard = qs('#profile-card-trigger');
            const firstContactBtn = qs('.contact-btn-1');

            const mainElements = getMainContentElements();
            const footerElements = getFooterDockElements();
            const mainCount = mainElements.length;
            const footerCount = footerElements.length;

            // Profile photo menu item navigation
            if (activeEl && activeEl.closest('.profile-img-menu')) {
                if (isForward && activeEl.id === 'copy-img-link-btn') {
                    e.preventDefault();
                    if (profileCard) profileCard.classList.remove('profile-menu-open');
                    if (firstContactBtn) firstContactBtn.focus();
                    return;
                }
                if (
                    !isForward &&
                    activeEl.classList.contains('profile-menu-item') &&
                    activeEl === qs('.profile-menu-item')
                ) {
                    e.preventDefault();
                    if (profileCard) profileCard.focus();
                    return;
                }
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const menuContainer = activeEl.closest<HTMLElement>('.profile-img-menu');
                    if (menuContainer) {
                        const menuItems = qsa('.profile-menu-item', menuContainer);
                        const currentIndex = menuItems.indexOf(activeEl);
                        if (currentIndex !== -1 && menuItems.length > 0) {
                            const nextIndex = isForward
                                ? (currentIndex + 1) % menuItems.length
                                : (currentIndex - 1 + menuItems.length) % menuItems.length;
                            menuItems[nextIndex].focus();
                        }
                    }
                    return;
                }
            }

            // Scroll panel if whole panel is targeted
            if (rightPanel && activeEl === rightPanel && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                e.preventDefault();
                rightPanel.scrollBy({ top: isForward ? 140 : -140, behavior: 'smooth' });
                return;
            }
            if (leftPanel && activeEl === leftPanel && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                e.preventDefault();
                leftPanel.scrollBy({ top: isForward ? 140 : -140, behavior: 'smooth' });
                return;
            }

            // Scroll active panel if no element is focused
            if ((!activeEl || activeEl === document.body) && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                e.preventDefault();
                if (activeScrollTarget) {
                    activeScrollTarget.scrollBy({ top: isForward ? 140 : -140, behavior: 'smooth' });
                }
                return;
            }

            // Forward navigation from rightPanel directly into Category All
            if (isForward && rightPanel && activeEl === rightPanel) {
                const filterBtns = qsa('.filter-btn');
                if (filterBtns.length > 0) {
                    e.preventDefault();
                    const dropdown = qs('.filter-dropdown');
                    if (dropdown) dropdown.classList.remove('menu-closed');
                    filterBtns[0].focus();
                    return;
                }
            }

            // FORWARD SEQUENCING (Tab or ArrowDown)
            if (isForward) {
                if (activeEl === skipLink && themeToggle) {
                    e.preventDefault();
                    themeToggle.focus();
                    return;
                }
                if (activeEl === themeToggle && langTrigger) {
                    e.preventDefault();
                    langTrigger.focus();
                    return;
                }
                if (activeEl === langTrigger) {
                    e.preventDefault();
                    if (mainCount > 0) {
                        mainElements[0].focus();
                    } else if (profileCard) {
                        profileCard.focus();
                    }
                    return;
                }
                if (mainCount > 0 && activeEl === mainElements[mainCount - 1] && footerCount > 0) {
                    e.preventDefault();
                    footerElements[0].focus();
                    return;
                }
                if (footerCount > 0 && activeEl === footerElements[footerCount - 1]) {
                    e.preventDefault();
                    if (skipLink) {
                        skipLink.focus();
                    } else if (themeToggle) {
                        themeToggle.focus();
                    }
                    return;
                }
            }

            // BACKWARD SEQUENCING (Shift+Tab or ArrowUp)
            if (!isForward) {
                if ((activeEl === skipLink || activeEl === themeToggle) && footerCount > 0) {
                    e.preventDefault();
                    footerElements[footerCount - 1].focus();
                    return;
                }
                if (activeEl === langTrigger && themeToggle) {
                    e.preventDefault();
                    themeToggle.focus();
                    return;
                }
                if (((mainCount > 0 && activeEl === mainElements[0]) || activeEl === profileCard) && langTrigger) {
                    e.preventDefault();
                    langTrigger.focus();
                    return;
                }
                if (footerCount > 0 && activeEl === footerElements[0] && mainCount > 0) {
                    e.preventDefault();
                    mainElements[mainCount - 1].focus();
                    return;
                }
            }

            // General Arrow navigation through focusable list
            if (activeEl && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                const combined: HTMLElement[] = [];
                if (skipLink) combined.push(skipLink);
                if (themeToggle) combined.push(themeToggle);
                if (langTrigger) combined.push(langTrigger);
                combined.push(...mainElements);
                combined.push(...footerElements);

                const currentIndex = combined.indexOf(activeEl);
                if (currentIndex !== -1 && combined.length > 0) {
                    e.preventDefault();
                    const nextIndex = isForward
                        ? (currentIndex + 1) % combined.length
                        : (currentIndex - 1 + combined.length) % combined.length;
                    combined[nextIndex].focus();
                    return;
                }
            }
        }

        // Hotkeys (t, l, c, f, 1-3)
        if (key === 't') toggleTheme();
        if (key === 'l') {
            const currentLang = document.documentElement.lang;
            setLanguage(currentLang === 'sv' ? 'en' : 'sv');
        }
        if (key === 'c') {
            e.preventDefault();
            openModal();
        }
        if (key === 'f') {
            currentFontIndex = (currentFontIndex + 1) % fontTypes.length;
            const fontName = fontTypes[currentFontIndex];
            const fontBtn = qs(`.font-btn[data-font="${fontName}"]`);
            if (fontBtn) fontBtn.click();
        }
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
    });
}
