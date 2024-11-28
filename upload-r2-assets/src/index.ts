interface Env {
	MY_BUCKET: R2Bucket;
}

export default {
	async fetch(request, env): Promise<Response> {
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
