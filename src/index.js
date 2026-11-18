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
          return new Response("too many submissions", {
            status: 429,
          });
        }
        const body = await request.json();
        const cleanText = String(body.text || "").trim();
        if (!cleanText || cleanText.length > 200) {
          return new Response("you've been rate limited!", {
            status: 400,
          });
        }
        const lastRow = await env.DB.prepare(
          'SELECT text FROM "table" ORDER BY id DESC LIMIT 1'
        ).first();
        if (lastRow && lastRow.text === cleanText) {
          return new Response("duplicate message cannot send", { status: 409 });
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