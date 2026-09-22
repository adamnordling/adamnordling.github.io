import { qs, qsa, on } from '../utils/dom';
import { EDUCATION_COURSES, type CourseData } from '../data/education-data';
import { SKILLS_DATA, type SkillData } from '../data/skills-data';

export function initSkillsAndBio(): void {
    initBioCard();
    initEducationAccordion();
    initSkillsSystem();
}

function initBioCard(): void {
    const bioCard = qs('#bio-card');
    if (!bioCard) return;

    on(bioCard, 'click', () => {
        const selection = window.getSelection()?.toString() ?? '';
        if (selection.length > 0) return;

        const isExpanded = bioCard.classList.toggle('is-expanded');
        bioCard.setAttribute('aria-expanded', String(isExpanded));

        const hintEn = qs('.bio-hint-text [lang="en"]', bioCard);
        const hintSv = qs('.bio-hint-text [lang="sv"]', bioCard);

        if (hintEn) hintEn.textContent = isExpanded ? 'less' : 'more';
        if (hintSv) hintSv.textContent = isExpanded ? 'mindre' : 'mer';
    });

    on(bioCard, 'keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            bioCard.click();
        }
    });
}

// =============================================================================
// 1. EDUCATION (DYNAMIC FLYWEIGHT BUBBLE)
// =============================================================================
let activeCourseItem: HTMLElement | null = null;
let activeCourseId: string | null = null;
const sharedEduBubble = document.createElement('div');
sharedEduBubble.className = 'white-talk-bubble dynamic-bubble';

function renderCourseBubble(item: HTMLElement, courseId: string): void {
    const data = (EDUCATION_COURSES as Record<string, CourseData | undefined>)[courseId];
    if (!data) return;

    const lang = document.documentElement.lang === 'sv' ? 'sv' : 'en';

    const linksHtml =
        data.links && data.links.length > 0
            ? `<div class="course-links-row">${data.links.map(l => `<a href="${l.url}" target="_blank" rel="noopener noreferrer" class="course-ext-btn"><span>${l.label}</span></a>`).join('')}</div>`
            : '';

    sharedEduBubble.innerHTML = `
        <div class="bubble-header">
            <span class="course-bubble-code">${data.code}</span>
            <button type="button" class="bubble-close-btn" aria-label="Close course popup">✕</button>
        </div>
        <div class="course-bubble-title">${data.title[lang]}</div>
        <p>${data.desc[lang]}</p>
        <div class="course-bubble-meta">${data.meta[lang]}</div>
        ${linksHtml}
    `;

    item.appendChild(sharedEduBubble);
    item.classList.add('has-bubble-open', 'is-selected');
    activeCourseItem = item;
    activeCourseId = courseId;
}

export function closeAllCourseBubbles(): void {
    if (activeCourseItem) {
        activeCourseItem.classList.remove('has-bubble-open', 'is-selected');
        if (sharedEduBubble.parentElement === activeCourseItem) {
            activeCourseItem.removeChild(sharedEduBubble);
        }
        activeCourseItem = null;
        activeCourseId = null;
    }
}

export function closeAllEducation(): void {
    closeAllCourseBubbles();
    qsa('.edu-group').forEach(group => {
        group.classList.remove('is-expanded');
        const header = qs('.edu-group-header', group);
        if (header) header.setAttribute('aria-expanded', 'false');
    });
}

