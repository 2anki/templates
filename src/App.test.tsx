import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import App from "./App";

// Mock Monaco Editor to avoid import issues in tests
vi.mock("@monaco-editor/react", () => ({
  default: () => <div data-testid="monaco-editor">Monaco Editor</div>,
}));

vi.mock("monaco-editor", () => ({}));

test("renders app component", () => {
  render(<App />);
  // Just check that the app renders without crashing
  expect(document.body).toBeInTheDocument();
});

test("app component structure", () => {
  const { container } = render(<App />);
  expect(container.firstChild).toBeInTheDocument();
});
