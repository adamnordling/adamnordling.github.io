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

    // -------------------------------------------------------------------------
    // 8. Timezone-Accurate Live Clock with ISO Week & Year
    // -------------------------------------------------------------------------
    const clockTimeEl = document.getElementById('clock-time');
    const clockWeekNumEl = document.getElementById('clock-week-num');
    const clockYearEl = document.getElementById('clock-year');

    // Calculate standard ISO-8601 week number
    function getISOWeekNumber(date) {
        const target = new Date(date.valueOf());
        const dayNr = (date.getDay() + 6) % 7; // Monday is day 0
        target.setDate(target.getDate() - dayNr + 3);
        const firstThursday = target.valueOf();
        target.setMonth(0, 1);
        if (target.getDay() !== 4) {
            target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
        }
        return 1 + Math.ceil((firstThursday - target) / (7 * 24 * 3600 * 1000));
    }

    function updateClock() {
        const now = new Date();

        // 1. Time (HH:MM:SS) in user's local timezone
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        if (clockTimeEl) {
            clockTimeEl.textContent = `${hours}:${minutes}`;
        }

        // 2. ISO Week Number & Year
        if (clockWeekNumEl) {
            clockWeekNumEl.textContent = String(getISOWeekNumber(now)).padStart(2, '0');
        }
        if (clockYearEl) {
            clockYearEl.textContent = now.getFullYear();
        }
    }

    // Run immediately and update every second
    updateClock();
    setInterval(updateClock, 1000);


