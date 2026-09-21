import { qs, qsa, on } from '../utils/dom';

export type Language = 'en' | 'sv';

export function initI18n(): void {
    const langDropdown = qs('.lang-dropdown');
    const langButtons = qsa('.lang-btn');

    langButtons.forEach(btn => {
        on(btn, 'click', () => {
            const lang = btn.getAttribute('data-lang') as Language | null;
            if (lang) {
                setLanguage(lang);
                langDropdown?.classList.add('menu-closed');
            }
        });
    });

    if (langDropdown) {
        on(langDropdown, 'mouseleave', () => {
            langDropdown.classList.remove('menu-closed');
        });
    }

    setLanguage(getInitialLanguage());
    initMobileDropdowns();
}

export function setLanguage(lang: Language): void {
    document.documentElement.lang = lang;
    localStorage.setItem('site_lang', lang);

    const langLabel = qs('.lang-current-label');
    if (langLabel) langLabel.textContent = lang.toUpperCase();

    const langButtons = qsa('.lang-btn');
    langButtons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    window.dispatchEvent(new CustomEvent('site:languagechange', { detail: { lang } }));
}

function getInitialLanguage(): Language {
    const saved = localStorage.getItem('site_lang') as Language | null;
    if (saved === 'en' || saved === 'sv') return saved;

    const browserLangs = navigator.languages.length > 0 ? navigator.languages : [navigator.language];
    const isSwedish = browserLangs.some(l => l.toLowerCase().startsWith('sv'));
    return isSwedish ? 'sv' : 'en';
}

function initMobileDropdowns(): void {
    const allDropdownTriggers = qsa('.filter-trigger, .lang-trigger');

    allDropdownTriggers.forEach(trigger => {
        on(trigger, 'click', e => {
            if (window.innerWidth <= 1024) {
                e.stopPropagation();
                const parent = trigger.closest('.filter-dropdown, .lang-dropdown');
                parent?.classList.toggle('menu-open');
            }
        });
    });

    on(document, 'click', () => {
        qsa('.menu-open').forEach(el => {
            el.classList.remove('menu-open');
        });
    });
}
