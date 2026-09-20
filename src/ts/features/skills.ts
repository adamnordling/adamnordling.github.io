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

function initEducationAccordion(): void {
    const eduItems = qsa('.edu-item');

    eduItems.forEach(item => {
        const toggleBtn = qs('.edu-toggle-btn', item);
        on(toggleBtn, 'click', () => {
            const isOpen = item.classList.toggle('is-open');
            if (toggleBtn) {
                toggleBtn.setAttribute('aria-expanded', String(isOpen));
            }
        });
    });
}

function initSkillsSystem(): void {
    const skillGroups = qsa('.skill-group');
    const subSkillItems = qsa('.sub-skill-item[data-skill-id]');
    const allProjectCards = qsa('.app-card');
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

        if (!hasMatch) {
            clearHighlights();
        }
    }

    function clearHighlights(): void {
        allProjectCards.forEach(card => {
            card.classList.remove('skill-highlighted', 'skill-dimmed');
            const drawer = qs('.app-tech-drawer', card);
            if (drawer) drawer.classList.remove('is-active');
        });
    }

    function closeAllBubbles(): void {
        // Fix 1: Added explicit braces to avoid returning a void expression
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
        });
    }

    // 1. Kategori-rad klick
    skillGroups.forEach(group => {
        const header = qs('.skill-group-header', group);
        on(header, 'click', e => {
            e.stopPropagation();
            const isCurrentlyExpanded = group.classList.contains('is-expanded');
            closeAllBubbles();
            group.classList.toggle('is-expanded', !isCurrentlyExpanded);
        });
    });

    // 2. Sub-skill items
    subSkillItems.forEach(item => {
        const skillTokens = (item.getAttribute('data-skill-id') ?? '').split(' ');

        on(item, 'mouseenter', () => {
            if (!activeSubSkill) {
                highlightSkill(skillTokens);
            }
        });

        on(item, 'mouseleave', () => {
            if (!activeSubSkill) {
                clearHighlights();
            }
        });

        on(item, 'click', e => {
            const target = e.target as HTMLElement | null;
            if (target && target.closest('.bubble-close-btn')) {
                e.stopPropagation();
                closeAllBubbles();
                return;
            }

            if (target && target.closest('.white-talk-bubble')) {
                return;
            }

            e.stopPropagation();

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
        });
    });

    // 3. Klick utanför (Fix 2 & 3: removed unnecessary optional chaining on non-nullish target)
    on(document, 'click', e => {
        const target = e.target as HTMLElement | null;
        if (!target || !target.closest('.section-skills')) {
            collapseAllSkills();
        } else if (!target.closest('.sub-skill-item') && !target.closest('.skill-group-header')) {
            closeAllBubbles();
        }
    });
}
