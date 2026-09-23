import { qs } from '../utils/dom';
import { escapeHTML, sanitizeGithubUrl } from '../utils/security';

interface CommitItem {
    commit: {
        message: string;
        author: { date: string };
    };
    repository: { name: string };
    html_url: string;
    sha: string;
}

interface GitHubRepoItem {
    name: string;
    pushed_at: string;
    owner: { login: string };
}

interface GitHubDirectCommit {
    sha: string;
    html_url: string;
    commit: {
        message: string;
        author: { date: string };
    };
}

interface GitHubUserResponse {
    public_repos?: number;
}

interface GitHubSearchCommitResponse {
    total_count?: number;
}

const GITHUB_USERNAME = 'adamnordling';
const CACHE_COMMITS_KEY = `gh_commits_${GITHUB_USERNAME}`;
const CACHE_STATS_KEY = `gh_stats_${GITHUB_USERNAME}`;
const CACHE_TIME_KEY = `gh_time_${GITHUB_USERNAME}`;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache to avoid GitHub IP rate-limits

function isToday(dateString: string): boolean {
    const d = new Date(dateString);
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

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

function renderActivity(items: CommitItem[], stats: { today: number; totalCommits: number; totalRepos: number }): void {
    const activityFeed = qs('#activity-feed');
    if (!activityFeed) return;

    const statsBarHtml = `
        <div class="activity-stats-bar">
            <div class="stat-pill ${stats.today > 0 ? 'highlight-today' : ''}" title="Commits pushed today">
                ${stats.today > 0 ? '<span class="stat-pulse-dot"></span>' : ''}
                <span class="stat-num">${stats.today.toString()}</span>
                <small>
                    <span lang="en">TODAY</span>
                    <span lang="sv">IDAG</span>
                </small>
            </div>

            <div class="stat-pill" title="Total public commits">
                <svg class="stat-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
                <span class="stat-num">${stats.totalCommits.toString()}</span>
                <small>
                    <span lang="en">TOTAL</span>
                    <span lang="sv">TOTALT</span>
                </small>
            </div>

            <div class="stat-pill" title="Total public repositories">
                <svg class="stat-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                <span class="stat-num">${stats.totalRepos.toString()}</span>
                <small>
                    <span lang="en">REPOS</span>
                    <span lang="sv">REPOS</span>
                </small>
            </div>
        </div>
    `;

    if (items.length === 0) {
        activityFeed.innerHTML =
            statsBarHtml +
            `
            <div class="activity-skeleton">
                <span lang="en">No recent public commits found.</span>
                <span lang="sv">Inga nyliga offentliga commits hittades.</span>
            </div>
        `;
        return;
    }

    const commitIconSvg = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4"></circle>
            <line x1="1.05" y1="12" x2="7" y2="12"></line>
            <line x1="17" y1="12" x2="22.95" y2="12"></line>
        </svg>
    `;

    const commitsHtml = items
        .slice(0, 5)
        .map(item => {
            const rawMsg = item.commit.message || 'Code commit';
            const commitMessage = escapeHTML(rawMsg.split('\n')[0].trim());
            const repoName = escapeHTML(item.repository.name);
            const commitUrl = sanitizeGithubUrl(item.html_url, `https://github.com/${GITHUB_USERNAME}`);
            const commitDate = item.commit.author.date || new Date().toISOString();
            const rawSha = item.sha ? item.sha.substring(0, 7) : '';
            const shortSha = escapeHTML(rawSha);

            return `
                <a href="${commitUrl}" target="_blank" rel="noopener noreferrer" class="activity-item" title="${commitMessage}">
                    <div class="activity-icon" aria-hidden="true">${commitIconSvg}</div>
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

    activityFeed.innerHTML = statsBarHtml + commitsHtml;
}

export async function loadGitHubActivity(): Promise<void> {
    const activityFeed = qs('#activity-feed');
    let fallbackCommits: CommitItem[] = [];
    let fallbackStats = { today: 0, totalCommits: 200, totalRepos: 4 };

    const cachedCommits = localStorage.getItem(CACHE_COMMITS_KEY);
    const cachedStats = localStorage.getItem(CACHE_STATS_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

    if (cachedCommits && cachedStats) {
        try {
            fallbackCommits = JSON.parse(cachedCommits) as CommitItem[];
            fallbackStats = JSON.parse(cachedStats) as typeof fallbackStats;

            if (fallbackCommits.length > 0) {
                renderActivity(fallbackCommits, fallbackStats);
                // If cache is fresh, exit early and prevent unneeded API hits
                if (cachedTime && Date.now() - Number(cachedTime) < CACHE_TTL_MS) {
                    return;
                }
            }
        } catch {
            localStorage.removeItem(CACHE_COMMITS_KEY);
            localStorage.removeItem(CACHE_STATS_KEY);
        }
    }

    try {
        const headers = { Accept: 'application/vnd.github.v3+json' };

        const [reposRes, userRes, searchRes] = await Promise.allSettled([
            fetch(
                `https://api.github.com/users/${encodeURIComponent(GITHUB_USERNAME)}/repos?sort=pushed&direction=desc&per_page=5`,
                {
                    headers,
                    cache: 'no-store'
                }
            ),
            fetch(`https://api.github.com/users/${encodeURIComponent(GITHUB_USERNAME)}`, {
                headers,
                cache: 'no-store'
            }),
            fetch(`https://api.github.com/search/commits?q=author:${encodeURIComponent(GITHUB_USERNAME)}&per_page=1`, {
                headers: { Accept: 'application/vnd.github.cloak-preview+json, application/vnd.github.v3+json' },
                cache: 'no-store'
            })
        ]);

        // If rate limited, keep showing cached or graceful fallback stats
        if (reposRes.status === 'fulfilled' && reposRes.value.status === 403) {
            console.warn('⚡ [GitHub API] Rate limit hit (403). Using preserved cache/fallbacks.');
            if (fallbackCommits.length > 0) {
                renderActivity(fallbackCommits, fallbackStats);
            }
            return;
        }

        const allCommits: CommitItem[] = [];

        if (reposRes.status === 'fulfilled' && reposRes.value.ok) {
            const reposData = (await reposRes.value.json()) as GitHubRepoItem[];

            const commitPromises = reposData.slice(0, 3).map(async repo => {
                try {
                    const commitsRes = await fetch(
                        `https://api.github.com/repos/${repo.owner.login}/${repo.name}/commits?per_page=5`,
                        { headers, cache: 'no-store' }
                    );
                    if (commitsRes.ok) {
                        const directCommits = (await commitsRes.json()) as GitHubDirectCommit[];
                        return directCommits.map(c => ({
                            commit: {
                                message: c.commit.message,
                                author: { date: c.commit.author.date }
                            },
                            repository: { name: repo.name },
                            html_url: c.html_url,
                            sha: c.sha
                        }));
                    }
                } catch {
                    return [];
                }
                return [];
            });

            const settledCommits = await Promise.all(commitPromises);
            for (const repoCommits of settledCommits) {
                allCommits.push(...repoCommits);
            }
        }

        if (allCommits.length === 0 && fallbackCommits.length > 0) {
            renderActivity(fallbackCommits, fallbackStats);
            return;
        }

        allCommits.sort((a, b) => new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime());
        const finalCommits = allCommits.slice(0, 5);
        const commitsToday = finalCommits.filter(c => isToday(c.commit.author.date)).length;

        // Preserve previous total count if Search API hit the 10 req/min limit
        let exactTotalCommits = fallbackStats.totalCommits;
        if (searchRes.status === 'fulfilled' && searchRes.value.ok) {
            try {
                const searchData = (await searchRes.value.json()) as GitHubSearchCommitResponse;
                if (typeof searchData.total_count === 'number' && searchData.total_count > 0) {
                    exactTotalCommits = searchData.total_count;
                }
            } catch {
                // Keep fallback
            }
        }

        let totalPublicRepos = fallbackStats.totalRepos;
        if (userRes.status === 'fulfilled' && userRes.value.ok) {
            try {
                const userData = (await userRes.value.json()) as GitHubUserResponse;
                if (typeof userData.public_repos === 'number') {
                    totalPublicRepos = userData.public_repos;
                }
            } catch {
                // Keep fallback
            }
        }

        const stats = {
            today: commitsToday,
            totalCommits: exactTotalCommits,
            totalRepos: totalPublicRepos
        };

        if (finalCommits.length > 0) {
            localStorage.setItem(CACHE_COMMITS_KEY, JSON.stringify(finalCommits));
            localStorage.setItem(CACHE_STATS_KEY, JSON.stringify(stats));
            localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
            renderActivity(finalCommits, stats);
        }
        return;
    } catch (err: unknown) {
        console.error('GitHub API Fetch Error:', err);
        if (fallbackCommits.length > 0) {
            renderActivity(fallbackCommits, fallbackStats);
            return;
        }
    }

    if (activityFeed && fallbackCommits.length === 0) {
        activityFeed.innerHTML = `
            <div class="activity-skeleton">
                <span lang="en">GitHub activity temporarily unavailable.</span>
                <span lang="sv">GitHub-aktivitet tillfälligt otillgänglig.</span>
            </div>
        `;
    }
}
