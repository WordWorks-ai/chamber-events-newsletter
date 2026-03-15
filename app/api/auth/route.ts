import { z } from "zod";

const bodySchema = z.object({
  password: z.string().min(1)
});

export async function POST(request: Request) {
  const expected = process.env.APP_PASSWORD;
  if (!expected) {
    return Response.json({ ok: true });
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ ok: false }, { status: 400 });
  }

  if (parsed.data.password !== expected) {
    return Response.json({ ok: false }, { status: 401 });
  }

  return Response.json({ ok: true });
}
