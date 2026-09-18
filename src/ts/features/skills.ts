import { qs, qsa, on } from '../utils/dom';

export function initSkillsAndBio(): void {
    initBioCard();
    initEducationAccordion();
    initSkillHighlighting();
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
            toggleBtn?.setAttribute('aria-expanded', String(isOpen));
        });
    });
}

function initSkillHighlighting(): void {
    const skillItems = qsa('.skill-item[data-skill-id]');
    const allProjectCards = qsa('.app-card');
    let activeSkillId: string | null = null;

    function highlightSkill(skillId: string): void {
        let hasMatch = false;

        // Native for...of allows TypeScript's compiler to see hasMatch become true
        for (const card of allProjectCards) {
            const cardSkills = (card.getAttribute('data-skills') ?? '').split(' ');
            const isMatch = cardSkills.includes(skillId);
            const drawer = qs('.app-tech-drawer', card);

            if (isMatch) {
                hasMatch = true;
                card.classList.add('skill-highlighted');
                card.classList.remove('skill-dimmed');
                drawer?.classList.add('is-active');
            } else {
                card.classList.add('skill-dimmed');
                card.classList.remove('skill-highlighted');
                drawer?.classList.remove('is-active');
            }
        }

        if (!hasMatch) {
            clearHighlights();
        }
    }

    function clearHighlights(): void {
        activeSkillId = null;
        allProjectCards.forEach(card => {
            card.classList.remove('skill-highlighted', 'skill-dimmed');
            qs('.app-tech-drawer', card)?.classList.remove('is-active');
        });
        skillItems.forEach(item => {
            item.classList.remove('skill-selected');
        });
    }

    skillItems.forEach(item => {
        const skillId = item.getAttribute('data-skill-id');
        if (!skillId) return;

        on(item, 'mouseenter', () => {
            if (activeSkillId === null) highlightSkill(skillId);
        });

        on(item, 'mouseleave', () => {
            if (activeSkillId === null) clearHighlights();
        });

        on(item, 'click', e => {
            e.stopPropagation();
            if (activeSkillId === skillId) {
                clearHighlights();
            } else {
                clearHighlights();
                activeSkillId = skillId;
                item.classList.add('skill-selected');
                highlightSkill(skillId);
            }
        });
    });

    on(document, 'click', e => {
        const target = e.target as HTMLElement | null;
        if (!target?.closest('.skill-item')) {
            clearHighlights();
        }
    });
}