function initEducationAccordion(): void {
    const eduGroups = qsa('.edu-group');
    const courseItems = qsa('.course-item');

    eduGroups.forEach(group => {
        const header = qs('.edu-group-header', group);
        if (!header) return;

        const toggleGroup = (): void => {
            const isCurrentlyExpanded = group.classList.contains('is-expanded');
            closeAllCourseBubbles();
            const willExpand = !isCurrentlyExpanded;
            group.classList.toggle('is-expanded', willExpand);
            header.setAttribute('aria-expanded', String(willExpand));
        };

        on(header, 'click', e => {
            e.stopPropagation();
            toggleGroup();
        });

        on(header, 'keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleGroup();
            }
        });
    });

    courseItems.forEach(item => {
        const toggleCourse = (): void => {
            const courseId = item.getAttribute('data-course-id');
            if (!courseId) return;

            const isAlreadyOpen = item === activeCourseItem;
            closeAllCourseBubbles();

            if (!isAlreadyOpen) {
                renderCourseBubble(item, courseId);
            }
        };

        on(item, 'click', e => {
            const target = e.target as HTMLElement | null;
            if (target?.closest('.bubble-close-btn')) {
                e.stopPropagation();
                closeAllCourseBubbles();
                return;
            }
            if (target?.closest('.course-ext-btn')) return;
            if (target?.closest('.white-talk-bubble')) return;
            e.stopPropagation();
            toggleCourse();
        });

        on(item, 'keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleCourse();
            }
        });
    });

    on(document, 'click', (e: MouseEvent) => {
        const target = e.target as HTMLElement | null;
        if (!target) return;

        if (!target.closest('.section-edu')) {
            closeAllEducation();
        } else if (!target.closest('.course-item') && !target.closest('.edu-group-header')) {
            closeAllCourseBubbles();
        }
    });
}

// =============================================================================
// 2. SKILLS (DYNAMIC FLYWEIGHT BUBBLE & HIGHLIGHTING)
// =============================================================================
let activeSkillItem: HTMLElement | null = null;
let activeSkillKey: string | null = null;
const sharedSkillBubble = document.createElement('div');
sharedSkillBubble.className = 'white-talk-bubble dynamic-bubble';

function renderSkillBubble(item: HTMLElement, skillKey: string): void {
    const data = (SKILLS_DATA as Record<string, SkillData | undefined>)[skillKey];
    if (!data) return;

    const lang = document.documentElement.lang === 'sv' ? 'sv' : 'en';

    sharedSkillBubble.innerHTML = `
        <div class="bubble-header">
            <span class="bubble-title">${data.title[lang]}</span>
            <button type="button" class="bubble-close-btn" aria-label="Close skill popup">✕</button>
        </div>
        <p>${data.desc[lang]}</p>
    `;

    item.appendChild(sharedSkillBubble);
    item.classList.add('has-bubble-open', 'is-selected');

    const col = item.closest('.skills-column');
    const grp = item.closest('.skill-group');
    if (col) col.classList.add('has-active-bubble');
    if (grp) grp.classList.add('has-active-bubble');

    activeSkillItem = item;
    activeSkillKey = skillKey;
}

