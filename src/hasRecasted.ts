export async function hasRecasted(castHash: string, fid: number, apiKey: string) {
	const options = {
		method: 'GET',
		headers: { accept: 'application/json', api_key: apiKey },
	};
	const castRes = await fetch(`https://api.neynar.com/v2/farcaster/cast?identifier=${castHash}&type=hash`, options);
	const cast = await castRes.json();
	const recasts = (cast.cast.reactions.recasts ?? []) as { fid: number }[];

	return recasts.some((recaster) => recaster.fid === fid);
}
