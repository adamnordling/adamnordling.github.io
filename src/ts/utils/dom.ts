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

export function initPerformanceMonitoring(): void {
    if (typeof PerformanceObserver === 'undefined') return;

    try {
        // 1. Observe Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver(entryList => {
            const entries = entryList.getEntries();
            if (entries.length > 0) {
                const lastEntry = entries[entries.length - 1];
                console.warn(`⚡ [Core Web Vitals] LCP: ${lastEntry.startTime.toFixed(1)}ms`);
            }
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

        // 2. Observe Cumulative Layout Shift (CLS)
        let clsScore = 0;
        const clsObserver = new PerformanceObserver(entryList => {
            const entries = entryList.getEntries() as Array<
                PerformanceEntry & {
                    value: number;
                    hadRecentInput: boolean;
                }
            >;
            for (const entry of entries) {
                if (!entry.hadRecentInput) {
                    clsScore += entry.value;
                }
            }
            console.warn(`⚡ [Core Web Vitals] CLS: ${clsScore.toFixed(3)}`);
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch {
        // Ignore if browser doesn't support specific observer types
    }
}
