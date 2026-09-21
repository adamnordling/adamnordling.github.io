import {defineConfig, type Plugin} from 'vite';

function inlineCssPlugin(): Plugin {
    return {
        name: 'inline-css-plugin',
        apply: 'build',
        enforce: 'post',
        transformIndexHtml(html, ctx) {
            if (!ctx.bundle) return html;
            let inlinedHtml = html;

            for (const [fileName, asset] of Object.entries(ctx.bundle)) {
                if (fileName.endsWith('.css') && asset.type === 'asset') {
                    const cssContent = typeof asset.source === 'string' ? asset.source : asset.source.toString();
                    inlinedHtml = inlinedHtml.replace(
                        new RegExp(`<link[^>]*href="[^"]*${fileName}"[^>]*>`, 'i'),
                        `<style>${cssContent}</style>`
                    );
                    inlinedHtml = inlinedHtml.replace(
                        /<link rel="stylesheet"[^>]*crossorigin[^>]*>/i,
                        `<style>${cssContent}</style>`
                    );
                }
            }
            return inlinedHtml;
        }
    };
}

export default defineConfig({
    base: './',
    root: './',
    publicDir: 'public',
    plugins: [inlineCssPlugin()],
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        target: 'es2022'
        // 'minify' behöver inte sättas — Vite minifierar automatiskt med Rolldown/OXC!
    }
});