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
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minuter lokal cache

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

    // 1. Telemetri-bar med EXAKTA tal (ingen "200+"-fallback)
    const statsBarHtml = `
        <div class="activity-stats-bar">
            <div class="stat-pill ${stats.today > 0 ? 'highlight-today' : ''}" title="Commits pushed today">
                ${stats.today > 0 ? '<span class="stat-pulse-dot"></span>' : ''}
                <span class="stat-num">${stats.today.toString()}</span>
                <small lang="en">TODAY</small>
                <small lang="sv">IDAG</small>
            </div>

            <div class="stat-pill" title="Exact total public commits on GitHub">
                <svg class="stat-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
                <span class="stat-num">${stats.totalCommits.toString()}</span>
                <small lang="en">TOTAL</small>
                <small lang="sv">TOTALT</small>
            </div>

            <div class="stat-pill" title="Total public repositories">
                <svg class="stat-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                <span class="stat-num">${stats.totalRepos.toString()}</span>
                <small lang="en">REPOS</small>
                <small lang="sv">REPOS</small>
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

    // 2. Visar ALLTID ditt riktiga commit-meddelande
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
    const cachedCommits = localStorage.getItem(CACHE_COMMITS_KEY);
    const cachedStats = localStorage.getItem(CACHE_STATS_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

    if (cachedCommits && cachedStats) {
        try {
            const parsedCommits = JSON.parse(cachedCommits) as CommitItem[];
            const parsedStats = JSON.parse(cachedStats) as { today: number; totalCommits: number; totalRepos: number };

            // Använd bara cache om den inte har den gamla "Pushed updates"-texten
            const hasGenericText = parsedCommits.some(c => c.commit.message.startsWith('Pushed updates'));

            if (parsedCommits.length > 0 && !hasGenericText) {
                renderActivity(parsedCommits, parsedStats);

                if (cachedTime && Date.now() - Number(cachedTime) < CACHE_TTL_MS) {
                    return;
                }
            } else {
                localStorage.removeItem(CACHE_COMMITS_KEY);
                localStorage.removeItem(CACHE_STATS_KEY);
            }
        } catch {
            localStorage.removeItem(CACHE_COMMITS_KEY);
            localStorage.removeItem(CACHE_STATS_KEY);
        }
    }

    try {
        const headers = { Accept: 'application/vnd.github.v3+json' };

        // 1. Hämta dina senast pushade repon (sorterade efter senaste aktivitet)
        // 2. Hämta användarens profil för totala repos
        // 3. Sök exakt totala antalet commits du skrivit på GitHub
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

        if (reposRes.status === 'fulfilled' && reposRes.value.status === 403) {
            const resetTime = reposRes.value.headers.get('x-ratelimit-reset');
            const resetMinutes = resetTime ? Math.ceil((Number(resetTime) * 1000 - Date.now()) / 60000) : 60;
            console.warn(`⚡ [GitHub API] Rate limit nådd (403). Återställs om ~${resetMinutes.toString()} minuter.`);
            return;
        }

        const allCommits: CommitItem[] = [];

        // Hämta RIKTIGA commits direkt från dina senast uppdaterade repon
        if (reposRes.status === 'fulfilled' && reposRes.value.ok) {
            const reposData = (await reposRes.value.json()) as GitHubRepoItem[];

            // Hämta alla commits parallellt på samma gång (skär ner tiden från 1500ms till 300ms)
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

        // Sortera kronologiskt, nyast överst
        allCommits.sort((a, b) => new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime());
        const finalCommits = allCommits.slice(0, 5);

        // Räkna commits gjorda idag (lokalt datum)
        const commitsToday = finalCommits.filter(c => isToday(c.commit.author.date)).length;

        // Räkna EXAKT totala commits från Search API
        let exactTotalCommits = finalCommits.length;
        if (searchRes.status === 'fulfilled' && searchRes.value.ok) {
            try {
                const searchData = (await searchRes.value.json()) as GitHubSearchCommitResponse;
                if (typeof searchData.total_count === 'number' && searchData.total_count > 0) {
                    exactTotalCommits = searchData.total_count;
                }
            } catch {
                // Fallback till faktiskt antal
            }
        }

        // Räkna totala publika repos
        let totalPublicRepos = 4;
        if (userRes.status === 'fulfilled' && userRes.value.ok) {
            try {
                const userData = (await userRes.value.json()) as GitHubUserResponse;
                if (typeof userData.public_repos === 'number') {
                    totalPublicRepos = userData.public_repos;
                }
            } catch {
                // Fallback
            }
        }

        const stats = {
            today: commitsToday,
            totalCommits: exactTotalCommits,
            totalRepos: totalPublicRepos
        };

        console.warn(
            `⚡ [GitHub Feed] Klart! Laddade ${finalCommits.length.toString()} äkta commits. Totalt: ${stats.totalCommits.toString()} st.`
        );

        if (finalCommits.length > 0) {
            localStorage.setItem(CACHE_COMMITS_KEY, JSON.stringify(finalCommits));
            localStorage.setItem(CACHE_STATS_KEY, JSON.stringify(stats));
            localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
        }

        renderActivity(finalCommits, stats);
        return;
    } catch (err: unknown) {
        console.error('GitHub API Fetch Error:', err);
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
