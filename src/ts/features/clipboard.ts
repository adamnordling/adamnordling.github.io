import { qs, on } from '../utils/dom';

export function initClipboard(): void {
    const emailCopyBtn = qs('#email-copy-btn');
    const emailToast = qs('#email-toast');
    let toastTimeout: ReturnType<typeof setTimeout> | null = null;

    if (!emailCopyBtn || !emailToast) return;

    function handleCopy(): void {
        const obf = emailCopyBtn?.getAttribute('data-obf');
        if (!obf) return;

        let email = '';
        try {
            email = atob(obf);
        } catch {
            return;
        }

        void navigator.clipboard.writeText(email).catch(() => {
            // Clipboard access denied or unsupported
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
