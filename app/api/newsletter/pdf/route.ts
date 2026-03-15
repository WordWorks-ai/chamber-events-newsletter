export const runtime = "nodejs";

import { renderNewsletterPdfStream } from "@/lib/newsletter/pdf-renderer";
import { generateNewsletterPreview, parsePdfPayload } from "@/lib/newsletter/service";
import { getRuntimeDependencies, resultToErrorResponse } from "@/lib/server/runtime";

function toWebReadableStream(stream: NodeJS.ReadableStream): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      stream.on("data", (chunk) => {
        controller.enqueue(chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk));
      });
      stream.on("end", () => controller.close());
      stream.on("error", (error) => controller.error(error));
    }
  });
}

export async function POST(request: Request) {
  try {
    const payload = parsePdfPayload(await request.json());
    if (!payload.ok) {
      return resultToErrorResponse(payload);
    }

    const runtime = getRuntimeDependencies();
    let viewModel;

    if (payload.data.mode === "viewModel") {
      viewModel = payload.data.viewModel;
    } else {
      const previewResult = await generateNewsletterPreview(payload.data.request, runtime);
      if (!previewResult.ok) {
        return resultToErrorResponse(previewResult);
      }

      viewModel = previewResult.data.viewModel;
    }

    const stream = await renderNewsletterPdfStream(viewModel);

    const safeSlug = viewModel.chamberName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const filename = `${safeSlug || "chamber"}-newsletter.pdf`;

    return new Response(toWebReadableStream(stream), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error("[pdf] Unhandled error:", error);
    return Response.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred while generating the PDF.",
          details: error instanceof Error ? `${error.message}\n${error.stack}` : String(error)
        }
      },
      { status: 500 }
    );
  }
}
