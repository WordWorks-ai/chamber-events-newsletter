// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ChamberSelector } from "@/components/chamber-selector";
import { seededChambers } from "@/lib/db/demo-data";

describe("ChamberSelector", () => {
  it("renders chamber options and emits selection changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<ChamberSelector chambers={seededChambers.slice(0, 2)} onChange={onChange} value="" />);

    expect(screen.getByLabelText(/choose a chamber/i)).toBeInTheDocument();
    await user.selectOptions(screen.getByRole("combobox"), seededChambers[1].id);
    expect(onChange).toHaveBeenCalledWith(seededChambers[1].id);
  });
});
