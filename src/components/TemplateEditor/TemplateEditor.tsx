import React, { useState, useEffect, useCallback } from "react";
import {
  TemplateProject,
  AnkiNoteType,
  PreviewData,
} from "../../types/AnkiNoteType";
import TemplateApiService from "../../services/TemplateApiService";
import Sidebar from "../Sidebar/Sidebar";
import MonacoEditorWrapper from "../MonacoEditorWrapper/MonacoEditorWrapper";
import styles from "./TemplateEditor.module.css";

// Icons
const Icons = {
  Download: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
    </svg>
  ),

  Share: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L15.96,7.19C16.5,7.69 17.21,8 18,8A3,3 0 0,0 21,5A3,3 0 0,0 18,2A3,3 0 0,0 15,5C15,5.24 15.04,5.47 15.09,5.7L8.04,9.81C7.5,9.31 6.79,9 6,9A3,3 0 0,0 3,12A3,3 0 0,0 6,15C6.79,15 7.5,14.69 8.04,14.19L15.16,18.34C15.11,18.55 15.08,18.77 15.08,19C15.08,20.61 16.39,21.91 18,21.91C19.61,21.91 20.92,20.61 20.92,19A2.92,2.92 0 0,0 18,16.08Z" />
    </svg>
  ),

  Plus: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
    </svg>
  ),

  Template: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
    </svg>
  ),

  Save: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z" />
    </svg>
  ),
};

