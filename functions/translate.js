export async function onRequestPost({ request }) {
  const body = await request.json();
  const { q, source, target } = body;

  const response = await fetch("https://deep-translate1.p.rapidapi.com/language/translate/v2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": "deep-translate1.p.rapidapi.com"
    },
    body: JSON.stringify({ q, source, target })
  });

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" }
  });
}
