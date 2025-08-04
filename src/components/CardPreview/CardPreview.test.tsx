import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CardPreview } from "./CardPreview";
import { TemplateFile } from "../../features/TemplatePage/model/TemplateFile";

const mockTemplate: TemplateFile = {
  parent: "test-parent",
  name: "Test Template",
  storageKey: "test-template",
  front: "<div>{{Text}}</div>",
  back: "<div>{{Answer}}</div>",
  styling: "body { color: blue; }",
};

describe("CardPreview", () => {
  test("renders empty state when no template provided", () => {
    render(<CardPreview />);
    expect(
      screen.getByText("Select a template to see the preview")
    ).toBeInTheDocument();
  });

  test("renders preview with template", () => {
    render(<CardPreview template={mockTemplate} />);
    expect(screen.getByText("Card Preview")).toBeInTheDocument();
    expect(screen.getByText("Front")).toBeInTheDocument();
    expect(screen.getByText("Back")).toBeInTheDocument();
  });

  test("switches between front and back preview", () => {
    render(<CardPreview template={mockTemplate} />);

    const frontTab = screen.getByText("Front");
    const backTab = screen.getByText("Back");

    expect(frontTab).toHaveClass("active");

    fireEvent.click(backTab);
    expect(backTab).toHaveClass("active");
    expect(frontTab).not.toHaveClass("active");
  });

  test("displays sample data information", () => {
    render(<CardPreview template={mockTemplate} />);
    expect(screen.getByText("Sample Data Used in Preview")).toBeInTheDocument();
    expect(screen.getByText("Text:")).toBeInTheDocument();
    expect(screen.getByText("Answer:")).toBeInTheDocument();
  });
});
