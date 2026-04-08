import React, { useState } from "react";
import styles from "./AIGenerateDialog.module.css";

const STYLE_PRESETS = [
  { id: "minimal", emoji: "✨", name: "Minimal" },
  { id: "modern", emoji: "💎", name: "Modern" },
  { id: "medical", emoji: "🏥", name: "Medical" },
  { id: "code", emoji: "💻", name: "Code" },
  { id: "vocabulary", emoji: "📚", name: "Vocabulary" },
  { id: "elegant", emoji: "🎨", name: "Elegant" },
];

interface AIGenerateDialogProps {
  onGenerated: (template: GeneratedTemplate) => void;
  onCancel: () => void;
}

export interface GeneratedTemplate {
  name: string;
  description: string;
  baseType: string;
  fields: { name: string }[];
  cards: { name: string; qfmt: string; afmt: string }[];
  css: string;
  previewData: Record<string, string>;
}

const AIGenerateDialog: React.FC<AIGenerateDialogProps> = ({
  onGenerated,
  onCancel,
}) => {
  const [prompt, setPrompt] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/templates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          stylePreset: selectedPreset,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate template");
      }

      const template: GeneratedTemplate = await response.json();
      onGenerated(template);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate template"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey && prompt.trim()) {
      handleGenerate();
    }
    if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        {isLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingBar}>
              <div className={styles.loadingBarInner} />
            </div>
            <div className={styles.loadingText}>
              Generating your template...
            </div>
            <div className={styles.loadingHint}>
              This usually takes 5-10 seconds
            </div>
          </div>
        ) : (
          <>
            <div className={styles.dialogHeader}>
              <h2 className={styles.dialogTitle}>Generate with AI</h2>
              <p className={styles.dialogSubtitle}>
                Describe the flashcard you want and we'll create a beautiful
                template for you
              </p>
            </div>
            <div className={styles.dialogBody}>
              <label className={styles.promptLabel}>
                What kind of flashcard?
              </label>
              <textarea
                className={styles.promptTextarea}
                placeholder="e.g. A clean vocabulary card with word, pronunciation, definition and example sentence..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                maxLength={1000}
              />

              <div className={styles.presetSection}>
                <span className={styles.presetLabel}>Style (optional)</span>
                <div className={styles.presetGrid}>
                  {STYLE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      className={`${styles.presetCard} ${
                        selectedPreset === preset.id
                          ? styles.presetCardSelected
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedPreset(
                          selectedPreset === preset.id ? null : preset.id
                        )
                      }
                    >
                      <span className={styles.presetEmoji}>{preset.emoji}</span>
                      <span className={styles.presetName}>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {error && <div className={styles.errorMessage}>{error}</div>}

              <div className={styles.dialogActions}>
                <button className={styles.cancelButton} onClick={onCancel}>
                  Cancel
                </button>
                <button
                  className={styles.generateButton}
                  onClick={handleGenerate}
                  disabled={!prompt.trim()}
                >
                  Generate Template
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIGenerateDialog;
