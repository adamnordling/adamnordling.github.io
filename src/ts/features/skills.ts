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
            toggleBtn?.setAttribute('aria-expanded', String(isOpen));
        });
    });
}

function initSkillsSystem(): void {
    const skillGroups = qsa('.skill-group');
    const subSkillItems = qsa('.sub-skill-item[data-skill-id]');
    const allProjectCards = qsa('.app-card');
    let activeSubSkill: HTMLElement | null = null;

    // 1. Klick på en kategori-rad -> Fäll ut de vertikala språken
    skillGroups.forEach(group => {
        const header = qs('.skill-group-header', group);
        on(header, 'click', e => {
            e.stopPropagation();
            const isCurrentlyExpanded = group.classList.contains('is-expanded');

            // Stäng öppna bubblor om vi stänger raden
            if (isCurrentlyExpanded) {
                closeAllBubbles();
            }

            group.classList.toggle('is-expanded');
        });
    });

    // 2. Koppla språket till projekten till höger
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
        allProjectCards.forEach(card => {
            card.classList.remove('skill-highlighted', 'skill-dimmed');
            qs('.app-tech-drawer', card)?.classList.remove('is-active');
        });
    }

    function closeAllBubbles(): void {
        subSkillItems.forEach(item => {
            item.classList.remove('has-bubble-open', 'is-selected');
        });
        activeSubSkill = null;
        clearHighlights();
    }

    // 3. Hantera interaktion på varje enskilt språk
    subSkillItems.forEach(item => {
        const skillTokens = (item.getAttribute('data-skill-id') ?? '').split(' ');

        // Hover: Tänd projekt till höger
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

        // Klick på språket -> Öppna White Talk Bubble & lås markeringen
        on(item, 'click', e => {
            const target = e.target as HTMLElement | null;
            if (target?.closest('.bubble-close-btn')) {
                e.stopPropagation();
                closeAllBubbles();
                return;
            }

            // Klick i bubblans text stänger inte
            if (target?.closest('.white-talk-bubble')) {
                return;
            }

            e.stopPropagation();

            const isAlreadyOpen = item.classList.contains('has-bubble-open');
            closeAllBubbles();

            if (!isAlreadyOpen) {
                item.classList.add('has-bubble-open', 'is-selected');
                activeSubSkill = item;
                highlightSkill(skillTokens);
            }
        });
    });

    // Klick utanför stänger bubblan
    on(document, 'click', e => {
        const target = e.target as HTMLElement | null;
        if (!target?.closest('.sub-skill-item')) {
            closeAllBubbles();
        }
    });
}
