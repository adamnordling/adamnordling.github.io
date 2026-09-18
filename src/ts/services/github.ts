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

const GITHUB_USERNAME = 'adamnordling';
const CACHE_KEY = `gh_commits_${GITHUB_USERNAME}`;
const CACHE_TIME_KEY = `gh_commits_time_${GITHUB_USERNAME}`;
const TTL_MS = 60 * 1000;

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
    const cached = sessionStorage.getItem(CACHE_KEY);
    const cachedTime = sessionStorage.getItem(CACHE_TIME_KEY);

    if (cached && cachedTime && Date.now() - Number(cachedTime) < TTL_MS) {
        try {
            renderCommits(JSON.parse(cached) as CommitItem[]);
            return;
        } catch {
            sessionStorage.removeItem(CACHE_KEY);
            sessionStorage.removeItem(CACHE_TIME_KEY);
        }
    }

    // 1. Primary: Search API
    try {
        const res = await fetch(
            `https://api.github.com/search/commits?q=author:${encodeURIComponent(GITHUB_USERNAME)}&sort=author-date&order=desc&per_page=5`,
            { headers: { Accept: 'application/vnd.github+json' } }
        );

        if (res.ok) {
            const data = (await res.json()) as { items?: CommitItem[] };
            const commits = data.items ?? [];
            if (commits.length > 0) {
                sessionStorage.setItem(CACHE_KEY, JSON.stringify(commits));
                sessionStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
                renderCommits(commits);
                return;
            }
        }
    } catch {
        // Fallback to events endpoint
    }

    // 2. Fallback: Events API
    try {
        const eventsRes = await fetch(
            `https://api.github.com/users/${encodeURIComponent(GITHUB_USERNAME)}/events/public?per_page=30`
        );

        if (eventsRes.ok) {
            interface PushEventPayload {
                type: string;
                created_at: string;
                repo: { name: string };
                payload?: {
                    commits?: Array<{ message: string; sha: string }>;
                };
            }

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
                sessionStorage.setItem(CACHE_KEY, JSON.stringify(pushEvents));
                sessionStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
                renderCommits(pushEvents);
                return;
            }
        }
    } catch {
        // Both network requests failed
    }

    if (cached) {
        try {
            renderCommits(JSON.parse(cached) as CommitItem[]);
            return;
        } catch {
            // Ignore parse errors
        }
    }

    if (activityFeed) {
        activityFeed.innerHTML = `
            <div class="activity-skeleton">
                <span lang="en">GitHub activity temporarily unavailable.</span>
                <span lang="sv">GitHub-aktivitet tillfälligt otillgänglig.</span>
            </div>
        `;
    }
}
