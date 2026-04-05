import React, { useRef, useCallback, useMemo } from "react";
import Editor from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { AnkiNoteType, PreviewData } from "../../types/AnkiNoteType";
import TemplateApiService from "../../services/TemplateApiService";
import { validateTemplate } from "../../lib/validateTemplate";
import styles from "./MonacoEditorWrapper.module.css";

// Icons
const Icons = {
  Bold: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M15.6,10.79C16.57,10.11 17.25,9.02 17.25,8C17.25,5.74 15.5,4 13.25,4H7V18H14.04C16.14,18 17.75,16.3 17.75,14.21C17.75,12.69 16.89,11.39 15.6,10.79M10,6.5H13C13.83,6.5 14.5,7.17 14.5,8C14.5,8.83 13.83,9.5 13,9.5H10V6.5M14,15.5H10V12.5H14C14.83,12.5 15.5,13.17 15.5,14C15.5,14.83 14.83,15.5 14,15.5Z" />
    </svg>
  ),

  Italic: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M10,4V7H12.21L8.79,15H6V18H14V15H11.79L15.21,7H18V4H10Z" />
    </svg>
  ),

  Image: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />
    </svg>
  ),

  Eye: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
    </svg>
  ),

  Sparkles: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12,2A2,2 0 0,1 14,4V8A2,2 0 0,1 12,10A2,2 0 0,1 10,8V4A2,2 0 0,1 12,2M21,11A1,1 0 0,1 22,12A1,1 0 0,1 21,13H17A1,1 0 0,1 16,12A1,1 0 0,1 17,11H21M19.5,19.5A1,1 0 0,1 18.5,20.5A1,1 0 0,1 17.5,19.5L15.91,17.91A1,1 0 0,1 15.91,16.5A1,1 0 0,1 17.33,16.5L19.5,19.5M12,22A2,2 0 0,1 10,20V16A2,2 0 0,1 12,14A2,2 0 0,1 14,16V20A2,2 0 0,1 12,22M6.5,19.5A1,1 0 0,1 5.5,18.5A1,1 0 0,1 6.5,17.5L8.09,15.91A1,1 0 0,1 9.5,15.91A1,1 0 0,1 9.5,17.33L6.5,19.5M3,13A1,1 0 0,1 2,12A1,1 0 0,1 3,11H7A1,1 0 0,1 8,12A1,1 0 0,1 7,13H3M4.5,4.5A1,1 0 0,1 5.5,3.5A1,1 0 0,1 6.5,4.5L8.09,6.09A1,1 0 0,1 8.09,7.5A1,1 0 0,1 6.67,7.5L4.5,4.5Z" />
    </svg>
  ),

  SplitView: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M3,3H11V5H3V3M13,3H21V5H13V3M3,7H11V9H3V7M13,7H21V9H13V7M3,11H11V13H3V11M13,11H21V13H13V11M3,15H11V17H3V15M13,15H21V17H13V15M3,19H11V21H3V19M13,19H21V21H13V19Z" />
    </svg>
  ),

  Close: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
    </svg>
  ),
};

interface MonacoEditorWrapperProps {
  noteType: AnkiNoteType;
  selectedCardIndex: number;
  selectedTemplate: "qfmt" | "afmt" | "css";
  previewData: PreviewData;
  onNoteTypeChange: (noteType: AnkiNoteType) => void;
  onPreviewDataChange: (previewData: PreviewData) => void;
}

const MonacoEditorWrapper: React.FC<MonacoEditorWrapperProps> = ({
  noteType,
  selectedCardIndex,
  selectedTemplate,
  previewData,
  onNoteTypeChange,
  onPreviewDataChange,
}) => {
  const [showSplitView] = [true];

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
    if (selectedTemplate === "css") return [];
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

  const insertFormatting = (format: string) => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    const selection = editor.getSelection();
    const model = editor.getModel();

    if (!selection || !model) return;

    let insertText = "";

    switch (format) {
      case "bold":
        insertText = "**bold text**";
        break;
      case "italic":
        insertText = "*italic text*";
        break;
      case "image":
        insertText =
          '<img src="{{Image}}" alt="Image" style="max-width: 100%;" />';
        break;
      default:
        return;
    }

    editor.executeEdits("", [
      {
        range: selection,
        text: insertText,
      },
    ]);
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
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarGroup}>
          <button
            className={styles.toolbarButton}
            onClick={() => insertFormatting("bold")}
            title="Bold"
          >
            <Icons.Bold className={styles.buttonIcon} />
          </button>

          <button
            className={styles.toolbarButton}
            onClick={() => insertFormatting("italic")}
            title="Italic"
          >
            <Icons.Italic className={styles.buttonIcon} />
          </button>

          <button
            className={styles.toolbarButton}
            onClick={() => insertFormatting("image")}
            title="Insert Image"
          >
            <Icons.Image className={styles.buttonIcon} />
          </button>
        </div>

        <div className={styles.toolbarSeparator} />
      </div>

      {/* Editor and Preview */}
      <div className={styles.editorWrapper}>
        {showSplitView ? (
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
                Preview -{" "}
                {selectedTemplate === "css"
                  ? "Styling"
                  : selectedTemplate === "qfmt"
                  ? "Front"
                  : "Back"}
              </div>
              <div className={styles.previewContent}>
                <div className={styles.previewCard}>
                  <iframe
                    className={styles.previewIframe}
                    srcDoc={generatePreviewHtml()}
                    title="Template Preview"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Editor
            height="100%"
            language={getLanguage()}
            value={getCurrentContent()}
            onChange={(value) => updateContent(value || "")}
            onMount={handleEditorDidMount}
            options={editorOptions}
            className={styles.monacoEditor}
          />
        )}
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
      </div>
    </div>
  );
};

export default MonacoEditorWrapper;
