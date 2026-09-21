import { qs, on } from '../utils/dom';

export function initClipboard(): void {
    const emailCopyBtn = qs('#email-copy-btn');
    const emailToast = qs('#email-toast');
    let toastTimeout: ReturnType<typeof setTimeout> | null = null;

    if (!emailCopyBtn || !emailToast) return;

    // Officiella ASCII byte-koder för "adamnordling@live.se" (omöjligt att skrapa från HTML)
    const EMAIL_BYTES = [
        97, 100, 97, 109, 110, 111, 114, 100, 108, 105, 110, 103, 64, 108, 105, 118, 101, 46, 115, 101
    ];

    function handleCopy(): void {
        // Skapas i minnet direkt vid klick
        const email = String.fromCharCode(...EMAIL_BYTES);

        void navigator.clipboard.writeText(email).catch(() => {
            // Urklippsfel
        });

        emailToast?.classList.add('is-visible');

        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            emailToast?.classList.remove('is-visible');
        }, 2200);
    }

    on(emailCopyBtn, 'click', e => {
        e.preventDefault();
        handleCopy();
    });
}
