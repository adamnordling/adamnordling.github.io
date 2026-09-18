import { qs, qsa, on } from '../utils/dom';

export type SiteTheme = 'light' | 'dark';
export type FontType = 'default' | 'serif' | 'monospace';

export function initTheme(): void {
    const themeToggle = qs('.theme-toggle');
    const savedTheme = localStorage.getItem('site_theme') as SiteTheme | null;

    if (savedTheme === 'dark') {
        document.body.classList.remove('light-theme');
    } else {
        document.body.classList.add('light-theme');
    }

    on(themeToggle, 'click', () => {
        const isLight = document.body.classList.toggle('light-theme');
        localStorage.setItem('site_theme', isLight ? 'light' : 'dark');
    });

    initFonts();
}

function initFonts(): void {
    const fontButtons = qsa('.font-btn');

    fontButtons.forEach(button => {
        on(button, 'click', () => {
            fontButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');

            const fontSelection = button.getAttribute('data-font') as FontType | null;
            let cssVariableValue = 'var(--font-default)';

            if (fontSelection === 'serif') {
                cssVariableValue = 'var(--font-serif)';
            } else if (fontSelection === 'monospace') {
                cssVariableValue = 'var(--font-mono)';
            }

            document.documentElement.style.setProperty('--font-stack', cssVariableValue);
        });
    });
}

export function toggleTheme(): void {
    const isLight = document.body.classList.toggle('light-theme');
    localStorage.setItem('site_theme', isLight ? 'light' : 'dark');
}
