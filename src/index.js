export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/table") {
      if (request.method === "GET") {
        const { results } = await env.DB.prepare('SELECT * FROM "table"').all();
        return Response.json(results);
      }
      if (request.method === "POST") {
        const ip = request.headers.get("CF-Connecting-IP") || "unknown";
        const { success } = await env.ratelimit.limit({ key: ip });
        if (!success) {
          return new Response("rate limit hit! try again later", {
            status: 429,
          });
        }
        const body = await request.json();
        if (body.website) {
          return new Response("you've been rate limited! sorry!", { status: 400 });
        }
        const cleanText = String(body.text || "").trim();
        if (!cleanText || cleanText.length > 200) {
          return new Response("question must be 1-200 characters", {
            status: 400,
          });
        }
        const unixTime = Math.floor(Date.now() / 1000);
        const newRow = await env.DB.prepare(
          'INSERT INTO "table" (text, time) VALUES (?, ?) RETURNING *'
        )
          .bind(cleanText, unixTime)
          .first();
        return Response.json(newRow, { status: 201 });
      }
    }
    return env.ASSETS.fetch(request);
  },
};