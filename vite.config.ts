import {defineConfig, type Plugin} from 'vite';
import {minify} from 'html-minifier-terser';

function inlineAndMinifyHtmlPlugin(): Plugin {
    return {
        name: 'inline-and-minify-html-plugin',
        apply: 'build',
        enforce: 'post',
        async transformIndexHtml(html, ctx) {
            if (!ctx.bundle) return html;
            let inlinedHtml = html;

            // 1. Inline compiled CSS into <style>
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

            // 2. Minify raw HTML, comments, and whitespace
            return await minify(inlinedHtml, {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                minifyCSS: true
            });
        }
    };
}

export default defineConfig({
    base: './',
    root: './',
    publicDir: 'public',
    plugins: [inlineAndMinifyHtmlPlugin()],
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        target: 'es2022'
    }
});