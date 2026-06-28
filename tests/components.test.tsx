import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KpiCards } from "@/components/KpiCards";

describe("KpiCards", () => {
  it("renders the streak and an em dash for missing weight", () => {
    render(
      <KpiCards workoutsThisWeek={3} currentStreak={5} latestWeight={null} goalsOnTrack={1} goalsTotal={2} />
    );
    expect(screen.getByText("5 d")).toBeTruthy();
    expect(screen.getByText("—")).toBeTruthy();
    expect(screen.getByText("1/2")).toBeTruthy();
  });
});
