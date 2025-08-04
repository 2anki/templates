import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

// Mock the Monaco Editor
jest.mock("react-monaco-editor", () => {
  return function MockMonacoEditor() {
    return <div data-testid="monaco-editor">Monaco Editor</div>;
  };
});

// Mock the fetch functions
jest.mock("./features/TemplatePage/helpers/fetchBaseType", () => {
  return jest.fn().mockResolvedValue({
    parent: "mock-parent",
    name: "Basic Template",
    storageKey: "n2a-basic",
    front: "<div>{{Text}}</div>",
    back: "<div>{{Answer}}</div>",
    styling: "body { font-family: Arial; }",
  });
});

jest.mock("./features/TemplatePage/helpers/saveTemplates", () => ({
  saveTemplates: jest.fn().mockResolvedValue({}),
}));

// Mock react-cookie
jest.mock("react-cookie", () => ({
  useCookies: () => [{}],
}));

test("renders app with main title", () => {
  render(<App />);
  expect(screen.getByText("Anki Template Editor")).toBeInTheDocument();
  expect(
    screen.getByText(
      "Create and customize beautiful Anki flashcard templates with live preview"
    )
  ).toBeInTheDocument();
});
