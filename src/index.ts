import { Hono } from 'hono';
import { html } from 'hono/html';
import { serveStatic } from 'hono/cloudflare-workers';

const app = new Hono();

const ORIGIN = 'https://lol-s2.dfish.workers.dev';
const LAST_PAGE = 5;

function frameResponse(title: string, image: string, buttons: string[], targetRoute: string) {
	return html`<html>
		<head>
			<title>${title}</title>
			<meta property="og:title" content="${title}" />
			<meta property="og:image" content="${image}" />
			<meta property="fc:frame" content="vNext" />
			<meta property="fc:frame:image" content="${image}" />
			${buttons.map((button, i) => html`<meta property="fc:frame:button:${i + 1}" content="${button}" />`)}
			<meta property="fc:frame:post_url" content="${targetRoute}" />
		</head>
		<body>
			This page is intended to be viewed as a frame on farcaster.
		</body>
	</html> `;
}

function pageToImageFilename(folderName: string, page: number) {
	return `/${folderName}-frames/${String(page * 3 + 1).padStart(4, '0')}.jpg`;
}

app.get('/', (c) => c.text(`Testing`));

app.get('/test-frames/*', serveStatic({ root: './', rewriteRequestPath: (path) => path.replace(/^\/test-frames/, '/test') }));
app.get('/test', (c) => c.html(frameResponse('test', `${ORIGIN}${pageToImageFilename('test', 0)}`, ['>'], `${ORIGIN}/test/0`)));

app.post('/test/:page', async (c) => {
	const page = parseInt(c.req.param('page'));
	const action = (await c.req.json())['untrustedData']['buttonIndex'];
	c.status(200);
	let targetPage;
	if (action === 1) {
		if (page === 0) {
			// the first action button on page 0 is the next
			targetPage = 1;
		}
		targetPage = page - 1;
	} else {
		targetPage = page + 1;
	}

	let buttons = [];
	if (targetPage === 0) {
		buttons = ['>'];
	} else if (targetPage === LAST_PAGE) {
		buttons = ['<'];
	} else {
		buttons = ['<', '>'];
	}

	return c.html(frameResponse('test', `${ORIGIN}${pageToImageFilename('test', targetPage)}`, buttons, `${ORIGIN}/test/${targetPage}`));
});

export default app;
