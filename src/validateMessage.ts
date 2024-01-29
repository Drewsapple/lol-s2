import { FrameActionMessage } from '@farcaster/core';

export async function validateMessage(hexString: string, hubURL: string) {
	const url = `${hubURL}/v1/validateMessage`;
	return await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/octet-stream',
		},
		body: new Uint8Array((hexString.match(/.{1,2}/g) ?? []).map((byte) => parseInt(byte, 16))),
	}).then(async (res) => {
		return (await res.json()) as { valid: false; message: FrameActionMessage | undefined } | { valid: true; message: FrameActionMessage };
	});
}

export default validateMessage;
