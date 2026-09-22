import { qs, qsa, on } from '../utils/dom';

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
// 1. EDUCATION SECTION
// =============================================================================
export function closeAllCourseBubbles(): void {
    qsa('.course-item').forEach(item => {
        item.classList.remove('has-bubble-open', 'is-selected');
    });
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
            const isAlreadyOpen = item.classList.contains('has-bubble-open');
            closeAllCourseBubbles();

            if (!isAlreadyOpen) {
                item.classList.add('has-bubble-open', 'is-selected');
            }
        };

        on(item, 'click', e => {
            const target = e.target as HTMLElement | null;
            if (target?.closest('.bubble-close-btn')) {
                e.stopPropagation();
                closeAllCourseBubbles();
                return;
            }
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
// 2. SKILLS SECTION
// =============================================================================
function initSkillsSystem(): void {
    const skillsSection = qs('.section-skills');
    const eduSection = qs('.section-edu');
    const skillGroups = qsa('.skill-group');
    const subSkillItems = qsa('.sub-skill-item[data-skill-id]');
    const allProjectCards = qsa('.app-card');
    const leftPanel = qs('.left-panel');
    let activeSubSkill: HTMLElement | null = null;

    function highlightSkill(skillTokens: string[]): void {
        let hasMatch = false;

        for (const card of allProjectCards) {
            const cardSkills = (card.getAttribute('data-skills') ?? '').split(' ');
            const isMatch = skillTokens.some(token => cardSkills.includes(token));
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

        if (!hasMatch) clearHighlights();
    }

    function clearHighlights(): void {
        allProjectCards.forEach(card => {
            card.classList.remove('skill-highlighted', 'skill-dimmed');
            const drawer = qs('.app-tech-drawer', card);
            if (drawer) drawer.classList.remove('is-active');
        });
    }

    function closeAllBubbles(): void {
        qsa('.has-active-bubble').forEach(el => {
            el.classList.remove('has-active-bubble');
        });
        subSkillItems.forEach(item => {
            item.classList.remove('has-bubble-open', 'is-selected');
        });
        activeSubSkill = null;
        clearHighlights();
    }

    function collapseAllSkills(): void {
        closeAllBubbles();
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
            closeAllBubbles();
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

    subSkillItems.forEach(item => {
        const skillTokens = (item.getAttribute('data-skill-id') ?? '').split(' ');

        // Native mouseenter/mouseleave: zero bubbling, zero hover lag
        on(item, 'mouseenter', () => {
            if (!activeSubSkill) highlightSkill(skillTokens);
        });

        on(item, 'mouseleave', () => {
            if (!activeSubSkill) clearHighlights();
        });

        const toggleSubSkill = (): void => {
            const isAlreadyOpen = item.classList.contains('has-bubble-open');
            closeAllBubbles();

            if (!isAlreadyOpen) {
                const col = item.closest('.skills-column');
                const grp = item.closest('.skill-group');
                if (col) col.classList.add('has-active-bubble');
                if (grp) grp.classList.add('has-active-bubble');

                item.classList.add('has-bubble-open', 'is-selected');
                activeSubSkill = item;
                highlightSkill(skillTokens);
            }
        };

        on(item, 'click', e => {
            const target = e.target as HTMLElement | null;
            if (target?.closest('.bubble-close-btn')) {
                e.stopPropagation();
                closeAllBubbles();
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

    // Close on click outside
    on(document, 'click', (e: MouseEvent) => {
        const target = e.target as HTMLElement | null;
        if (!target) return;

        if (!target.closest('.section-skills')) {
            collapseAllSkills();
        } else if (!target.closest('.sub-skill-item') && !target.closest('.skill-group-header')) {
            closeAllBubbles();
        }

        if (!target.closest('.section-edu')) {
            closeAllEducation();
        }
    });

    // Escape closes both sections
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
                if (activeSubSkill) closeAllBubbles();
            },
            { passive: true }
        );
    }

    // Mobile: instant bubble close on scroll
    window.addEventListener(
        'scroll',
        () => {
            if (window.innerWidth <= 1150) closeAllBubbles();
        },
        { passive: true }
    );

    // =========================================================================
    // MOBILE AUTO-COLLAPSE (Restored)
    // =========================================================================
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
