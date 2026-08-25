document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // -------------------------------------------------------------------------
    // 1. Pure CSS-Driven Language Controller
    // -------------------------------------------------------------------------
    const langDropdown = document.querySelector('.lang-dropdown');
    const langButtons = document.querySelectorAll('.lang-btn');
    const langLabel = document.querySelector('.lang-current-label');

    function setLanguage(lang) {
        document.documentElement.lang = lang;
        localStorage.setItem('site_lang', lang);
        if (langLabel) langLabel.textContent = lang.toUpperCase();
        langButtons.forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-lang') === lang));
    }

    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            setLanguage(btn.getAttribute('data-lang'));
            if (langDropdown) langDropdown.classList.add('menu-closed');
        });
    });

    if (langDropdown) {
        langDropdown.addEventListener('mouseleave', () => {
            langDropdown.classList.remove('menu-closed');
        });
    }

    // Initialize saved language or default to 'en'
    setLanguage(localStorage.getItem('site_lang') || 'en');

    // -------------------------------------------------------------------------
    // 2. Projects Filtering
    // -------------------------------------------------------------------------
    const filterDropdown = document.querySelector('.filter-dropdown');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.app-card');

    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Update selected category label inside trigger
                const filterSelected = document.querySelector('.filter-selected');
                const btnEnText = button.querySelector('[lang="en"]')?.textContent.replace(' Projects', '') || button.textContent;
                const btnSvText = button.querySelector('[lang="sv"]')?.textContent.replace(' Projekt', '') || button.textContent;

                if (filterSelected) {
                    filterSelected.innerHTML = `
                        <span lang="en">${btnEnText}</span>
                        <span lang="sv">${btnSvText}</span>
                    `;
                }

                // Filter project cards
                const filterValue = button.getAttribute('data-filter') || 'all';
                cards.forEach(card => {
                    const cardCategory = card.getAttribute('data-category');
                    card.style.display = (filterValue === 'all' || cardCategory === filterValue) ? 'flex' : 'none';
                });

                // Auto-close menu immediately
                if (filterDropdown) {
                    filterDropdown.classList.add('menu-closed');
                }
            });
        });

        if (filterDropdown) {
            filterDropdown.addEventListener('mouseleave', () => {
                filterDropdown.classList.remove('menu-closed');
            });
        }
    }

    // -------------------------------------------------------------------------
    // 3. Dynamic Collapsible Bio Toggle
    // -------------------------------------------------------------------------
    const bioToggle = document.querySelector('.bio-toggle');
    const bioExpandable = document.querySelector('.bio-expandable');

    if (bioToggle && bioExpandable) {
        bioToggle.addEventListener('click', () => {
            const isExpanded = bioExpandable.classList.toggle('is-expanded');
            bioToggle.setAttribute('aria-expanded', String(isExpanded));

            // Sync toggle labels in both languages
            const enText = bioToggle.querySelector('[lang="en"]');
            const svText = bioToggle.querySelector('[lang="sv"]');

            if (enText) enText.textContent = isExpanded ? '[Read less]' : '[Read more]';
            if (svText) svText.textContent = isExpanded ? '[Läs mindre]' : '[Läs mer]';
        });
    }

    // -------------------------------------------------------------------------
    // 4. 3D Tilt & Mouse Tracking Spotlight Effect
    // -------------------------------------------------------------------------
    const container = document.querySelector('.profile-card-container');
    const card = document.querySelector('.profile-card-inner');
    const spotlight = document.querySelector('.spotlight');

    if (container && card) {
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = -((y - centerY) / centerY) * 12;
            const rotateY = ((x - centerX) / centerX) * 12;

            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
            card.style.boxShadow = 'rgba(255, 255, 255, 0.08) 0 15px 35px 0';

            if (spotlight) {
                spotlight.style.opacity = '1';
                spotlight.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.18), transparent 55%)`;
            }
        });

        container.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
            card.style.boxShadow = 'rgba(0, 0, 0, 0.29) 0 4px 25px 0';

            if (spotlight) {
                spotlight.style.opacity = '0';
            }
        });
    }

    // -------------------------------------------------------------------------
    // 5. Dark/Light Theme Toggle
    // -------------------------------------------------------------------------
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
        });
    }

    // -------------------------------------------------------------------------
    // 6. Dynamic Font Switching
    // -------------------------------------------------------------------------
    const fontButtons = document.querySelectorAll('.font-btn');
    if (fontButtons.length > 0) {
        fontButtons.forEach(button => {
            button.addEventListener('click', () => {
                fontButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const fontSelection = button.getAttribute('data-font');
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

    // -------------------------------------------------------------------------
    // 7. Tools View Switcher
    // -------------------------------------------------------------------------
    const projectsView = document.getElementById('projects-view');
    const toolView = document.getElementById('tool-view');
    const projectsFilter = document.getElementById('projects-filter');
    const backToProjectsBtn = document.getElementById('back-to-projects');
    const toolButtons = document.querySelectorAll('.tool-select-btn');
    const toolContentItems = document.querySelectorAll('.tool-content-item');
    const viewTitleProjects = document.querySelectorAll('.view-title-projects');
    const viewTitleTools = document.querySelectorAll('.view-title-tools');

    if (toolButtons.length > 0) {
        toolButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const toolKey = btn.getAttribute('data-tool');

                if (projectsView && toolView) {
                    projectsView.style.display = 'none';
                    toolView.style.display = 'block';
                    if (projectsFilter) projectsFilter.style.display = 'none';

                    viewTitleProjects.forEach(el => el.style.display = 'none');
                    viewTitleTools.forEach(el => el.style.display = 'inline');
                    if (backToProjectsBtn) backToProjectsBtn.style.display = 'inline-block';

                    // Display active tool markup
                    toolContentItems.forEach(item => {
                        item.style.display = (item.getAttribute('data-tool-content') === toolKey) ? 'block' : 'none';
                    });
                }
            });
        });
    }

    if (backToProjectsBtn) {
        backToProjectsBtn.addEventListener('click', () => {
            if (projectsView && toolView) {
                projectsView.style.display = 'block';
                toolView.style.display = 'none';
                if (projectsFilter) projectsFilter.style.display = 'inline-block';

                viewTitleProjects.forEach(el => el.style.display = 'inline');
                viewTitleTools.forEach(el => el.style.display = 'none');
                backToProjectsBtn.style.display = 'none';
            }
        });
    }
});