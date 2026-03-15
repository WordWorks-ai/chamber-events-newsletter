export const runtime = "nodejs";

import { generateNewsletterPreview } from "@/lib/newsletter/service";
import { getRuntimeDependencies, resultToErrorResponse } from "@/lib/server/runtime";
import { newsletterRequestSchema } from "@/lib/utils/validation";

export async function POST(request: Request) {
  const payload = newsletterRequestSchema.safeParse(await request.json());
  if (!payload.success) {
    return Response.json(
      {
        ok: false,
        error: {
          code: "INVALID_REQUEST",
          message: "The preview request payload is invalid.",
          details: payload.error.flatten()
        }
      },
      {
        status: 400
      }
    );
  }

  const runtime = getRuntimeDependencies();
  const result = await generateNewsletterPreview(payload.data, runtime);

  if (!result.ok) {
    return resultToErrorResponse(result);
  }

  return Response.json(result.data);
}
