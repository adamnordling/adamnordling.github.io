import { qs } from '../utils/dom';

export function initClock(): void {
    const clockTimeEl = qs('#clock-time');
    const clockWeekNumEl = qs('#clock-week-num');
    const clockYearEl = qs('#clock-year');

    function getISOWeekNumber(date: Date): number {
        const target = new Date(date.valueOf());
        const dayNr = (date.getDay() + 6) % 7;
        target.setDate(target.getDate() - dayNr + 3);
        const firstThursday = target.valueOf();
        target.setMonth(0, 1);
        if (target.getDay() !== 4) {
            target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
        }
        return 1 + Math.ceil((firstThursday - target.getTime()) / (7 * 24 * 3600 * 1000));
    }

    function update(): void {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        if (clockTimeEl) clockTimeEl.textContent = `${hours}:${minutes}`;
        if (clockWeekNumEl) clockWeekNumEl.textContent = String(getISOWeekNumber(now)).padStart(2, '0');
        if (clockYearEl) clockYearEl.textContent = String(now.getFullYear());
    }

    update();
    setInterval(update, 1000);
}
