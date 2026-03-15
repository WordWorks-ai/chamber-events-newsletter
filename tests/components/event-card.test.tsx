// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EventCard } from "@/components/event-card";
import { makePreviewResponse } from "@/tests/helpers";

describe("EventCard", () => {
  it("renders a single event summary", () => {
    const event = makePreviewResponse().viewModel.groupedEvents[0]!.events[0]!;
    render(<EventCard event={event} />);

    expect(screen.getByText(event.title)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /register \/ learn more/i })).toHaveAttribute(
      "href",
      event.registrationUrl
    );
  });
});
