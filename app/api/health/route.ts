import { z } from "zod";

import { getRuntimeDependencies } from "@/lib/server/runtime";

const healthResponseSchema = z.object({
  ok: z.literal(true),
  repository: z.enum(["supabase", "memory"]),
  now: z.string().datetime()
});

export function GET() {
  const runtime = getRuntimeDependencies();
  const payload = healthResponseSchema.parse({
    ok: true,
    repository: runtime.repository.kind,
    now: runtime.now().toISOString()
  });

  return Response.json(payload);
}
