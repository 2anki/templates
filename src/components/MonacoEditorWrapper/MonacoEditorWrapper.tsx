import React, { useRef, useCallback, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { AnkiNoteType, PreviewData } from "../../types/AnkiNoteType";
import TemplateApiService from "../../services/TemplateApiService";
import { validateTemplate, validateCss } from "../../lib/validateTemplate";
import styles from "./MonacoEditorWrapper.module.css";

interface MonacoEditorWrapperProps {
  noteType: AnkiNoteType;
  selectedCardIndex: number;
  selectedTemplate: "qfmt" | "afmt" | "css";
  previewData: PreviewData;
  defaultCss: string;
  onNoteTypeChange: (noteType: AnkiNoteType) => void;
  onPreviewDataChange: (previewData: PreviewData) => void;
}

const MonacoEditorWrapper: React.FC<MonacoEditorWrapperProps> = ({
  noteType,
  selectedCardIndex,
  selectedTemplate,
  previewData,
  defaultCss,
  onNoteTypeChange,
  onPreviewDataChange,
}) => {
  const [isMobilePreview, setIsMobilePreview] = useState(false);

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const apiService = TemplateApiService.getInstance();

  const getCurrentContent = useCallback(() => {
    const cardType = noteType.tmpls[selectedCardIndex];
    if (!cardType) return "";

    switch (selectedTemplate) {
      case "qfmt":
        return cardType.qfmt;
      case "afmt":
        return cardType.afmt;
      case "css":
        return noteType.css;
      default:
        return "";
    }
  }, [noteType, selectedCardIndex, selectedTemplate]);

  const getLanguage = useCallback(() => {
    return selectedTemplate === "css" ? "css" : "html";
  }, [selectedTemplate]);

  const updateContent = useCallback(
    (value: string) => {
      const updatedNoteType = { ...noteType };

      if (selectedTemplate === "css") {
        updatedNoteType.css = value;
      } else {
        const cardType = { ...updatedNoteType.tmpls[selectedCardIndex] };
        if (selectedTemplate === "qfmt") {
          cardType.qfmt = value;
        } else if (selectedTemplate === "afmt") {
          cardType.afmt = value;
        }
        updatedNoteType.tmpls[selectedCardIndex] = cardType;
      }

      onNoteTypeChange(updatedNoteType);
    },
    [noteType, selectedCardIndex, selectedTemplate, onNoteTypeChange]
  );

  const validationErrors = useMemo(() => {
    if (selectedTemplate === "css") return validateCss(getCurrentContent());
    const fieldNames = noteType.flds.map((f) => f.name);
    return validateTemplate(getCurrentContent(), fieldNames);
  }, [noteType, selectedCardIndex, selectedTemplate, getCurrentContent]);

  const handleEditorDidMount = (
    editor: monaco.editor.IStandaloneCodeEditor
  ) => {
    editorRef.current = editor;

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, () => {});

    editor.onDidChangeModelContent(() => {});
  };

  const generatePreviewHtml = () => {
    return apiService.generatePreview(
      noteType,
      selectedCardIndex,
      previewData,
      selectedTemplate === "afmt"
    );
  };

  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    lineHeight: 22,
    padding: { top: 16, bottom: 16 },
    scrollBeyondLastLine: false,
    wordWrap: "on" as const,
    theme: "vs-light",
    automaticLayout: true,
    suggestOnTriggerCharacters: false,
    quickSuggestions: false,
    parameterHints: { enabled: false },
    hover: { enabled: false },
    links: false,
    colorDecorators: false,
    selectionHighlight: false,
  };

  return (
    <div className={styles.editorContainer}>
      <div className={styles.editorWrapper}>
        <div className={styles.splitView}>
          <div className={styles.editorPane}>
            <Editor
              height="100%"
              language={getLanguage()}
              value={getCurrentContent()}
              onChange={(value) => updateContent(value || "")}
              onMount={handleEditorDidMount}
              options={editorOptions}
              className={styles.monacoEditor}
            />
          </div>
          <div className={styles.previewPane}>
            <div className={styles.previewHeader}>
              <span>
                Preview -{" "}
                {selectedTemplate === "css"
                  ? "Styling"
                  : selectedTemplate === "qfmt"
                  ? "Front"
                  : "Back"}
              </span>
              <button
                className={`${styles.mobileToggleButton}${
                  isMobilePreview ? ` ${styles.mobileToggleActive}` : ""
                }`}
                onClick={() => setIsMobilePreview(!isMobilePreview)}
                title="Toggle mobile preview"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="14"
                  height="14"
                  aria-hidden="true"
                >
                  <path d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21A2,2 0 0,0 7,23H17A2,2 0 0,0 19,21V3C19,1.89 18.1,1 17,1Z" />
                </svg>
              </button>
            </div>
            <div className={styles.previewContent}>
              <div
                className={
                  isMobilePreview
                    ? styles.previewCardMobile
                    : styles.previewCard
                }
              >
                <iframe
                  className={styles.previewIframe}
                  srcDoc={generatePreviewHtml()}
                  title="Template Preview"
                />
              </div>
              {selectedTemplate !== "css" && (
                <div className={styles.previewSecondary}>
                  <div className={styles.previewSecondaryLabel}>
                    {selectedTemplate === "qfmt" ? "Back" : "Front"}
                  </div>
                  <div className={styles.previewCardSmall}>
                    <iframe
                      className={styles.previewIframe}
                      srcDoc={apiService.generatePreview(
                        noteType,
                        selectedCardIndex,
                        previewData,
                        selectedTemplate === "qfmt"
                      )}
                      title="Secondary Preview"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className={styles.validationErrors}>
          {validationErrors.map((error, i) => (
            <div key={i} className={styles.validationError}>
              <span className={styles.validationErrorLine}>
                Line {error.line}:
              </span>
              {error.message}
            </div>
          ))}
        </div>
      )}

      {/* Status Bar */}
      <div className={styles.statusBar}>
        <div className={styles.statusLeft}>
          <span>
            {getLanguage().toUpperCase()} • Line {1}, Col {1}
          </span>
          <span>
            {noteType.flds.length} fields • {noteType.tmpls.length} cards
          </span>
        </div>
        {selectedTemplate === "css" && (
          <div className={styles.statusRight}>
            <button
              className={styles.resetCssButton}
              onClick={() => updateContent(defaultCss)}
              title="Reset CSS to default"
            >
              Reset CSS
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonacoEditorWrapper;
