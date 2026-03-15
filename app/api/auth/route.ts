export async function POST(request: Request) {
  const expected = process.env.APP_PASSWORD;
  if (!expected) {
    return Response.json({ ok: true });
  }

  let body: { password?: string };
  try {
    body = (await request.json()) as { password?: string };
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  if (typeof body.password !== "string" || body.password !== expected) {
    return Response.json({ ok: false }, { status: 401 });
  }

  return Response.json({ ok: true });
}
