export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/table") {
      const { results } = await env.DB.prepare("SELECT * FROM table").all();
      return Response.json(results);
    }
    return env.ASSETS.fetch(request);
  },
};