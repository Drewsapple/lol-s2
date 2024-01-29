import { html } from 'hono/html';

export function frameTemplate({
	title,
	image,
	buttons,
	targetRoute,
	body,
}: {
	title: string;
	image: string;
	buttons: string[];
	targetRoute: string;
	body?: string;
}) {
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
		${body &&
		html`<body>
			${body}
		</body>`}
	</html> `;
}
