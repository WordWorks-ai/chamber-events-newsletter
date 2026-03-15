import { describe, expect, it, vi } from "vitest";

import { renderNewsletterPdfStream } from "@/lib/newsletter/pdf-renderer";
import { makePreviewResponse } from "@/tests/helpers";

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];

  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

describe("renderNewsletterPdfStream", () => {
  it("renders a PDF stream and hydrates same-site images", async () => {
    const preview = makePreviewResponse();
    const viewModel = {
      ...preview.viewModel,
      branding: {
        ...preview.viewModel.branding,
        logoUrl: "https://columbus.org/assets/logo.svg",
        faviconUrl: "https://columbus.org/favicon.svg"
      }
    };
    const fetchMock = vi.fn().mockImplementation(async () => {
      return new Response("<svg xmlns='http://www.w3.org/2000/svg'></svg>", {
        status: 200,
        headers: {
          "content-type": "image/svg+xml"
        }
      });
    });

    const stream = await renderNewsletterPdfStream(viewModel, fetchMock);
    const buffer = await streamToBuffer(stream);

    expect(buffer.byteLength).toBeGreaterThan(1_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
