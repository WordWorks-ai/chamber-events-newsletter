import { describe, expect, it } from "vitest";

import { inferUploadedGraphicSize, validateUploadedGraphic } from "@/lib/utils/validation";

const tinyPng =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9sUcxL8AAAAASUVORK5CYII=";

describe("validateUploadedGraphic", () => {
  it("accepts valid small data URLs", () => {
    const result = validateUploadedGraphic({
      fileName: "symbol.png",
      mimeType: "image/png",
      dataUrl: tinyPng,
      sizeBytes: inferUploadedGraphicSize(tinyPng)
    });

    expect(result?.mimeType).toBe("image/png");
  });

  it("rejects mismatched MIME metadata", () => {
    expect(() =>
      validateUploadedGraphic({
        fileName: "symbol.jpg",
        mimeType: "image/jpeg",
        dataUrl: tinyPng,
        sizeBytes: inferUploadedGraphicSize(tinyPng)
      })
    ).toThrow();
  });
});
