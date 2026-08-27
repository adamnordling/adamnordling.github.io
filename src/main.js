document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // -------------------------------------------------------------------------
    // Mobile Touch-Dropdown Support
    // -------------------------------------------------------------------------
    const allDropdownTriggers = document.querySelectorAll('.filter-trigger, .tools-trigger, .lang-trigger');

    allDropdownTriggers.forEach(trigger => {
        trigger.addEventListener('click', e => {
            if (window.innerWidth <= 1024) {
                e.stopPropagation();
                const parentDropdown = trigger.closest('.filter-dropdown, .tools-dropdown, .lang-dropdown');
                parentDropdown?.classList.toggle('menu-open');
            }
        });
    });

    // Close open menus when tapping anywhere else on mobile
    document.addEventListener('click', () => {
        document.querySelectorAll('.menu-open').forEach(el => el.classList.remove('menu-open'));
    });
    // -------------------------------------------------------------------------
    // 1. Pure CSS-Driven Language Controller
    // -------------------------------------------------------------------------
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

    function getInitialLanguage() {
        const saved = localStorage.getItem('site_lang');
        if (saved) return saved;

        // Check navigator browser languages
        const browserLangs = navigator.languages || [navigator.language || ''];
        const isSwedish = browserLangs.some(l => l.toLowerCase().startsWith('sv'));
        return isSwedish ? 'sv' : 'en';
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

    // Auto-detect browser language or load saved preference
    setLanguage(getInitialLanguage());
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
                const btnEnText =
                    button.querySelector('[lang="en"]')?.textContent.replace(' Projects', '') || button.textContent;
                const btnSvText =
                    button.querySelector('[lang="sv"]')?.textContent.replace(' Projekt', '') || button.textContent;

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
                    card.style.display = filterValue === 'all' || cardCategory === filterValue ? 'flex' : 'none';
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
        container.addEventListener('mousemove', e => {
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
    const savedTheme = localStorage.getItem('site_theme');

    // Default is Light; only remove if explicitly saved as 'dark'
    if (savedTheme === 'dark') {
        document.body.classList.remove('light-theme');
    } else {
        document.body.classList.add('light-theme');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isLight = document.body.classList.toggle('light-theme');
            localStorage.setItem('site_theme', isLight ? 'light' : 'dark');
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

                    viewTitleProjects.forEach(el => (el.style.display = 'none'));
                    viewTitleTools.forEach(el => (el.style.display = 'inline'));
                    if (backToProjectsBtn) backToProjectsBtn.style.display = 'inline-block';

                    // Display active tool markup
                    toolContentItems.forEach(item => {
                        item.style.display = item.getAttribute('data-tool-content') === toolKey ? 'block' : 'none';
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

                viewTitleProjects.forEach(el => (el.style.display = 'inline'));
                viewTitleTools.forEach(el => (el.style.display = 'none'));
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
            { labelEn: 'y ago', labelSv: 'år sedan', secs: 31536000 },
            { labelEn: 'mo ago', labelSv: 'mån sedan', secs: 2592000 },
            { labelEn: 'd ago', labelSv: 'd sedan', secs: 86400 },
            { labelEn: 'h ago', labelSv: 'h sedan', secs: 3600 },
            { labelEn: 'm ago', labelSv: 'm sedan', secs: 60 }
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

        activityFeed.innerHTML = items
            .slice(0, 5)
            .map(item => {
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
            })
            .join('');
    }

    async function loadGitHubActivity() {
        const cached = sessionStorage.getItem(CACHE_KEY);
        const cachedTime = sessionStorage.getItem(CACHE_TIME_KEY);

        if (cached && cachedTime && Date.now() - Number(cachedTime) < TTL_MS) {
            try {
                renderCommits(JSON.parse(cached));
                return;
            } catch {
                // Ignore invalid cached data and fetch fresh data.
            }
        }

        try {
            // Search API directly queries your latest commits across all public repositories
            const res = await fetch(
                `https://api.github.com/search/commits?q=author:${GITHUB_USERNAME}&sort=author-date&order=desc&per_page=5&_t=${Date.now()}`,
                {
                    headers: {
                        Accept: 'application/vnd.github.cloak-preview+json'
                    },
                    cache: 'no-cache'
                }
            );

            if (!res.ok) throw new Error('Search API request failed');

            const data = await res.json();
            const commits = data.items || [];

            sessionStorage.setItem(CACHE_KEY, JSON.stringify(commits));
            sessionStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
            renderCommits(commits);
        } catch {
            // Fallback: If search endpoint is busy, fetch standard events
            try {
                const eventsRes = await fetch(
                    `https://api.github.com/users/${GITHUB_USERNAME}/events/public?_t=${Date.now()}`
                );

                if (!eventsRes.ok) {
                    throw new Error('Events API request failed');
                }

                const eventsData = await eventsRes.json();

                const pushEvents = eventsData
                    .filter(e => e.type === 'PushEvent' && e.payload?.commits?.length > 0)
                    .flatMap(e =>
                        e.payload.commits.map(c => ({
                            commit: {
                                message: c.message,
                                author: { date: e.created_at }
                            },
                            repository: {
                                name: e.repo.name.replace(`${GITHUB_USERNAME}/`, '')
                            },
                            html_url: `https://github.com/${e.repo.name}/commit/${c.sha}`,
                            sha: c.sha
                        }))
                    )
                    .slice(0, 5);

                renderCommits(pushEvents);
            } catch {
                if (cached) {
                    try {
                        renderCommits(JSON.parse(cached));
                    } catch {
                        // Ignore invalid cached data.
                    }
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
        emailCopyBtn.addEventListener('click', async e => {
            e.preventDefault();
            const email = emailCopyBtn.getAttribute('data-email');
            if (!email) return;

            let copied = false;

            // 1. Try Modern Clipboard API (Works on HTTPS and localhost)
            if (navigator.clipboard && window.isSecureContext) {
                try {
                    await navigator.clipboard.writeText(email);
                    copied = true;
                } catch {
                    copied = false;
                }
            }

            // 2. Invisible Fallback (Works on plain HTTP without opening any app)
            if (!copied) {
                try {
                    const tempTextArea = document.createElement('textarea');
                    tempTextArea.value = email;
                    tempTextArea.style.position = 'fixed';
                    tempTextArea.style.left = '-9999px';
                    tempTextArea.style.top = '0';
                    tempTextArea.setAttribute('readonly', '');
                    document.body.appendChild(tempTextArea);
                    tempTextArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(tempTextArea);
                } catch {
                    // Ignore if blocked
                }
            }

            // Show Toast Notification
            emailToast.classList.add('is-visible');

            if (toastTimeout) clearTimeout(toastTimeout);
            toastTimeout = setTimeout(() => {
                emailToast.classList.remove('is-visible');
            }, 2200);
        });
    }

    // -------------------------------------------------------------------------
    // 11. Resume / CV Preview Modal Controller
    // -------------------------------------------------------------------------
    const openCvBtn = document.getElementById('open-cv-modal');
    const closeCvBtn = document.getElementById('close-cv-modal');
    const cvModal = document.getElementById('cv-modal');
    const cvIframe = cvModal ? cvModal.querySelector('iframe') : null;

    function openModal() {
        if (!cvModal) return;

        // Only load the PDF when the user opens the modal
        if (cvIframe && !cvIframe.getAttribute('src')) {
            cvIframe.setAttribute('src', cvIframe.getAttribute('data-src'));
        }

        cvModal.classList.add('is-open');
        cvModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
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
        cvModal.addEventListener('click', e => {
            if (e.target === cvModal) closeModal();
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && cvModal?.classList.contains('is-open')) {
            closeModal();
        }
    });

    // -------------------------------------------------------------------------
    // 12. Interactive Dot Matrix Canvas (Desktop Mouse + Mobile Touch Drag)
    // -------------------------------------------------------------------------
    const canvas = document.getElementById('bg-canvas');
    const portfolioWrapper = document.querySelector('.portfolio-wrapper');

    if (canvas && portfolioWrapper) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let mouseX = -1000,
            mouseY = -1000;

        // Settings
        const DARK_BASE_ALPHA = 0.12;
        const DARK_GLOW_ALPHA = 0.9;
        const LIGHT_BASE_ALPHA = 0.12;
        const LIGHT_GLOW_ALPHA = 0.55;
        const DOT_SPACING = 28;
        const FADE_MARGIN = 100;

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }

        window.addEventListener('resize', resize);
        resize();

        // Mouse tracking (Desktop)
        window.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        window.addEventListener('mouseleave', () => {
            mouseX = -1000;
            mouseY = -1000;
        });

        // Touch & Drag Tracking (Mobile & Tablets)
        window.addEventListener(
            'touchstart',
            e => {
                if (e.touches.length > 0) {
                    mouseX = e.touches[0].clientX;
                    mouseY = e.touches[0].clientY;
                }
            },
            { passive: true }
        );

        window.addEventListener(
            'touchmove',
            e => {
                if (e.touches.length > 0) {
                    mouseX = e.touches[0].clientX;
                    mouseY = e.touches[0].clientY;
                }
            },
            { passive: true }
        );

        window.addEventListener(
            'touchend',
            () => {
                // Fade out when finger lifts
                setTimeout(() => {
                    mouseX = -1000;
                    mouseY = -1000;
                }, 300);
            },
            { passive: true }
        );

        function draw() {
            ctx.clearRect(0, 0, width, height);

            const isLight = document.body.classList.contains('light-theme');
            const isMobile = width <= 1024;
            const baseColor = isLight ? [0, 0, 0] : [255, 255, 255];
            const activeColor = [59, 130, 246]; // Accent Blue

            const currentBaseAlpha = isLight ? LIGHT_BASE_ALPHA : DARK_BASE_ALPHA;
            const currentGlowAlpha = isLight ? LIGHT_GLOW_ALPHA : DARK_GLOW_ALPHA;

            const rect = portfolioWrapper.getBoundingClientRect();
            const leftBoundary = rect.left;
            const rightBoundary = rect.right;

            for (let x = DOT_SPACING / 2; x < width; x += DOT_SPACING) {
                let flankFade = 1.0;

                // On desktop: fade behind middle container. On mobile: subtle full screen mesh
                if (!isMobile) {
                    if (x < leftBoundary) {
                        const distToEdge = leftBoundary - x;
                        flankFade = Math.min(1, Math.max(0, distToEdge / FADE_MARGIN));
                    } else if (x > rightBoundary) {
                        const distToEdge = x - rightBoundary;
                        flankFade = Math.min(1, Math.max(0, distToEdge / FADE_MARGIN));
                    } else {
                        flankFade = 0;
                    }
                    if (flankFade <= 0) continue;
                } else {
                    flankFade = 0.65; // Subtle full-screen mobile mesh
                }

                for (let y = DOT_SPACING / 2; y < height; y += DOT_SPACING) {
                    const dx = mouseX - x;
                    const dy = mouseY - y;
                    const distToMouse = Math.sqrt(dx * dx + dy * dy);
                    const touchRadius = isMobile ? 100 : 140;

                    let radius = 1.3;
                    let alpha = currentBaseAlpha * 0.7 * flankFade;
                    let color = baseColor;

                    if (distToMouse < touchRadius) {
                        const influence = 1 - distToMouse / touchRadius;
                        radius = 1.3 + influence * 2.2;
                        alpha = (currentBaseAlpha + influence * (currentGlowAlpha - currentBaseAlpha)) * flankFade;
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

    // -------------------------------------------------------------------------
    // 13. Dynamic Category Filter Counts
    // -------------------------------------------------------------------------
    function updateCategoryCounts() {
        const allCards = document.querySelectorAll('.app-card');
        const filterBtns = document.querySelectorAll('.filter-btn');

        filterBtns.forEach(btn => {
            const category = btn.getAttribute('data-filter');
            const countSpan = btn.querySelector('.filter-count');
            if (!countSpan) return;

            let count = 0;
            if (category === 'all') {
                count = allCards.length;
            } else {
                count = document.querySelectorAll(`.app-card[data-category="${category}"]`).length;
            }

            countSpan.textContent = `(${count})`;
        });
    }

    updateCategoryCounts();

    // -------------------------------------------------------------------------
    // 14. Skill-to-Project Context Drawer (Hover on Desktop + Tap-Toggle on Mobile)
    // -------------------------------------------------------------------------
    const skillItems = document.querySelectorAll('.skill-item[data-skill-id]');
    const allProjectCards = document.querySelectorAll('.app-card');
    let activeSkillId = null;

    function highlightSkill(skillId) {
        let hasMatchingCard = false;

        allProjectCards.forEach(card => {
            const cardSkills = (card.getAttribute('data-skills') || '').split(' ');
            const isMatch = cardSkills.includes(skillId);
            const drawer = card.querySelector('.app-tech-drawer');

            if (isMatch) {
                hasMatchingCard = true;
                card.classList.add('skill-highlighted');
                card.classList.remove('skill-dimmed');
                if (drawer) drawer.classList.add('is-active');
            } else {
                card.classList.add('skill-dimmed');
                card.classList.remove('skill-highlighted');
                if (drawer) drawer.classList.remove('is-active');
            }
        });

        if (!hasMatchingCard) {
            clearHighlights();
        }
    }

    function clearHighlights() {
        activeSkillId = null;
        allProjectCards.forEach(card => {
            card.classList.remove('skill-highlighted', 'skill-dimmed');
            const drawer = card.querySelector('.app-tech-drawer');
            if (drawer) drawer.classList.remove('is-active');
        });
        skillItems.forEach(item => item.classList.remove('skill-selected'));
    }

    skillItems.forEach(item => {
        const skillId = item.getAttribute('data-skill-id');

        // 1. Mouse Hover (Desktop)
        item.addEventListener('mouseenter', () => {
            if (!activeSkillId) highlightSkill(skillId);
        });

        item.addEventListener('mouseleave', () => {
            if (!activeSkillId) clearHighlights();
        });

        // 2. Tap / Click (Mobile Toggle & Desktop Pin)
        item.addEventListener('click', e => {
            e.stopPropagation();

            if (activeSkillId === skillId) {
                // Tapping active skill toggles it OFF
                clearHighlights();
            } else {
                // Tapping new skill activates it
                clearHighlights();
                activeSkillId = skillId;
                item.classList.add('skill-selected');
                highlightSkill(skillId);
            }
        });
    });

    // 3. Tap anywhere else on the page to unclick / reset
    document.addEventListener('click', e => {
        if (!e.target.closest('.skill-item')) {
            clearHighlights();
        }
    });

    // -------------------------------------------------------------------------
    // 15. Configurable Live API Status Ping
    // -------------------------------------------------------------------------
    const statusBadges = document.querySelectorAll('.app-status-badge');

    statusBadges.forEach(async badge => {
        const isLiveEnabled = badge.getAttribute('data-live-enabled') === 'true';
        const endpoint = badge.getAttribute('data-endpoint');
        const devLabel = badge.querySelector('.status-label-dev');
        const liveLabel = badge.querySelector('.status-label-live');
        const pingSpan = badge.querySelector('.status-ping');

        if (!isLiveEnabled) {
            // Keep in Development mode
            badge.classList.remove('is-live');
            if (devLabel) devLabel.style.display = 'inline';
            if (liveLabel) liveLabel.style.display = 'none';
            return;
        }

        // Live Mode: Perform ping check
        badge.classList.add('is-live');
        if (devLabel) devLabel.style.display = 'none';
        if (liveLabel) liveLabel.style.display = 'inline';

        if (endpoint) {
            const startTime = performance.now();

            try {
                await fetch(endpoint, {
                    method: 'HEAD',
                    mode: 'no-cors',
                    cache: 'no-cache'
                });

                const pingTime = Math.round(performance.now() - startTime);

                if (pingSpan) {
                    pingSpan.textContent = `· ${pingTime}ms`;
                }
            } catch {
                if (pingSpan) {
                    pingSpan.textContent = '· online';
                }
            }
        }
    });

    // -------------------------------------------------------------------------
    // 16. Power-User Keyboard Shortcuts Controller
    // -------------------------------------------------------------------------
    const fontTypes = ['default', 'serif', 'monospace'];
    let currentFontIndex = 0;

    // Track which panel the mouse is over (defaults to left panel)
    const leftPanel = document.querySelector('.left-panel');
    const rightPanel = document.querySelector('.right-panel');
    let activeScrollTarget = leftPanel;

    if (leftPanel) leftPanel.addEventListener('mouseenter', () => (activeScrollTarget = leftPanel));
    if (rightPanel) rightPanel.addEventListener('mouseenter', () => (activeScrollTarget = rightPanel));

    document.addEventListener('keydown', e => {
        // 1. Ignore if typing in an input field
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

        // 2. IGNORE modifier combinations (Ctrl+C, Cmd+C, Alt+Tab, etc.)
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        const key = e.key.toLowerCase();

        // 1. [ T ] -> Toggle Theme
        if (key === 't') {
            const isLight = document.body.classList.toggle('light-theme');
            localStorage.setItem('site_theme', isLight ? 'light' : 'dark');
        }

        // 2. [ L ] -> Toggle Language
        if (key === 'l') {
            const newLang = document.documentElement.lang === 'sv' ? 'en' : 'sv';
            setLanguage(newLang);
        }

        // 3. [ C ] -> Toggle CV Modal (Single 'c' tap only)
        if (key === 'c') {
            e.preventDefault();
            if (cvModal?.classList.contains('is-open')) {
                closeModal();
            } else {
                openModal();
            }
        }

        // 4. [ F ] -> Cycle Fonts
        if (key === 'f') {
            currentFontIndex = (currentFontIndex + 1) % fontTypes.length;
            const fontName = fontTypes[currentFontIndex];
            const targetFontBtn = document.querySelector(`.font-btn[data-font="${fontName}"]`);
            if (targetFontBtn) targetFontBtn.click();
        }

        // 5. [ 1 - 9 ] -> Open Project Repo
        if (/^[1-9]$/.test(key)) {
            const visibleCards = Array.from(document.querySelectorAll('.app-card')).filter(
                card => card.style.display !== 'none'
            );

            const targetCard = visibleCards[parseInt(key, 10) - 1];
            if (targetCard) {
                const repoLink = targetCard.querySelector('a.btn-primary[href]')?.getAttribute('href');
                if (repoLink) {
                    window.open(repoLink, '_blank', 'noopener,noreferrer');
                }
            }
        }

        // 6. [ ↑ / ↓ ] -> Smart Scrolling
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

    // -------------------------------------------------------------------------
    // 17. Education Thesis Accordion Controller
    // -------------------------------------------------------------------------
    const eduItems = document.querySelectorAll('.edu-item');

    eduItems.forEach(item => {
        const toggleBtn = item.querySelector('.edu-toggle-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const isOpen = item.classList.toggle('is-open');
                toggleBtn.setAttribute('aria-expanded', String(isOpen));
            });
        }
    });
});
