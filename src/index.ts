import { Hono } from 'hono';
import { serveStatic } from 'hono/cloudflare-workers';
import { frameTemplate } from './frameTemplate';
import { hasRecasted } from './hasRecasted';
import validateMessage from './validateMessage';

type FrameMessage = {
	untrustedData: {
		fid: number;
		url: string;
		messageHash: `0x${string}`;
		timestamp: number;
		network: 1;
		buttonIndex: 1 | 2 | 3 | 4;
		castId: {
			fid: number;
			hash: `0x${string}`;
		};
	};
	trustedData: {
		messageBytes: string;
	};
};
export interface Env {
	NEYNAR_API_KEY: string;
	NEYNAR_HUB_URL: string;
}

const app = new Hono();

const ORIGIN = 'https://lols2.danksh.art';
const LAST_PAGE = 23 - 1;

function pageToImageFilename(folderName: string, page: number) {
	if (folderName === 'lols2') {
		const frameOf = [
			25, 116, 180, 243, 295, 356, 411, 489, 568, 668, 733, 779, 800, 861, 894, 964, 1074, 1154, 1185, 1206, 1281, 1323, 1335,
		] as const;
		return `/${folderName}-frames/${String(frameOf[page]).padStart(4, '0')}.jpg`;
	}

	return `/${folderName}-frames/${String(page + 1).padStart(4, '0')}.jpg`;
}

app.get('/lols2-frames/*', serveStatic({ root: './', rewriteRequestPath: (path) => path.replace(/^\/lols2-frames/, '/lols2') }));
app.get('/', (c) =>
	c.html(
		frameTemplate({
			title: 'lols2',
			image: `${ORIGIN}${pageToImageFilename('lols2', 0)}`,
			buttons: ['Recast to view'],
			targetRoute: `${ORIGIN}/lols2/0`,
		})
	)
);

app.post('/lols2/:page', async (c) => {
	const frameMessage = (await c.req.json()) as FrameMessage;

	const fid = frameMessage.untrustedData.fid;
	const castHash = frameMessage.untrustedData.castId.hash;

	const [userHasRecasted, validatedMessage] = await Promise.allSettled([
		hasRecasted(castHash, fid, c.env!.NEYNAR_API_KEY as string),
		validateMessage(frameMessage.trustedData.messageBytes, c.env!.NEYNAR_HUB_URL as string),
	]);

	const valid = validatedMessage.status === 'fulfilled' && validatedMessage.value.valid && validatedMessage.value.message.data.fid === fid;

	const page = parseInt(c.req.param('page'));
	const action = (await c.req.json())['untrustedData']['buttonIndex'];
	c.status(200);
	let targetPage;
	if (action === 1) {
		if (page === 0) {
			// the first action button on page 0 is the next
			if (valid && userHasRecasted.status === 'fulfilled' && userHasRecasted.value) {
				targetPage = 1;
			} else {
				targetPage = 0;
			}
		} else {
			targetPage = page - 1;
		}
	} else {
		targetPage = page + 1;
	}

	let buttons = [];
	if (targetPage === 0) {
		if (valid && userHasRecasted.status === 'fulfilled' && userHasRecasted.value) {
			buttons = ['>'];
		} else {
			buttons = ['🔄 Recast to view'];
		}
	} else if (targetPage === LAST_PAGE) {
		buttons = ['<'];
	} else {
		buttons = ['<', '>'];
	}

	return c.html(
		frameTemplate({
			title: 'lols2',
			image: `${ORIGIN}${pageToImageFilename('lols2', targetPage)}`,
			buttons,
			targetRoute: `${ORIGIN}/lols2/${targetPage}`,
		})
	);
});

export default app;
