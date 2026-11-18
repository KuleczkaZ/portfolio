export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/api/table") {
        if (request.method === "GET") {
          const { results } = await env.DB.prepare('SELECT * FROM "table"').all();
          return Response.json(results);
        }
        if (request.method === "POST") {
          if (env.MY_RATE_LIMITER) {
            const ip = request.headers.get("CF-Connecting-IP") || "unknown";
            const { success } = await env.MY_RATE_LIMITER.limit({ key: ip });
            if (!success) {
              return new Response("too many submissions", { status: 429 });
            }
          }
          const body = await request.json();
          const cleanText = String(body.text || "").trim();
          if (!cleanText || cleanText.length > 200) {
            return new Response("1-200 letters please", {
              status: 400,
            });
          }
          const lastRow = await env.DB.prepare(
            'SELECT text FROM "table" ORDER BY id DESC LIMIT 1'
          ).first();
          if (lastRow && lastRow.text === cleanText) {
            return new Response("duplicate", { status: 409 });
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
    } catch (err) {
      console.error("worker error; ", err);
      return new Response(`worker error; ${err.message}`, { status: 500 });
    }
  },
};