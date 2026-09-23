import { qs, qsa, on } from '../utils/dom';

export function initProjectFilter(): void {
    const filterDropdown = qs('.filter-dropdown');
    const filterButtons = qsa('.filter-btn');
    const cards = qsa('.app-card');

    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            on(button, 'click', () => {
                filterButtons.forEach(btn => {
                    btn.classList.remove('active');
                });
                button.classList.add('active');

                const filterSelected = qs('.filter-selected');
                const enEl = button.querySelector('[lang="en"]');
                const svEl = button.querySelector('[lang="sv"]');

                let btnEnText = '';
                if (enEl && enEl.textContent) {
                    btnEnText = enEl.textContent.replace(' Projects', '');
                } else if (button.textContent) {
                    btnEnText = button.textContent;
                }

                let btnSvText = '';
                if (svEl && svEl.textContent) {
                    btnSvText = svEl.textContent.replace(' Projekt', '');
                } else if (button.textContent) {
                    btnSvText = button.textContent;
                }

                if (filterSelected && btnEnText.length > 0 && btnSvText.length > 0) {
                    filterSelected.innerHTML = `
                        <span lang="en">${btnEnText}</span>
                        <span lang="sv">${btnSvText}</span>
                    `;
                }

                const filterValue = button.getAttribute('data-filter') ?? 'all';

                const updateCardVisibility = (): void => {
                    cards.forEach(card => {
                        const cardCategory = card.getAttribute('data-category');
                        card.style.display = filterValue === 'all' || cardCategory === filterValue ? 'flex' : 'none';
                    });
                };

                if ('startViewTransition' in document) {
                    document.startViewTransition(() => {
                        updateCardVisibility();
                    });
                } else {
                    updateCardVisibility();
                }

                filterDropdown?.classList.add('menu-closed');
            });
        });

        // Inside initProjectFilter() in src/ts/features/filter.ts:
        if (filterDropdown) {
            on(filterDropdown, 'mouseleave', () => {
                filterDropdown.classList.remove('menu-closed');
            });

            // Remove menu-closed whenever keyboard focus enters the dropdown
            on(filterDropdown, 'focusin', () => {
                filterDropdown.classList.remove('menu-closed');
            });
        }
    }

    updateCategoryCounts();
}

function updateCategoryCounts(): void {
    const allCards = qsa('.app-card');
    const filterBtns = qsa('.filter-btn');

    filterBtns.forEach(btn => {
        const category = btn.getAttribute('data-filter') ?? 'all';
        const countSpan = qs('.filter-count', btn);
        if (!countSpan) return;

        const count = category === 'all' ? allCards.length : qsa(`.app-card[data-category="${category}"]`).length;

        countSpan.textContent = `(${count.toString()})`;
    });
}
