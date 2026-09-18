export function qs(selector: string, parent: ParentNode = document): HTMLElement | null {
    return parent.querySelector<HTMLElement>(selector);
}

export function qsa(selector: string, parent: ParentNode = document): HTMLElement[] {
    return Array.from(parent.querySelectorAll<HTMLElement>(selector));
}

export function on<K extends keyof DocumentEventMap>(
    element: Document,
    event: K,
    handler: (e: DocumentEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
): void;
export function on<K extends keyof WindowEventMap>(
    element: Window,
    event: K,
    handler: (e: WindowEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
): void;
export function on<K extends keyof HTMLElementEventMap>(
    element: HTMLElement | null,
    event: K,
    handler: (e: HTMLElementEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
): void;
export function on(
    element: EventTarget | null,
    event: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
): void {
    if (!element) return;
    element.addEventListener(event, handler, options);
}
