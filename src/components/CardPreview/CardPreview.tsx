import React, { useState, useEffect, useRef } from "react";
import { Card } from "../Card";
import { TemplateFile } from "../../features/TemplatePage/model/TemplateFile";
import styles from "./CardPreview.module.css";

interface CardPreviewProps {
  template?: TemplateFile;
}

type PreviewSide = "front" | "back";

// Sample data for preview
const sampleData = {
  Text: "What is the capital of France?",
  Extra: "France is a country in Western Europe",
  Answer: "Paris",
  Field1: "Sample field 1 content",
  Field2: "Sample field 2 content",
  "cloze:Text": "The capital of {{c1::France}} is {{c2::Paris}}",
};

export function CardPreview({ template }: CardPreviewProps) {
  const [previewSide, setPreviewSide] = useState<PreviewSide>("front");
  const [renderedHtml, setRenderedHtml] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const processTemplate = (templateHtml: string, styling: string) => {
    if (!templateHtml) return "";

    // Replace Anki field placeholders with sample data
    let processed = templateHtml;

    // Replace {{Field}} syntax
    Object.entries(sampleData).forEach(([field, value]) => {
      const regex = new RegExp(`{{${field}}}`, "g");
      processed = processed.replace(regex, value);
    });

    // Handle cloze deletions for preview
    processed = processed.replace(
      /{{c\d+::(.*?)}}/g,
      '<span style="background: #ffeb3b; padding: 2px 4px; border-radius: 3px;">$1</span>'
    );

    // Wrap in a complete HTML document with styling
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: var(--font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
              margin: 0;
              padding: 16px;
              background: white;
              color: #333;
              line-height: 1.5;
            }
            ${styling || ""}
          </style>
        </head>
        <body>
          ${processed}
        </body>
      </html>
    `;
  };

  useEffect(() => {
    if (!template) {
      setRenderedHtml("");
      return;
    }

    const templateHtml =
      previewSide === "front" ? template.front : template.back;
    const processed = processTemplate(templateHtml, template.styling);
    setRenderedHtml(processed);
  }, [template, previewSide]);

  useEffect(() => {
    if (iframeRef.current && renderedHtml) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(renderedHtml);
        doc.close();
      }
    }
  }, [renderedHtml]);

  if (!template) {
    return (
      <Card title="Card Preview" subtitle="Preview your Anki cards as you edit">
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>📋</div>
          <p>Select a template to see the preview</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Card Preview" subtitle="Preview your Anki cards as you edit">
      <div className={styles.previewContainer}>
        <div className={styles.previewHeader}>
          <button
            className={`${styles.previewTab} ${
              previewSide === "front" ? styles.active : ""
            }`}
            onClick={() => setPreviewSide("front")}
          >
            Front
          </button>
          <button
            className={`${styles.previewTab} ${
              previewSide === "back" ? styles.active : ""
            }`}
            onClick={() => setPreviewSide("back")}
          >
            Back
          </button>
        </div>

        <div className={styles.previewContent}>
          {renderedHtml ? (
            <iframe
              ref={iframeRef}
              className={styles.previewFrame}
              title={`Card ${previewSide} preview`}
              sandbox="allow-same-origin"
            />
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>⚠️</div>
              <p>No template content to preview</p>
            </div>
          )}
        </div>
      </div>

      <div className={styles.sampleData}>
        <h4 className={styles.sampleDataTitle}>Sample Data Used in Preview</h4>
        {Object.entries(sampleData).map(([field, value]) => (
          <div key={field} className={styles.sampleField}>
            <span className={styles.sampleFieldName}>{field}:</span>
            <span className={styles.sampleFieldValue}>
              {value.length > 30 ? `${value.substring(0, 30)}...` : value}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
