// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { UploadGraphic } from "@/components/upload-graphic";

class MockFileReader {
  result: string | ArrayBuffer | null = null;
  error: DOMException | null = null;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;

  readAsDataURL(file: File) {
    this.result = `data:${file.type};base64,PHN2Zy8+`;
    this.onload?.();
  }
}

beforeEach(() => {
  vi.stubGlobal("FileReader", MockFileReader);
});

describe("UploadGraphic", () => {
  it("accepts a valid upload and allows removing it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<UploadGraphic onChange={onChange} value={null} />);

    const input = screen.getByLabelText(/upload a small graphic/i);
    const file = new File(["<svg/>"], "symbol.svg", { type: "image/svg+xml" });
    await user.upload(input, file);

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    render(
      <UploadGraphic
        onChange={onChange}
        value={{
          fileName: "symbol.svg",
          mimeType: "image/svg+xml",
          dataUrl: "data:image/svg+xml;base64,PHN2Zy8+",
          sizeBytes: 64
        }}
      />
    );

    await user.click(screen.getByRole("button", { name: /remove/i }));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
