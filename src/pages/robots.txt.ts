import type { APIRoute } from 'astro';

// robots.txt genere au build : le lien du sitemap suit automatiquement le
// domaine "site" defini dans astro.config.mjs.
export const GET: APIRoute = ({ site }) => {
	const sitemap = new URL('sitemap-index.xml', site).href;
	return new Response(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\n\nSitemap: ${sitemap}\n`, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