// -------------------------------------------------------------------------
    // 9. Live GitHub Activity Fetcher (Guaranteed Real Commit Messages)
    // -------------------------------------------------------------------------
    const activityFeed = document.getElementById('activity-feed');
    const GITHUB_USERNAME = 'adamnordling';
    const CACHE_KEY = `gh_commits_${GITHUB_USERNAME}`;
    const CACHE_TIME_KEY = `gh_commits_time_${GITHUB_USERNAME}`;
    const TTL_MS = 60 * 1000; // 1-minute cache

    function timeAgo(dateString) {
        const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
        const intervals = [
            {labelEn: 'y ago', labelSv: 'år sedan', secs: 31536000},
            {labelEn: 'mo ago', labelSv: 'mån sedan', secs: 2592000},
            {labelEn: 'd ago', labelSv: 'd sedan', secs: 86400},
            {labelEn: 'h ago', labelSv: 'h sedan', secs: 3600},
            {labelEn: 'm ago', labelSv: 'm sedan', secs: 60}
        ];

        for (const i of intervals) {
            const count = Math.floor(seconds / i.secs);
            if (count >= 1) {
                return `
                    <span lang="en">${count}${i.labelEn}</span>
                    <span lang="sv">${count} ${i.labelSv}</span>
                `;
            }
        }
        return `
            <span lang="en">just now</span>
            <span lang="sv">just nu</span>
        `;
    }

    function renderCommits(items) {
        if (!activityFeed) return;

        if (!items || items.length === 0) {
            activityFeed.innerHTML = `
                <div class="activity-skeleton">
                    <span lang="en">No recent public commits found.</span>
                    <span lang="sv">Inga nyliga offentliga commits hittades.</span>
                </div>
            `;
            return;
        }

        activityFeed.innerHTML = items.slice(0, 5).map(item => {
            // Extract the true commit headline (first line of message)
            const rawMsg = item.commit?.message || item.message || 'Code commit';
            const commitMessage = rawMsg.split('\n')[0].trim();

            const repoName = item.repository?.name || item.repo_name || 'repository';
            const commitUrl = item.html_url || `https://github.com/${GITHUB_USERNAME}/${repoName}`;
            const commitDate = item.commit?.author?.date || item.created_at || new Date().toISOString();
            const shortSha = item.sha ? item.sha.substring(0, 7) : '';

            return `
                <div class="activity-item">
                    <div class="activity-icon">⚡</div>
                    <div class="activity-body">
                        <div class="activity-title">
                            <a href="${commitUrl}" target="_blank" rel="noopener noreferrer" title="${commitMessage}">
                                ${commitMessage}
                            </a>
                        </div>
                        <div class="activity-desc">
                            <span>${repoName}</span>
                            ${shortSha ? `<span>· <code>${shortSha}</code></span>` : ''}
                        </div>
                        <div class="activity-time">${timeAgo(commitDate)}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    async function loadGitHubActivity() {
        const cached = sessionStorage.getItem(CACHE_KEY);
        const cachedTime = sessionStorage.getItem(CACHE_TIME_KEY);

        if (cached && cachedTime && (Date.now() - Number(cachedTime) < TTL_MS)) {
            renderCommits(JSON.parse(cached));
            return;
        }

        try {
            // Search API directly queries your latest commits across all public repositories
            const res = await fetch(`https://api.github.com/search/commits?q=author:${GITHUB_USERNAME}&sort=author-date&order=desc&per_page=5&_t=${Date.now()}`, {
                headers: {
                    'Accept': 'application/vnd.github.cloak-preview+json'
                },
                cache: 'no-cache'
            });

            if (!res.ok) throw new Error('Search API request failed');
            const data = await res.json();
            const commits = data.items || [];

            sessionStorage.setItem(CACHE_KEY, JSON.stringify(commits));
            sessionStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
            renderCommits(commits);
        } catch (err) {
            // Fallback: If search endpoint is busy, fetch standard events
            try {
                const eventsRes = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public?_t=${Date.now()}`);
                const eventsData = await eventsRes.json();

                const pushEvents = eventsData
                    .filter(e => e.type === 'PushEvent' && e.payload?.commits?.length > 0)
                    .flatMap(e => e.payload.commits.map(c => ({
                        commit: {message: c.message, author: {date: e.created_at}},
                        repository: {name: e.repo.name.replace(`${GITHUB_USERNAME}/`, '')},
                        html_url: `https://github.com/${e.repo.name}/commit/${c.sha}`,
                        sha: c.sha
                    })))
                    .slice(0, 5);

                renderCommits(pushEvents);
            } catch (fallbackErr) {
                if (cached) {
                    renderCommits(JSON.parse(cached));
                }
            }
        }
    }

    loadGitHubActivity();


    // -------------------------------------------------------------------------
    // 10. Email One-Click Copy with Toast Feedback
    // -------------------------------------------------------------------------
    const emailCopyBtn = document.getElementById('email-copy-btn');
    const emailToast = document.getElementById('email-toast');
    let toastTimeout = null;

    if (emailCopyBtn && emailToast) {
        emailCopyBtn.addEventListener('click', async () => {
            const email = emailCopyBtn.getAttribute('data-email');
            if (!email) return;

            try {
                await navigator.clipboard.writeText(email);

                // Show toast
                emailToast.classList.add('is-visible');

                // Reset timeout if clicked multiple times
                if (toastTimeout) clearTimeout(toastTimeout);
                toastTimeout = setTimeout(() => {
                    emailToast.classList.remove('is-visible');
                }, 2200);
            } catch (err) {
                // Fallback if clipboard permission is blocked
                window.location.href = `mailto:${email}`;
            }
        });
    }


    // -------------------------------------------------------------------------
    // 11. Resume / CV Preview Modal Controller
    // -------------------------------------------------------------------------
    const openCvBtn = document.getElementById('open-cv-modal');
    const closeCvBtn = document.getElementById('close-cv-modal');
    const cvModal = document.getElementById('cv-modal');

    function openModal() {
        if (!cvModal) return;
        cvModal.classList.add('is-open');
        cvModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Lock background scrolling
    }

    function closeModal() {
        if (!cvModal) return;
        cvModal.classList.remove('is-open');
        cvModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = ''; // Restore scrolling
    }

    if (openCvBtn) openCvBtn.addEventListener('click', openModal);
    if (closeCvBtn) closeCvBtn.addEventListener('click', closeModal);

    // Close on backdrop click
    if (cvModal) {
        cvModal.addEventListener('click', (e) => {
            if (e.target === cvModal) closeModal();
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && cvModal?.classList.contains('is-open')) {
            closeModal();
        }
    });

    // -------------------------------------------------------------------------
    // 12. Interactive Dot Matrix Canvas (Customizable)
    // -------------------------------------------------------------------------
    const canvas = document.getElementById('bg-canvas');
    const portfolioWrapper = document.querySelector('.portfolio-wrapper');

    if (canvas && portfolioWrapper) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let mouseX = -1000, mouseY = -1000;

        // ==========================================
        // ⚙️ CONTROLS & SETTINGS (Tweak these freely)
        // ==========================================
        const FULL_SCREEN = false;    // Set to 'true' for whole site, 'false' for sides only
        const BASE_ALPHA = 0.05;     // Normal dot brightness (0.1 = faint, 0.35 = very bright)
        const GLOW_ALPHA = 0.85;     // Hover dot brightness when mouse is near
        const DOT_SPACING = 28;      // Distance between dots in pixels
        const FADE_MARGIN = 60;     // Fade width in pixels when FULL_SCREEN is false
        // ==========================================

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }

        window.addEventListener('resize', resize);
        resize();

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        window.addEventListener('mouseleave', () => {
            mouseX = -1000;
            mouseY = -1000;
        });

        function draw() {
            ctx.clearRect(0, 0, width, height);

            const isLight = document.body.classList.contains('light-theme');
            const baseColor = isLight ? [0, 0, 0] : [255, 255, 255];
            const activeColor = [59, 130, 246]; // Accent Blue

            const rect = portfolioWrapper.getBoundingClientRect();
            const leftBoundary = rect.left;
            const rightBoundary = rect.right;

            for (let x = DOT_SPACING / 2; x < width; x += DOT_SPACING) {
                let flankFade = 1.0;

                // If NOT full screen, calculate the smooth fade into the middle
                if (!FULL_SCREEN) {
                    if (x < leftBoundary) {
                        const distToEdge = leftBoundary - x;
                        flankFade = Math.min(1, Math.max(0, distToEdge / FADE_MARGIN));
                    } else if (x > rightBoundary) {
                        const distToEdge = x - rightBoundary;
                        flankFade = Math.min(1, Math.max(0, distToEdge / FADE_MARGIN));
                    } else {
                        flankFade = 0; // Invisible behind the container
                    }
                    if (flankFade <= 0) continue;
                }

                for (let y = DOT_SPACING / 2; y < height; y += DOT_SPACING) {
                    const dx = mouseX - x;
                    const dy = mouseY - y;
                    const distToMouse = Math.sqrt(dx * dx + dy * dy);
                    const mouseRadius = 140;

                    let radius = 1.4;
                    let alpha = BASE_ALPHA * flankFade;
                    let color = baseColor;

                    // Mouse proximity glow & expansion
                    if (distToMouse < mouseRadius) {
                        const influence = (1 - distToMouse / mouseRadius);
                        radius = 1.4 + influence * 2.4;
                        alpha = (BASE_ALPHA + influence * (GLOW_ALPHA - BASE_ALPHA)) * flankFade;
                        color = activeColor;
                    }

                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
                    ctx.fill();
                }
            }

            requestAnimationFrame(draw);
        }

        requestAnimationFrame(draw);
    }
});