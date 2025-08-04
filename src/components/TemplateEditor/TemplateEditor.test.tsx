import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TemplateEditor } from "../TemplateEditor";

// Mock the Monaco Editor
jest.mock("react-monaco-editor", () => {
  return function MockMonacoEditor({ value, onChange }: any) {
    return (
      <textarea
        data-testid="monaco-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  };
});

// Mock the fetch functions
jest.mock("../../features/TemplatePage/helpers/fetchBaseType", () => {
  return jest.fn().mockImplementation((name: string) => {
    const templates: Record<string, any> = {
      "n2a-basic": {
        parent: "Basic",
        name: "Basic Template",
        storageKey: "n2a-basic",
        front: "<div>{{Text}}</div>",
        back: "<div>{{Answer}}</div>",
        styling: "body { font-family: Arial; }",
      },
      "n2a-input": {
        parent: "Input",
        name: "Input Template",
        storageKey: "n2a-input",
        front: "<div>{{Text}}</div>",
        back: "<div>{{Answer}}</div>",
        styling: "body { font-family: Arial; }",
      },
      "n2a-cloze": {
        parent: "Cloze",
        name: "Cloze Template",
        storageKey: "n2a-cloze",
        front: "<div>{{cloze:Text}}</div>",
        back: "<div>{{cloze:Text}}</div>",
        styling: "body { font-family: Arial; }",
      },
    };
    return Promise.resolve(templates[name] || templates["n2a-basic"]);
  });
});

jest.mock("../../features/TemplatePage/helpers/saveTemplates", () => ({
  saveTemplates: jest.fn().mockResolvedValue({}),
}));

// Mock react-cookie
jest.mock("react-cookie", () => ({
  useCookies: () => [{ token: "mock-token" }],
}));

describe("TemplateEditor", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("renders template editor with loading state", () => {
    render(<TemplateEditor />);
    expect(screen.getByText("Loading templates...")).toBeInTheDocument();
  });

  test("renders tabs for front, back, and styling", async () => {
    render(<TemplateEditor />);

    // Wait for loading to complete
    await screen.findByText("Front Template");

    expect(screen.getByText("Front Template")).toBeInTheDocument();
    expect(screen.getByText("Back Template")).toBeInTheDocument();
    expect(screen.getByText("Styling")).toBeInTheDocument();
  });

  test("switches between tabs correctly", async () => {
    render(<TemplateEditor />);

    // Wait for loading to complete
    await screen.findByText("Front Template");

    const backTab = screen.getByText("Back Template");
    fireEvent.click(backTab);

    expect(backTab).toHaveAttribute("aria-selected", "true");
  });

  test("calls onTemplateChange when template updates", async () => {
    const mockOnTemplateChange = jest.fn();

    // Set up initial template data in localStorage to avoid async fetch issues
    const mockTemplate = {
      parent: "Basic",
      name: "Basic Template",
      storageKey: "n2a-basic",
      front: "<div>{{Text}}</div>",
      back: "<div>{{Answer}}</div>",
      styling: "body { font-family: Arial; }",
    };

    localStorage.setItem("n2a-basic", JSON.stringify(mockTemplate));
    localStorage.setItem(
      "n2a-input",
      JSON.stringify({
        ...mockTemplate,
        storageKey: "n2a-input",
        name: "Input Template",
      })
    );
    localStorage.setItem(
      "n2a-cloze",
      JSON.stringify({
        ...mockTemplate,
        storageKey: "n2a-cloze",
        name: "Cloze Template",
      })
    );

    render(<TemplateEditor onTemplateChange={mockOnTemplateChange} />);

    // Wait for the component to load and render
    await waitFor(() => {
      expect(screen.getByText("Front Template")).toBeInTheDocument();
    });

    // Wait for the editor to be ready
    await waitFor(() => {
      const editor = screen.getByTestId("monaco-editor");
      expect(editor).toBeInTheDocument();
    });

    // Trigger a change by editing the template content
    const editor = screen.getByTestId("monaco-editor");
    fireEvent.change(editor, { target: { value: "<div>Test change</div>" } });

    // Verify that onTemplateChange was called
    await waitFor(() => {
      expect(mockOnTemplateChange).toHaveBeenCalled();
    });
  });
});
