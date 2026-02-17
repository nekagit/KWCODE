/**
 * Unit tests for run-helpers used by Implement All and terminal slot UI.
 */
import { describe, it, expect } from "vitest";
import {
  isImplementAllRun,
  parseTicketNumberFromRunLabel,
  formatElapsed,
} from "../run-helpers";

describe("isImplementAllRun", () => {
  it("returns true for Implement All label", () => {
    expect(isImplementAllRun({ label: "Implement All" })).toBe(true);
  });

  it("returns true for Implement All (Terminal N)", () => {
    expect(isImplementAllRun({ label: "Implement All (Terminal 1)" })).toBe(true);
    expect(isImplementAllRun({ label: "Implement All (Terminal 2)" })).toBe(true);
  });

  it("returns true for Ticket #N labels", () => {
    expect(isImplementAllRun({ label: "Ticket #1: implement further" })).toBe(true);
    expect(isImplementAllRun({ label: "Ticket #42: Some title" })).toBe(true);
  });

  it("returns true for Analyze and Debug labels", () => {
    expect(isImplementAllRun({ label: "Analyze: my-project" })).toBe(true);
    expect(isImplementAllRun({ label: "Debug: fix bug" })).toBe(true);
  });

  it("returns false for other labels", () => {
    expect(isImplementAllRun({ label: "Setup Prompt: design" })).toBe(false);
    expect(isImplementAllRun({ label: "Manual run" })).toBe(false);
  });
});

describe("parseTicketNumberFromRunLabel", () => {
  it("parses ticket number from Ticket #N: title", () => {
    expect(parseTicketNumberFromRunLabel("Ticket #1: implement further")).toBe(1);
    expect(parseTicketNumberFromRunLabel("Ticket #42: Some title")).toBe(42);
  });

  it("returns null for non-ticket labels", () => {
    expect(parseTicketNumberFromRunLabel("Implement All")).toBe(null);
    expect(parseTicketNumberFromRunLabel(undefined)).toBe(null);
    expect(parseTicketNumberFromRunLabel("")).toBe(null);
  });
});

describe("formatElapsed", () => {
  it("formats seconds under 60 as Xs", () => {
    expect(formatElapsed(0)).toBe("0s");
    expect(formatElapsed(45)).toBe("45s");
  });

  it("formats 60+ seconds as m:ss", () => {
    expect(formatElapsed(60)).toBe("1:00");
    expect(formatElapsed(90)).toBe("1:30");
    expect(formatElapsed(125)).toBe("2:05");
  });
});
