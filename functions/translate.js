// functions/translate.js
export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();

    const res = await fetch("https://deep-translate1.p.rapidapi.com/language/translate/v2", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-RapidAPI-Key": env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "deep-translate1.p.rapidapi.com"
      },
      body: JSON.stringify({
        q: body.q,
        source: body.source,
        target: body.target
      })
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Translation API error" }), { status: 500 });
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
