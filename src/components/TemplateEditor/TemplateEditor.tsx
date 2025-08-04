import React, { useCallback, useEffect, useState, useRef } from "react";
import MonacoEditor from "react-monaco-editor";
import { useCookies } from "react-cookie";
import * as _ from "lodash";

import { Card } from "../Card";
import { FormGroup, Label, Select } from "../Form";
import { Button } from "../Button";
import { saveTemplates } from "../../features/TemplatePage/helpers/saveTemplates";
import fetchBaseType from "../../features/TemplatePage/helpers/fetchBaseType";
import { TemplateFile } from "../../features/TemplatePage/model/TemplateFile";
import styles from "./TemplateEditor.module.css";

interface TemplateEditorProps {
  onTemplateChange?: (template: TemplateFile) => void;
}

type TabType = "front" | "back" | "styling";

const ONE_SECOND_MS = 1000;

const editorOptions = {
  minimap: { enabled: false },
  colorDecorators: false,
  lineNumbers: "on" as const,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  wordWrap: "on" as const,
  fontSize: 14,
  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
};

export function TemplateEditor({ onTemplateChange }: TemplateEditorProps) {
  const [token] = useCookies(["token"]);
  const [code, setCode] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("front");
  const [currentCardType, setCurrentCardType] = useState(
    localStorage.getItem("current-card-type") || "n2a-basic"
  );
  const [ready, setReady] = useState(false);
  const [files, setFiles] = useState<TemplateFile[]>([]);
  const filesRef = useRef<TemplateFile[]>([]);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );

  const getCurrentCardType = useCallback(
    () => files.find((x) => x.storageKey === currentCardType),
    [currentCardType, files]
  );

  const debounceSaveTemplate = _.debounce(async () => {
    if (token) {
      setSaveStatus("saving");
      try {
        await saveTemplates(filesRef.current);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (error) {
        console.error("Failed to save templates:", error);
        setSaveStatus("idle");
      }
    }
  }, ONE_SECOND_MS);

  // Update the ref whenever files state changes
  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => debounceSaveTemplate.cancel(), [debounceSaveTemplate]);

  const onChange = (newValue: string) => {
    const card = getCurrentCardType();
    if (card) {
      const updatedCard = { ...card };
      if (activeTab === "front") {
        updatedCard.front = newValue;
      } else if (activeTab === "back") {
        updatedCard.back = newValue;
      } else if (activeTab === "styling") {
        updatedCard.styling = newValue;
      }

      // Update the files array immutably
      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.storageKey === updatedCard.storageKey ? updatedCard : file
        )
      );

      localStorage.setItem(
        updatedCard.storageKey,
        JSON.stringify(updatedCard, null, 2)
      );

      if (token) {
        debounceSaveTemplate();
      }

      if (onTemplateChange) {
        onTemplateChange(updatedCard);
      }
    }
  };

  const fetchTemplates = useCallback(async () => {
    const templateTypes = ["n2a-basic", "n2a-input", "n2a-cloze"];
    const newFiles: TemplateFile[] = [];

    await Promise.all(
      templateTypes.map(async (name) => {
        const local = localStorage.getItem(name);
        if (local) {
          newFiles.push(JSON.parse(local));
        } else {
          try {
            const remote = await fetchBaseType(name);
            newFiles.push(remote);
            localStorage.setItem(name, JSON.stringify(remote, null, 2));
          } catch (error) {
            console.error(`Failed to fetch template ${name}:`, error);
          }
        }
      })
    );

    setFiles(newFiles.filter((file) => file && file.storageKey));
    setReady(true);
    const validFiles = newFiles.filter((file) => file && file.storageKey);
    if (validFiles.length > 0) {
      setCode(validFiles[0].front);
      if (onTemplateChange) {
        onTemplateChange(validFiles[0]);
      }
    }
  }, [onTemplateChange]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    const card = getCurrentCardType();
    if (card) {
      let newCode = "";
      if (activeTab === "front") {
        newCode = card.front;
      } else if (activeTab === "back") {
        newCode = card.back;
      } else if (activeTab === "styling") {
        newCode = card.styling;
      }
      setCode(newCode);

      if (onTemplateChange) {
        onTemplateChange(card);
      }
    }
  }, [activeTab, currentCardType, getCurrentCardType, onTemplateChange]);

  const handleTemplateTypeChange = (newType: string) => {
    setCurrentCardType(newType);
    setActiveTab("front");
    localStorage.setItem("current-card-type", newType);
  };

  const getLanguage = () => {
    return activeTab === "styling" ? "css" : "html";
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case "saving":
        return "Saving...";
      case "saved":
        return "Saved";
      default:
        return "All changes saved automatically";
    }
  };

  if (!ready) {
    return (
      <Card title="Template Editor">
        <p>Loading templates...</p>
      </Card>
    );
  }

  return (
    <Card
      title="Template Editor"
      subtitle="Edit your Anki card templates with live preview"
    >
      <div className={styles.templateSelect}>
        <FormGroup>
          <Label htmlFor="template-select">Template Type</Label>
          <Select
            id="template-select"
            value={currentCardType}
            onChange={(e) => handleTemplateTypeChange(e.target.value)}
          >
            {files
              .filter((file) => file && file.storageKey)
              .map((file) => (
                <option key={file.storageKey} value={file.storageKey}>
                  {file.name}
                </option>
              ))}
          </Select>
        </FormGroup>
      </div>

      <div className={styles.tabList} role="tablist">
        <button
          className={`${styles.tab} ${
            activeTab === "front" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("front")}
          role="tab"
          aria-selected={activeTab === "front"}
        >
          Front Template
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "back" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("back")}
          role="tab"
          aria-selected={activeTab === "back"}
        >
          Back Template
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "styling" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("styling")}
          role="tab"
          aria-selected={activeTab === "styling"}
        >
          Styling
        </button>
      </div>

      <div className={styles.editorContainer}>
        <MonacoEditor
          height="400px"
          language={getLanguage()}
          theme="vs-light"
          value={code}
          options={editorOptions}
          onChange={onChange}
        />
      </div>

      <div className={styles.actionBar}>
        <span className={styles.saveStatus}>{getSaveStatusText()}</span>
        <Button variant="secondary" size="small">
          Reset Template
        </Button>
      </div>
    </Card>
  );
}