const TemplateEditor: React.FC = () => {
  const [userTemplates, setUserTemplates] = useState<TemplateProject[]>([]);
  const [sharedTemplates, setSharedTemplates] = useState<TemplateProject[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateProject | null>(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [selectedTemplateType, setSelectedTemplateType] = useState<
    "qfmt" | "afmt" | "css"
  >("qfmt");
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempDescription, setTempDescription] = useState("");

  const apiService = TemplateApiService.getInstance();

  // Load templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoading(true);
      try {
        const [userTemplatesData, sharedTemplatesData] = await Promise.all([
          apiService.getUserTemplates(),
          apiService.getSharedTemplates(),
        ]);

        setUserTemplates(userTemplatesData);
        setSharedTemplates(sharedTemplatesData);

        // Select first template if available
        if (userTemplatesData.length > 0) {
          setSelectedTemplate(userTemplatesData[0]);
        } else if (sharedTemplatesData.length > 0) {
          setSelectedTemplate(sharedTemplatesData[0]);
        }
      } catch (error) {
        console.error("Failed to load templates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, [apiService]);

  // Auto-save when template changes
  useEffect(() => {
    if (selectedTemplate && selectedTemplate.id && !selectedTemplate.isShared) {
      const saveTemplate = async () => {
        try {
          await apiService.saveTemplate(selectedTemplate);
          setLastSaved(new Date());
        } catch (error) {
          console.error("Failed to save template:", error);
        }
      };

      const timeoutId = setTimeout(saveTemplate, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [selectedTemplate, apiService]);

  const createNewTemplate = useCallback(() => {
    const newTemplate: TemplateProject = {
      id: `template-${Date.now()}`,
      name: "New Template",
      description: "A new Anki template",
      noteType: apiService.getBasicNoteType(),
      previewData: {
        Front: "Sample front content",
        Back: "Sample back content",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isShared: false,
      tags: [],
    };

    setUserTemplates((prev) => [...prev, newTemplate]);
    setSelectedTemplate(newTemplate);
    setSelectedCardIndex(0);
    setSelectedTemplateType("qfmt");
  }, [apiService]);

  const handleSelectTemplate = useCallback((template: TemplateProject) => {
    setSelectedTemplate(template);
    setSelectedCardIndex(0);
    setSelectedTemplateType("qfmt");
  }, []);

  const handleDeleteTemplate = useCallback(
    async (templateId: string) => {
      try {
        await apiService.deleteTemplate(templateId);
        setUserTemplates((prev) => prev.filter((t) => t.id !== templateId));

        if (selectedTemplate?.id === templateId) {
          const remaining = userTemplates.filter((t) => t.id !== templateId);
          setSelectedTemplate(remaining.length > 0 ? remaining[0] : null);
        }
      } catch (error) {
        console.error("Failed to delete template:", error);
      }
    },
    [apiService, selectedTemplate, userTemplates]
  );

  const handleNoteTypeChange = useCallback(
    (noteType: AnkiNoteType) => {
      if (!selectedTemplate) return;

      const updatedTemplate = {
        ...selectedTemplate,
        noteType,
        updatedAt: new Date().toISOString(),
      };

      setSelectedTemplate(updatedTemplate);

      // Update the template in the list
      setUserTemplates((prev) =>
        prev.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t))
      );
    },
    [selectedTemplate]
  );

  const handlePreviewDataChange = useCallback(
    (previewData: PreviewData) => {
      if (!selectedTemplate) return;

      const updatedTemplate = {
        ...selectedTemplate,
        previewData,
        updatedAt: new Date().toISOString(),
      };

      setSelectedTemplate(updatedTemplate);

      // Update the template in the list
      setUserTemplates((prev) =>
        prev.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t))
      );
    },
    [selectedTemplate]
  );

  const handleTemplateNameChange = useCallback(
    (newName: string) => {
      if (!selectedTemplate || selectedTemplate.isShared) return;

      const updatedTemplate = {
        ...selectedTemplate,
        name: newName.trim() || "Untitled Template",
        updatedAt: new Date().toISOString(),
      };

      setSelectedTemplate(updatedTemplate);

      // Update the template in the list
      setUserTemplates((prev) =>
        prev.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t))
      );
    },
    [selectedTemplate]
  );

  const startEditingName = useCallback(() => {
    if (selectedTemplate && !selectedTemplate.isShared) {
      setIsEditingName(true);
      setTempName(selectedTemplate.name);
    }
  }, [selectedTemplate]);

  const saveTemplateName = useCallback(() => {
    if (tempName.trim()) {
      handleTemplateNameChange(tempName);
    }
    setIsEditingName(false);
    setTempName("");
  }, [tempName, handleTemplateNameChange]);

  const cancelEditingName = useCallback(() => {
    setIsEditingName(false);
    setTempName("");
  }, []);

  const handleTemplateDescriptionChange = useCallback(
    (newDescription: string) => {
      if (!selectedTemplate || selectedTemplate.isShared) return;

      const updatedTemplate = {
        ...selectedTemplate,
        description: newDescription.trim() || "No description",
        updatedAt: new Date().toISOString(),
      };

      setSelectedTemplate(updatedTemplate);

      // Update the template in the list
      setUserTemplates((prev) =>
        prev.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t))
      );
    },
    [selectedTemplate]
  );

  const startEditingDescription = useCallback(() => {
    if (selectedTemplate && !selectedTemplate.isShared) {
      setIsEditingDescription(true);
      setTempDescription(selectedTemplate.description);
    }
  }, [selectedTemplate]);

  const saveTemplateDescription = useCallback(() => {
    handleTemplateDescriptionChange(tempDescription);
    setIsEditingDescription(false);
    setTempDescription("");
  }, [tempDescription, handleTemplateDescriptionChange]);

  const cancelEditingDescription = useCallback(() => {
    setIsEditingDescription(false);
    setTempDescription("");
  }, []);

  const [shareError, setShareError] = useState<string | null>(null);

  const handleShareTemplate = useCallback(async () => {
    if (!selectedTemplate || selectedTemplate.isShared) return;

    try {
      setShareError(null);
      await apiService.publishTemplate(selectedTemplate);
      const updated = { ...selectedTemplate, isShared: true };
      setSelectedTemplate(updated);
      setUserTemplates((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
    } catch (error) {
      setShareError(
        error instanceof Error ? error.message : "Failed to share template"
      );
    }
  }, [selectedTemplate, apiService]);

  const handleExportTemplate = useCallback(async () => {
    if (!selectedTemplate) return;

    try {
      const apkgBuffer = await apiService.exportTemplate(selectedTemplate.id);

      const blob = new Blob([apkgBuffer], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedTemplate.name}.apkg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export template:", error);
    }
  }, [selectedTemplate, apiService]);

  if (isLoading) {
    return (
      <div className={styles.app}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          Loading templates...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <Sidebar
        userTemplates={userTemplates}
        sharedTemplates={sharedTemplates}
        selectedTemplateId={selectedTemplate?.id || null}
        onSelectTemplate={handleSelectTemplate}
        onCreateNew={createNewTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        onOpenMarketplace={async () => {
          const fresh = await apiService.getSharedTemplates();
          setSharedTemplates(fresh);
        }}
      />

      <div className={styles.mainContent}>
        {selectedTemplate ? (
          <>
            {/* Header */}
            <div className={styles.contentHeader}>
              <div className={styles.headerLeft}>
                <div>
                  {isEditingName ? (
                    <div className={styles.editingNameContainer}>
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onBlur={saveTemplateName}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            saveTemplateName();
                          } else if (e.key === "Escape") {
                            cancelEditingName();
                          }
                        }}
                        className={styles.nameInput}
                        autoFocus
                        placeholder="Template name"
                      />
                    </div>
                  ) : (
                    <h1
                      className={`${styles.projectTitle} ${
                        !selectedTemplate.isShared ? styles.editable : ""
                      }`}
                      onClick={startEditingName}
                      title={
                        !selectedTemplate.isShared
                          ? "Click to edit template name"
                          : "Template name (read-only)"
                      }
                    >
                      {selectedTemplate.name}
                    </h1>
                  )}
                  {isEditingDescription ? (
                    <div className={styles.editingDescriptionContainer}>
                      <textarea
                        value={tempDescription}
                        onChange={(e) => setTempDescription(e.target.value)}
                        onBlur={saveTemplateDescription}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.ctrlKey) {
                            saveTemplateDescription();
                          } else if (e.key === "Escape") {
                            cancelEditingDescription();
                          }
                        }}
                        className={styles.descriptionInput}
                        autoFocus
                        placeholder="Template description"
                        rows={2}
                      />
                      <div className={styles.editHint}>
                        Ctrl+Enter to save, Escape to cancel
                      </div>
                    </div>
                  ) : (
                    <p
                      className={`${styles.projectDescription} ${
                        !selectedTemplate.isShared ? styles.editable : ""
                      }`}
                      onClick={startEditingDescription}
                      title={
                        !selectedTemplate.isShared
                          ? "Click to edit template description"
                          : "Template description (read-only)"
                      }
                    >
                      {selectedTemplate.description}
                      {lastSaved && (
                        <span> • Saved {lastSaved.toLocaleTimeString()}</span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              <div className={styles.headerActions}>
                <button
                  className={styles.actionButton}
                  onClick={handleExportTemplate}
                  disabled={selectedTemplate.isShared}
                >
                  <Icons.Download className={styles.actionIcon} />
                  Export for Anki
                </button>

                <button
                  className={`${styles.actionButton} ${styles.primary}`}
                  disabled={selectedTemplate.isShared}
                  onClick={handleShareTemplate}
                  title={
                    selectedTemplate.isShared
                      ? "Already shared"
                      : "Share to marketplace"
                  }
                >
                  <Icons.Share className={styles.actionIcon} />
                  {selectedTemplate.isShared ? "Shared" : "Share Template"}
                </button>
                {shareError && (
                  <span className={styles.shareError}>{shareError}</span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className={styles.contentBody}>
              {/* Field Editor */}
              <div className={styles.fieldEditor}>
                <div className={styles.fieldEditorHeader}>
                  <h2 className={styles.fieldEditorTitle}>
                    Fields & Preview Data
                  </h2>
                  <button
                    className={styles.actionButton}
                    disabled={selectedTemplate.isShared}
                  >
                    <Icons.Plus className={styles.actionIcon} />
                    Add Field
                  </button>
                </div>

                <div className={styles.fieldsList}>
                  {selectedTemplate.noteType.flds.map((field, index) => (
                    <div key={index} className={styles.fieldItem}>
                      <div className={styles.fieldItemHeader}>
                        <span className={styles.fieldName}>{field.name}</span>
                        <span className={styles.fieldMeta}>
                          {field.font} • {field.size}px
                        </span>
                      </div>
                      <textarea
                        className={styles.fieldInput}
                        value={selectedTemplate.previewData[field.name] || ""}
                        onChange={(e) => {
                          const newPreviewData = {
                            ...selectedTemplate.previewData,
                            [field.name]: e.target.value,
                          };
                          handlePreviewDataChange(newPreviewData);
                        }}
                        placeholder={`Enter ${field.name} content for preview...`}
                        disabled={selectedTemplate.isShared}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Template Editor */}
              <div>
                <div className={styles.templateTabs}>
                  {selectedTemplate.noteType.tmpls.map((cardType, index) => (
                    <React.Fragment key={index}>
                      <button
                        className={`${styles.templateTab} ${
                          selectedCardIndex === index &&
                          selectedTemplateType === "qfmt"
                            ? styles.active
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedCardIndex(index);
                          setSelectedTemplateType("qfmt");
                        }}
                      >
                        {cardType.name} - Front
                      </button>
                      <button
                        className={`${styles.templateTab} ${
                          selectedCardIndex === index &&
                          selectedTemplateType === "afmt"
                            ? styles.active
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedCardIndex(index);
                          setSelectedTemplateType("afmt");
                        }}
                      >
                        {cardType.name} - Back
                      </button>
                    </React.Fragment>
                  ))}
                  <button
                    className={`${styles.templateTab} ${
                      selectedTemplateType === "css" ? styles.active : ""
                    }`}
                    onClick={() => setSelectedTemplateType("css")}
                  >
                    Styling
                  </button>
                </div>

                <MonacoEditorWrapper
                  noteType={selectedTemplate.noteType}
                  selectedCardIndex={selectedCardIndex}
                  selectedTemplate={selectedTemplateType}
                  previewData={selectedTemplate.previewData}
                  onNoteTypeChange={handleNoteTypeChange}
                  onPreviewDataChange={handlePreviewDataChange}
                />
              </div>
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <Icons.Template className={styles.emptyIcon} />
            <h2 className={styles.emptyTitle}>
              Welcome to Anki Template Editor
            </h2>
            <p className={styles.emptyDescription}>
              Create beautiful, customizable Anki flashcard templates with our
              Notion-inspired editor. Start by creating a new template or
              exploring shared templates from the community.
            </p>
            <button className={styles.createButton} onClick={createNewTemplate}>
              <Icons.Plus className={styles.actionIcon} />
              Create Your First Template
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateEditor;
