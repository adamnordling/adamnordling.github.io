import { qs } from '../utils/dom';
import { escapeHTML, sanitizeGithubUrl } from '../utils/security';

interface CommitItem {
    commit?: {
        message: string;
        author?: { date: string };
    };
    message?: string;
    repository?: { name: string };
    repo_name?: string;
    html_url?: string;
    created_at?: string;
    sha?: string;
}

interface PushEventPayload {
    type: string;
    created_at: string;
    repo: { name: string };
    payload?: {
        commits?: Array<{ message: string; sha: string }>;
        action?: string;
    };
}

const GITHUB_USERNAME = 'adamnordling';
const CACHE_KEY = `gh_commits_${GITHUB_USERNAME}`;
const CACHE_TIME_KEY = `gh_commits_time_${GITHUB_USERNAME}`;
const TTL_MS = 60 * 1000; // 1 minute cache freshness

function timeAgo(dateString: string): string {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    const intervals = [
        { labelEn: 'y ago', labelSv: 'år sedan', secs: 31536000 },
        { labelEn: 'mo ago', labelSv: 'mån sedan', secs: 2592000 },
        { labelEn: 'd ago', labelSv: 'd sedan', secs: 86400 },
        { labelEn: 'h ago', labelSv: 'h sedan', secs: 3600 },
        { labelEn: 'm ago', labelSv: 'm sedan', secs: 60 }
    ];

    for (const i of intervals) {
        const count = Math.floor(seconds / i.secs);
        if (count >= 1) {
            return `
                <span lang="en">${count.toString()}${i.labelEn}</span>
                <span lang="sv">${count.toString()} ${i.labelSv}</span>
            `;
        }
    }

    return `
        <span lang="en">just now</span>
        <span lang="sv">just nu</span>
    `;
}

function renderCommits(items: CommitItem[]): void {
    const activityFeed = qs('#activity-feed');
    if (!activityFeed) return;

    if (items.length === 0) {
        activityFeed.innerHTML = `
            <div class="activity-skeleton">
                <span lang="en">No recent public commits found.</span>
                <span lang="sv">Inga nyliga offentliga commits hittades.</span>
            </div>
        `;
        return;
    }

    activityFeed.innerHTML = items
        .slice(0, 5)
        .map(item => {
            const rawMsg = item.commit?.message ?? item.message ?? 'Code commit';
            const commitMessage = escapeHTML(rawMsg.split('\n')[0].trim());
            const repoName = escapeHTML(item.repository?.name ?? item.repo_name ?? 'repository');
            const rawUrl = item.html_url ?? `https://github.com/${GITHUB_USERNAME}/${repoName}`;
            const commitUrl = sanitizeGithubUrl(rawUrl, `https://github.com/${GITHUB_USERNAME}`);
            const commitDate = item.commit?.author?.date ?? item.created_at ?? new Date().toISOString();
            const rawSha = item.sha ? item.sha.substring(0, 7) : '';
            const shortSha = escapeHTML(rawSha);

            return `
                <a href="${commitUrl}" target="_blank" rel="noopener noreferrer" class="activity-item" title="${commitMessage}">
                    <div class="activity-icon">⚡</div>
                    <div class="activity-body">
                        <div class="activity-title">${commitMessage}</div>
                        <div class="activity-desc">
                            <span>${repoName}</span>
                            ${shortSha.length > 0 ? `<span>· <code>${shortSha}</code></span>` : ''}
                        </div>
                        <div class="activity-time">${timeAgo(commitDate)}</div>
                    </div>
                </a>
            `;
        })
        .join('');
}

export async function loadGitHubActivity(): Promise<void> {
    const activityFeed = qs('#activity-feed');
    const cached = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

    let hasRenderedCache = false;
    if (cached) {
        try {
            const parsed = JSON.parse(cached) as CommitItem[];
            renderCommits(parsed);
            hasRenderedCache = true;

            if (cachedTime && Date.now() - Number(cachedTime) < TTL_MS) {
                return; // Fresh cache, skip network completely
            }
        } catch {
            localStorage.removeItem(CACHE_KEY);
            localStorage.removeItem(CACHE_TIME_KEY);
        }
    }

    // ONLY use the lightning-fast Public Events API (~12 KB payload)
    try {
        const eventsRes = await fetch(
            `https://api.github.com/users/${encodeURIComponent(GITHUB_USERNAME)}/events/public?per_page=10`
        );

        if (eventsRes.ok) {
            const eventsData = (await eventsRes.json()) as PushEventPayload[];
            const pushEvents: CommitItem[] = eventsData
                .filter(e => e.type === 'PushEvent' && (e.payload?.commits?.length ?? 0) > 0)
                .flatMap(e =>
                    (e.payload?.commits ?? []).map(c => ({
                        commit: {
                            message: c.message,
                            author: { date: e.created_at }
                        },
                        repository: {
                            name: e.repo.name.replace(`${GITHUB_USERNAME}/`, '')
                        },
                        html_url: `https://github.com/${e.repo.name}/commit/${c.sha}`,
                        sha: c.sha
                    }))
                )
                .slice(0, 5);

            if (pushEvents.length > 0) {
                localStorage.setItem(CACHE_KEY, JSON.stringify(pushEvents));
                localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
                renderCommits(pushEvents);
                return;
            }
        }
    } catch {
        // Network error handled below gracefully
    }

    // If API failed or returned no push events and we have no cache, display graceful fallback
    if (!hasRenderedCache && activityFeed) {
        activityFeed.innerHTML = `
            <div class="activity-skeleton">
                <span lang="en">GitHub activity temporarily unavailable.</span>
                <span lang="sv">GitHub-aktivitet tillfälligt otillgänglig.</span>
            </div>
        `;
    }
}