function initSkillsSystem(): void {
    const skillsSection = qs('.section-skills');
    const eduSection = qs('.section-edu');
    const skillGroups = qsa('.skill-group');
    const subSkillItems = qsa('.sub-skill-item[data-skill-id]');
    const allProjectCards = qsa('.app-card');
    const leftPanel = qs('.left-panel');

    // ➕ Ersätt highlightSkill med denna precisionstestare:
    function highlightSkill(skillKey: string): void {
        let hasMatch = false;

        for (const card of allProjectCards) {
            const cardSkills = (card.getAttribute('data-skills') ?? '').split(/\s+/).filter(Boolean);
            const isMatch = cardSkills.includes(skillKey);
            const drawer = qs('.app-tech-drawer', card);

            if (isMatch) {
                hasMatch = true;
                card.classList.add('skill-highlighted');
                card.classList.remove('skill-dimmed');
                if (drawer) drawer.classList.add('is-active');
            } else {
                card.classList.add('skill-dimmed');
                card.classList.remove('skill-highlighted');
                if (drawer) drawer.classList.remove('is-active');
            }
        }

        // Om ingen av projekten använder kompetensen (t.ex. Java): återställ allt neutralt direkt
        if (!hasMatch) clearHighlights();
    }

    function clearHighlights(): void {
        allProjectCards.forEach(card => {
            card.classList.remove('skill-highlighted', 'skill-dimmed');
            const drawer = qs('.app-tech-drawer', card);
            if (drawer) drawer.classList.remove('is-active');
        });
    }

    function closeAllSkillBubbles(): void {
        qsa('.has-active-bubble').forEach(el => {
            el.classList.remove('has-active-bubble');
        });
        if (activeSkillItem) {
            activeSkillItem.classList.remove('has-bubble-open', 'is-selected');
            if (sharedSkillBubble.parentElement === activeSkillItem) {
                activeSkillItem.removeChild(sharedSkillBubble);
            }
            activeSkillItem = null;
            activeSkillKey = null;
        }
        clearHighlights();
    }

    function collapseAllSkills(): void {
        closeAllSkillBubbles();
        skillGroups.forEach(group => {
            group.classList.remove('is-expanded');
            const header = qs('.skill-group-header', group);
            if (header) header.setAttribute('aria-expanded', 'false');
        });
    }

    skillGroups.forEach(group => {
        const header = qs('.skill-group-header', group);
        if (!header) return;

        const toggleGroup = (): void => {
            const isCurrentlyExpanded = group.classList.contains('is-expanded');

            // 1. Fäll ihop alla andra öppna kompetensgrupper och stäng eventuella pratbubblor
            collapseAllSkills();

            // 2. Om den inte redan var öppen, fäll ut den nyligen klickade gruppen
            if (!isCurrentlyExpanded) {
                group.classList.add('is-expanded');
                header.setAttribute('aria-expanded', 'true');
            }
        };

        on(header, 'click', e => {
            e.stopPropagation();
            toggleGroup();
        });

        on(header, 'keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleGroup();
            }
        });
    });

    subSkillItems.forEach(item => {
        const skillKey = item.getAttribute('data-skill-key');

        // Blixtsnabb hover utan felaktiga triggers
        on(item, 'mouseenter', () => {
            if (!activeSkillItem && skillKey) highlightSkill(skillKey);
        });

        on(item, 'mouseleave', () => {
            if (!activeSkillItem) clearHighlights();
        });

        const toggleSubSkill = (): void => {
            if (!skillKey) return;
            const isAlreadyOpen = item === activeSkillItem;
            closeAllSkillBubbles();

            if (!isAlreadyOpen) {
                renderSkillBubble(item, skillKey);
                highlightSkill(skillKey);
            }
        };

        on(item, 'click', e => {
            const target = e.target as HTMLElement | null;
            if (target?.closest('.bubble-close-btn')) {
                e.stopPropagation();
                closeAllSkillBubbles();
                return;
            }
            if (target?.closest('.white-talk-bubble')) return;
            e.stopPropagation();
            toggleSubSkill();
        });

        on(item, 'keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleSubSkill();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const next = item.nextElementSibling as HTMLElement | null;
                if (next?.classList.contains('sub-skill-item')) next.focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prev = item.previousElementSibling as HTMLElement | null;
                if (prev?.classList.contains('sub-skill-item')) prev.focus();
            }
        });
    });

    on(document, 'click', (e: MouseEvent) => {
        const target = e.target as HTMLElement | null;
        if (!target) return;

        if (!target.closest('.section-skills')) {
            collapseAllSkills();
        } else if (!target.closest('.sub-skill-item') && !target.closest('.skill-group-header')) {
            closeAllSkillBubbles();
        }

        if (!target.closest('.section-edu')) {
            closeAllEducation();
        }
    });

    on(document, 'keydown', (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            collapseAllSkills();
            closeAllEducation();
        }
    });

    if (leftPanel) {
        on(
            leftPanel,
            'scroll',
            () => {
                if (activeSkillItem) closeAllSkillBubbles();
            },
            { passive: true }
        );
    }

    window.addEventListener(
        'scroll',
        () => {
            if (window.innerWidth <= 1150) {
                closeAllSkillBubbles();
                closeAllCourseBubbles();
            }
        },
        { passive: true }
    );

    // Live-uppdatering vid språkväxling
    window.addEventListener('site:languagechange', () => {
        if (activeCourseItem && activeCourseId) {
            renderCourseBubble(activeCourseItem, activeCourseId);
        }
        if (activeSkillItem && activeSkillKey) {
            renderSkillBubble(activeSkillItem, activeSkillKey);
        }
    });

    if (typeof IntersectionObserver !== 'undefined') {
        const autoCollapseObserver = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting && window.innerWidth <= 1150) {
                        if (entry.target.classList.contains('section-skills')) {
                            collapseAllSkills();
                        } else if (entry.target.classList.contains('section-edu')) {
                            closeAllEducation();
                        }
                    }
                });
            },
            { threshold: 0.01 }
        );

        if (skillsSection) autoCollapseObserver.observe(skillsSection);
        if (eduSection) autoCollapseObserver.observe(eduSection);
    }
}
