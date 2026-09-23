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
// 1. EDUCATION (DYNAMIC FLYWEIGHT BUBBLE & EVENT DELEGATION)
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
            ? `<div class="course-links-row">${data.links
                  .map(
                      l =>
                          `<a href="${l.url}" target="_blank" rel="noopener noreferrer" class="course-ext-btn" aria-label="${l.label.replace(' ↗', '')} (opens in new tab)"><span>${l.label}</span></a>`
                  )
                  .join('')}</div>`
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
    const eduList = qs('.education-list');
    const eduSection = qs('.section-edu');
    if (!eduList) return;

    // 1. Allow clicking the Education <h2> heading to collapse all education
    const eduHeading = eduSection?.querySelector('h2');
    if (eduHeading) {
        eduHeading.style.cursor = 'pointer';
        on(eduHeading, 'click', () => {
            closeAllEducation();
        });
    }

    on(eduList, 'click', (e: MouseEvent) => {
        const target = e.target as HTMLElement | null;
        if (!target) return;

        if (target.closest('.bubble-close-btn')) {
            e.stopPropagation();
            closeAllCourseBubbles();
            return;
        }

        if (target.closest('.course-ext-btn') || target.closest('.white-talk-bubble')) {
            return;
        }

        // Inside initEducationAccordion():
        const header = target.closest<HTMLElement>('.edu-group-header');
        if (header) {
            e.stopPropagation();
            const group = header.closest<HTMLElement>('.edu-group');
            if (!group) return;

            const isCurrentlyExpanded = group.classList.contains('is-expanded');

            // Closes the sibling degree program before opening the new one
            closeAllEducation();

            if (!isCurrentlyExpanded) {
                group.classList.add('is-expanded');
                header.setAttribute('aria-expanded', 'true');
            }
            return;
        }

        const courseItem = target.closest<HTMLElement>('.course-item');
        if (courseItem) {
            e.stopPropagation();
            const courseId = courseItem.getAttribute('data-course-id');
            if (!courseId) return;

            const isAlreadyOpen = courseItem === activeCourseItem;
            closeAllCourseBubbles();

            if (!isAlreadyOpen) {
                renderCourseBubble(courseItem, courseId);
            }
        }
    });

    // Inside initEducationAccordion() in src/ts/features/skills.ts:
    on(eduList, 'keydown', (e: KeyboardEvent) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const target = e.target as HTMLElement | null;
        if (!target) return;

        // FIX: Allow DiVA Portal, arXiv, and popup close buttons to activate naturally
        if (target.closest('.course-ext-btn') || target.closest('.bubble-close-btn')) {
            return;
        }

        const header = target.closest<HTMLElement>('.edu-group-header');
        if (header) {
            e.preventDefault();
            header.click();
            return;
        }

        const courseItem = target.closest<HTMLElement>('.course-item');
        if (courseItem) {
            e.preventDefault();
            courseItem.click();
        }
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
// 2. SKILLS (DYNAMIC FLYWEIGHT BUBBLE ENBART)
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
}

function collapseAllSkills(): void {
    closeAllSkillBubbles();
    qsa('.skill-group').forEach(group => {
        group.classList.remove('is-expanded');
        const header = qs('.skill-group-header', group);
        if (header) header.setAttribute('aria-expanded', 'false');
    });
}

function initSkillsSystem(): void {
    const skillsSection = qs('.section-skills');
    const eduSection = qs('.section-edu');
    const skillsGrid = qs('.skills-grid');
    const leftPanel = qs('.left-panel');

    if (skillsGrid) {
        on(skillsGrid, 'click', (e: MouseEvent) => {
            const target = e.target as HTMLElement | null;
            if (!target) return;

            if (target.closest('.bubble-close-btn')) {
                e.stopPropagation();
                closeAllSkillBubbles();
                return;
            }

            if (target.closest('.white-talk-bubble')) return;

            // Inside initSkillsSystem():
            const header = target.closest<HTMLElement>('.skill-group-header');
            if (header) {
                e.stopPropagation();
                const group = header.closest<HTMLElement>('.skill-group');
                if (!group) return;
                const isCurrentlyExpanded = group.classList.contains('is-expanded');

                // We DO NOT close education here — the scroll IntersectionObserver
                // will naturally handle it once the user scrolls down.
                collapseAllSkills();

                if (!isCurrentlyExpanded) {
                    group.classList.add('is-expanded');
                    header.setAttribute('aria-expanded', 'true');
                }
                return;
            }

            const item = target.closest<HTMLElement>('.sub-skill-item[data-skill-key]');
            if (item) {
                e.stopPropagation();
                const skillKey = item.getAttribute('data-skill-key');
                if (!skillKey) return;

                const isAlreadyOpen = item === activeSkillItem;
                closeAllSkillBubbles();

                if (!isAlreadyOpen) {
                    renderSkillBubble(item, skillKey);
                }
            }
        });

        on(skillsGrid, 'keydown', (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            if (!target) return;

            if (e.key === 'Enter' || e.key === ' ') {
                const header = target.closest<HTMLElement>('.skill-group-header');
                if (header) {
                    e.preventDefault();
                    header.click();
                    return;
                }
                const item = target.closest<HTMLElement>('.sub-skill-item');
                if (item) {
                    e.preventDefault();
                    item.click();
                    return;
                }
            }

            const item = target.closest<HTMLElement>('.sub-skill-item');
            if (item) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const next = item.nextElementSibling as HTMLElement | null;
                    if (next?.classList.contains('sub-skill-item')) next.focus();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prev = item.previousElementSibling as HTMLElement | null;
                    if (prev?.classList.contains('sub-skill-item')) prev.focus();
                }
            }
        });
    }

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
