document.addEventListener('DOMContentLoaded', () => {
    'use strict';

// 1. Projects Filtering with Smooth Auto-Close
const filterDropdown = document.querySelector('.filter-dropdown');
const filterButtons = document.querySelectorAll('.filter-btn');
const cards = document.querySelectorAll('.app-card');

if (filterButtons.length > 0) {
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Update trigger label
            const label = document.querySelector('.filter-selected');
            if (label) {
                label.textContent = button.textContent.replace(' Projects', '');
            }

            // Filter cards
            const filterValue = button.getAttribute('data-filter') || 'all';
            cards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                card.style.display = (filterValue === 'all' || cardCategory === filterValue) ? 'flex' : 'none';
            });

            // Smoothly close menu immediately upon selection
            if (filterDropdown) {
                filterDropdown.classList.add('menu-closed');
            }
        });
    });

    // Re-enable hover open once mouse leaves
    if (filterDropdown) {
        filterDropdown.addEventListener('mouseleave', () => {
            filterDropdown.classList.remove('menu-closed');
        });
    }
}

    // 2. Dynamic Collapsible Bio Toggle
    const bioToggle = document.querySelector('.bio-toggle');
    const bioExpandable = document.querySelector('.bio-expandable');

    if (bioToggle && bioExpandable) {
        bioToggle.addEventListener('click', () => {
            const isExpanded = bioExpandable.classList.toggle('is-expanded');

            // Update accessibility attributes & display text
            bioToggle.setAttribute('aria-expanded', String(isExpanded));
            bioToggle.textContent = isExpanded ? '[Read less]' : '[Read more]';
        });
    }

    // 3. 3D Tilt & Mouse Tracking Spotlight Effect
    const container = document.querySelector('.profile-card-container');
    const card = document.querySelector('.profile-card-inner');
    const spotlight = document.querySelector('.spotlight');

    if (container && card) {
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();

            // Cursor position inside the element bounds
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Percentage boundaries relative to center coordinates
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Soft tilt limit of 12 degrees
            const rotateX = -((y - centerY) / centerY) * 12;
            const rotateY = ((x - centerX) / centerX) * 12;

            // Apply 3D perspective transforms
            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
            card.style.boxShadow = 'rgba(255, 255, 255, 0.08) 0 15px 35px 0';

            // Dynamically center radial spotlight directly underneath the cursor
            if (spotlight) {
                spotlight.style.opacity = '1';
                spotlight.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.18), transparent 55%)`;
            }
        });

        // Spring back smoothly on mouse leave
        container.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
            card.style.boxShadow = 'rgba(0, 0, 0, 0.29) 0 4px 25px 0';

            if (spotlight) {
                spotlight.style.opacity = '0';
            }
        });
    }

    // 4. Dark/Light Theme Toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
        });
    }

    // 5. Dynamic Font Switching Logic
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

                // Update CSS custom variable on document root element
                document.documentElement.style.setProperty('--font-stack', cssVariableValue);
            });
        });
    }
});