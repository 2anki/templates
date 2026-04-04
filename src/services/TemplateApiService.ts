import {
  AnkiNoteType,
  TemplateProject,
  PreviewData,
} from "../types/AnkiNoteType";
import { getBaseURL } from "../features/TemplatePage/helpers/getBaseUrl";

// Mock API service for template management
class TemplateApiService {
  private static instance: TemplateApiService;

  static getInstance(): TemplateApiService {
    if (!TemplateApiService.instance) {
      TemplateApiService.instance = new TemplateApiService();
    }
    return TemplateApiService.instance;
  }

  // Get user's private templates
  async getUserTemplates(): Promise<TemplateProject[]> {
    // Mock implementation - in real app this would be an API call
    const stored = localStorage.getItem("userTemplates");
    if (stored) {
      return JSON.parse(stored);
    }

    // Return some sample templates for demo
    const sampleTemplates: TemplateProject[] = [
      {
        id: "basic-clean",
        name: "Clean Basic",
        description: "A minimal, clean basic note type",
        noteType: this.getBasicNoteType(),
        previewData: {
          Front: "What is the capital of France?",
          Back: "Paris",
        },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
        isShared: false,
        tags: ["basic", "minimal"],
      },
      {
        id: "cloze-modern",
        name: "Modern Cloze",
        description: "A stylish cloze deletion template",
        noteType: this.getClozeNoteType(),
        previewData: {
          Text: "The capital of {{c1::France}} is {{c2::Paris}}.",
          Extra: "France is located in Western Europe.",
        },
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 7200000).toISOString(),
        isShared: false,
        tags: ["cloze", "geography"],
      },
    ];

    // Store the sample templates
    localStorage.setItem("userTemplates", JSON.stringify(sampleTemplates));
    return sampleTemplates;
  }

  // Get shared/community templates from the server marketplace
  async getSharedTemplates(): Promise<TemplateProject[]> {
    try {
      const response = await fetch(`${getBaseURL()}/api/templates/public`);
      if (!response.ok) return [];
      return response.json();
    } catch {
      return [];
    }
  }

  // Save template
  async saveTemplate(template: TemplateProject): Promise<void> {
    const userTemplates = await this.getUserTemplates();
    const existingIndex = userTemplates.findIndex((t) => t.id === template.id);

    if (existingIndex >= 0) {
      userTemplates[existingIndex] = {
        ...template,
        updatedAt: new Date().toISOString(),
      };
    } else {
      userTemplates.push({
        ...template,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    localStorage.setItem("userTemplates", JSON.stringify(userTemplates));
  }

  // Delete template
  async deleteTemplate(templateId: string): Promise<void> {
    const userTemplates = await this.getUserTemplates();
    const filtered = userTemplates.filter((t) => t.id !== templateId);
    localStorage.setItem("userTemplates", JSON.stringify(filtered));
  }

  // Publish template to the public marketplace
  async publishTemplate(template: TemplateProject): Promise<void> {
    const response = await fetch(`${getBaseURL()}/api/templates/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: template.name,
        description: template.description,
        noteType: template.noteType,
        previewData: template.previewData,
        tags: template.tags,
      }),
    });

    if (response.status === 401) {
      throw new Error("Please log in to 2anki.net to share templates");
    }
    if (!response.ok) {
      throw new Error("Failed to publish template");
    }
  }

  // Export template for Anki
  async exportTemplate(templateId: string): Promise<ArrayBuffer> {
    const templates = await this.getUserTemplates();
    const template = templates.find((t) => t.id === templateId);
    if (!template) throw new Error("Template not found");

    const response = await fetch(`${getBaseURL()}/api/templates/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        noteType: template.noteType,
        previewData: template.previewData,
      }),
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.arrayBuffer();
  }

  // Generate preview HTML
  generatePreview(
    noteType: AnkiNoteType,
    cardIndex: number,
    previewData: PreviewData,
    isBack: boolean = false
  ): string {
    const cardType = noteType.tmpls[cardIndex];
    if (!cardType) return "";

    const template = isBack ? cardType.afmt : cardType.qfmt;
    let html = template;

    // Replace field placeholders with preview data
    noteType.flds.forEach((field) => {
      const value = previewData[field.name] || `[${field.name}]`;
      const regex = new RegExp(`{{${field.name}}}`, "gi");
      html = html.replace(regex, value);
    });

    // Wrap in basic styling
    return `
      <style>${noteType.css}</style>
      <div class="card">
        ${html}
      </div>
    `;
  }

  // Get default note types
  getBasicNoteType(): AnkiNoteType {
    return {
      id: Date.now(),
      name: "Basic",
      type: 0,
      mod: Date.now(),
      usn: -1,
      sortf: 0,
      tmpls: [
        {
          name: "Card 1",
          ord: 0,
          qfmt: '<div class="front">\n  <h1>{{Front}}</h1>\n</div>',
          afmt: '<div class="back">\n  <div class="question">{{Front}}</div>\n  <hr id="answer">\n  <div class="answer">{{Back}}</div>\n</div>',
        },
      ],
      flds: [
        {
          name: "Front",
          ord: 0,
          sticky: false,
          rtl: false,
          font: "Inter",
          size: 20,
        },
        {
          name: "Back",
          ord: 1,
          sticky: false,
          rtl: false,
          font: "Inter",
          size: 20,
        },
      ],
      css: `
.card {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 20px;
  text-align: center;
  color: #1f2937;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px;
  border-radius: 16px;
  max-width: 600px;
  margin: 20px auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.front h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.back {
  color: white;
}

.question {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 20px;
  opacity: 0.8;
}

.answer {
  font-size: 2rem;
  font-weight: 700;
  margin-top: 20px;
}

hr {
  border: none;
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
  margin: 20px 0;
  border-radius: 1px;
}
      `,
      tags: [],
    };
  }

  getClozeNoteType(): AnkiNoteType {
    return {
      id: Date.now() + 1,
      name: "Cloze",
      type: 1,
      mod: Date.now(),
      usn: -1,
      sortf: 0,
      tmpls: [
        {
          name: "Cloze",
          ord: 0,
          qfmt: '<div class="cloze-question">\n  {{cloze:Text}}\n</div>',
          afmt: '<div class="cloze-answer">\n  {{cloze:Text}}\n  {{#Extra}}\n    <div class="extra">{{Extra}}</div>\n  {{/Extra}}\n</div>',
        },
      ],
      flds: [
        {
          name: "Text",
          ord: 0,
          sticky: false,
          rtl: false,
          font: "Inter",
          size: 20,
        },
        {
          name: "Extra",
          ord: 1,
          sticky: false,
          rtl: false,
          font: "Inter",
          size: 16,
        },
      ],
      css: `
.card {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 20px;
  text-align: center;
  color: #1f2937;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 40px;
  border-radius: 16px;
  max-width: 600px;
  margin: 20px auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.cloze-question, .cloze-answer {
  color: white;
  line-height: 1.6;
}

.cloze {
  font-weight: bold;
  background: rgba(255, 255, 255, 0.2);
  color: #fbbf24;
  padding: 4px 8px;
  border-radius: 6px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.extra {
  margin-top: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  border-left: 4px solid #fbbf24;
}
      `,
      tags: [],
    };
  }
}

export default TemplateApiService;
