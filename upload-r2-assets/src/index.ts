interface Env {
	MY_BUCKET: R2Bucket;
	AUTH_SECRET: string;
}

export default {
	async fetch(request, env): Promise<Response> {
		if (request.method === 'PUT') {
			const auth = request.headers.get('Authorization');
			const expectedAuth = `Bearer ${env.AUTH_SECRET}`;

			if (!auth || auth != expectedAuth) {
				return new Response('Unauthorized', { status: 401 });
			}
			const url = new URL(request.url);
			const key = url.pathname.slice(1);
			await env.MY_BUCKET.put(key, request.body);
			return new Response(`Object ${key} uploaded successfully!`);
		}

		const url = new URL(request.url);
		const key = url.pathname.slice(1);

		const object = await env.MY_BUCKET.get(key);

		if (object === null) {
			return new Response('Object Not Found', { status: 404 });
		}

		const headers = new Headers();
		object.writeHttpMetadata(headers);
		headers.set('etag', object.httpEtag);

		return new Response(object.body, { headers });
	},
} satisfies ExportedHandler<Env>;
