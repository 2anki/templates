import {
  AnkiNoteType,
  TemplateProject,
  PreviewData,
} from "../types/AnkiNoteType";
import { NoteBaseType } from "../types/NoteBaseType";
import { getBaseURL } from "../features/TemplatePage/helpers/getBaseUrl";
class TemplateApiService {
  private static instance: TemplateApiService;

  static getInstance(): TemplateApiService {
    if (!TemplateApiService.instance) {
      TemplateApiService.instance = new TemplateApiService();
    }
    return TemplateApiService.instance;
  }

  async getUserTemplates(): Promise<TemplateProject[]> {
    const TEMPLATES_VERSION = "2";
    const stored = localStorage.getItem("userTemplates");
    const storedVersion = localStorage.getItem("userTemplatesVersion");
    if (stored && storedVersion === TEMPLATES_VERSION) {
      return JSON.parse(stored);
    }

    const sampleTemplates: TemplateProject[] = [
      {
        id: "basic-clean",
        name: "Clean Basic",
        description: "A minimal, clean basic note type",
        baseType: NoteBaseType.Basic,
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
        baseType: NoteBaseType.Cloze,
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
      {
        id: "vocab-language",
        name: "Vocabulary Card",
        description:
          "Language learning — word, reading, meaning, example sentence",
        baseType: NoteBaseType.Basic,
        noteType: this.getVocabNoteType(),
        previewData: {
          Word: "勉強",
          Reading: "べんきょう",
          Meaning: "study; to study",
          Example: "毎日日本語を勉強しています。",
          ExampleTranslation: "I study Japanese every day.",
        },
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
        isShared: false,
        tags: ["language", "vocabulary", "japanese"],
      },
      {
        id: "medical-term",
        name: "Medical Term",
        description: "Anatomy / medical — term, definition, mnemonic",
        baseType: NoteBaseType.Basic,
        noteType: this.getMedicalNoteType(),
        previewData: {
          Term: "Mitral Valve",
          Definition:
            "The bicuspid valve between the left atrium and left ventricle of the heart",
          Mnemonic: "MItral = left sIde (both have I)",
          Image: "",
        },
        createdAt: new Date(Date.now() - 345600000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
        isShared: false,
        tags: ["medical", "anatomy"],
      },
      {
        id: "programming-snippet",
        name: "Code Card",
        description: "Programming — question with code block answer",
        baseType: NoteBaseType.Basic,
        noteType: this.getProgrammingNoteType(),
        previewData: {
          Question: "How do you reverse a string in Python?",
          Answer:
            's = "hello"\nreversed_s = s[::-1]\nprint(reversed_s)  # "olleh"',
          Notes:
            "Slice notation [start:stop:step] with step -1 iterates backwards.",
        },
        createdAt: new Date(Date.now() - 432000000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
        isShared: false,
        tags: ["programming", "python", "code"],
      },
      {
        id: "minimal-white",
        name: "Minimal",
        description: "Clean white card — distraction-free reading",
        baseType: NoteBaseType.Basic,
        noteType: this.getMinimalNoteType(),
        previewData: {
          Front: "What is the powerhouse of the cell?",
          Back: "The mitochondria",
        },
        createdAt: new Date(Date.now() - 518400000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
        isShared: false,
        tags: ["minimal", "clean"],
      },
      {
        id: "quote-card",
        name: "Quote",
        description: "A large featured quote with author attribution",
        baseType: NoteBaseType.Basic,
        noteType: this.getQuoteNoteType(),
        previewData: {
          Quote: "The only way to do great work is to love what you do.",
          Author: "Steve Jobs",
          Context: "Stanford Commencement Address, 2005",
        },
        createdAt: new Date(Date.now() - 604800000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
        isShared: false,
        tags: ["quotes", "inspiration"],
      },
      {
        id: "math-problem",
        name: "Math Problem",
        description:
          "Problem and worked solution with LaTeX rendering via KaTeX",
        baseType: NoteBaseType.Basic,
        noteType: this.getMathNoteType(),
        previewData: {
          Problem: "Find the derivative of f(x) = x³ + 2x² − 5x + 1",
          Solution: "f'(x) = 3x² + 4x − 5",
          Steps: "Apply the power rule: d/dx[xⁿ] = n·xⁿ⁻¹ to each term.",
        },
        createdAt: new Date(Date.now() - 691200000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
        isShared: false,
        tags: ["math", "calculus"],
      },
    ];

    localStorage.setItem("userTemplates", JSON.stringify(sampleTemplates));
    localStorage.setItem("userTemplatesVersion", TEMPLATES_VERSION);
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
        baseType: template.baseType,
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

  generatePreview(
    noteType: AnkiNoteType,
    cardIndex: number,
    previewData: PreviewData,
    isBack: boolean = false
  ): string {
    const cardType = noteType.tmpls[cardIndex];
    if (!cardType) return "";

    let html: string;

    if (isBack) {
      const frontHtml = this.renderTemplate(
        cardType.qfmt,
        noteType,
        previewData,
        cardIndex
      );
      html = this.renderTemplate(
        cardType.afmt,
        noteType,
        previewData,
        cardIndex,
        frontHtml
      );
    } else {
      html = this.renderTemplate(
        cardType.qfmt,
        noteType,
        previewData,
        cardIndex
      );
    }

    const cardClass = `card card${cardIndex + 1}`;

    return `
      <style>${noteType.css}</style>
      <div class="${cardClass}">
        ${html}
      </div>
    `;
  }

  private renderTemplate(
    template: string,
    noteType: AnkiNoteType,
    previewData: PreviewData,
    cardIndex: number,
    frontSideHtml?: string
  ): string {
    let html = template;

    if (frontSideHtml !== undefined) {
      html = html.replace(/{{FrontSide}}/gi, frontSideHtml);
    }

    html = this.processConditionals(html, noteType, previewData);

    if (noteType.type === 1) {
      noteType.flds.forEach((field) => {
        const escaped = this.escapeRegex(field.name);
        const clozeRegex = new RegExp(`{{cloze:${escaped}}}`, "gi");
        const value = previewData[field.name] || "";
        const rendered = value.replace(
          /{{c(\d+)::([^}]*?)(?:::([^}]*?))?}}/g,
          (_match, num, answer, hint) => {
            const clozeNum = parseInt(num, 10);
            const isActive = clozeNum === cardIndex + 1;
            if (isActive) {
              return `<span style="font-weight:bold;color:#0284c7;">[${
                hint || "..."
              }]</span>`;
            }
            return answer;
          }
        );
        html = html.replace(clozeRegex, rendered);
      });
    }

    noteType.flds.forEach((field) => {
      const escaped = this.escapeRegex(field.name);

      const hintRegex = new RegExp(`{{hint:${escaped}}}`, "gi");
      const hintValue = previewData[field.name] || "";
      if (hintValue) {
        const hintId = `hint_${field.name.replace(/\s/g, "_")}`;
        html = html.replace(
          hintRegex,
          `<a class="hint" href="#" onclick="this.style.display='none';document.getElementById('${hintId}').style.display='inline-block';return false;">Show ${field.name}</a><div id="${hintId}" style="display:none">${hintValue}</div>`
        );
      } else {
        html = html.replace(hintRegex, "");
      }

      const textRegex = new RegExp(`{{text:${escaped}}}`, "gi");
      const textValue = previewData[field.name] || `[${field.name}]`;
      html = html.replace(textRegex, textValue.replace(/<[^>]*>/g, ""));

      const typeRegex = new RegExp(`{{type:${escaped}}}`, "gi");
      html = html.replace(
        typeRegex,
        `<input type="text" placeholder="type answer here" style="font-family:monospace;font-size:14px;padding:4px 8px;border:1px solid #ccc;border-radius:4px;width:80%;max-width:400px;" readonly />`
      );

      const fieldRegex = new RegExp(`{{${escaped}}}`, "gi");
      html = html.replace(
        fieldRegex,
        previewData[field.name] || `[${field.name}]`
      );
    });

    html = html.replace(/{{Tags}}/gi, "preview");
    html = html.replace(/{{Type}}/gi, noteType.name);
    html = html.replace(/{{Deck}}/gi, "Preview Deck");
    html = html.replace(/{{Subdeck}}/gi, "Preview Deck");
    html = html.replace(
      /{{Card}}/gi,
      noteType.tmpls[cardIndex]?.name || "Card 1"
    );
    html = html.replace(/{{CardFlag}}/gi, "");

    return html;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  private processConditionals(
    html: string,
    noteType: AnkiNoteType,
    previewData: PreviewData
  ): string {
    let result = html;
    let safety = 0;

    while (safety++ < 50) {
      const match = result.match(/{{([#^])([^}]+?)}}([\s\S]*?){{\/\2}}/);
      if (!match) break;

      const [fullMatch, operator, fieldName, content] = match;
      const fieldValue = (previewData[fieldName] || "").trim();
      const hasValue = fieldValue.length > 0;

      const shouldShow = operator === "#" ? hasValue : !hasValue;
      result = result.replace(fullMatch, shouldShow ? content : "");
    }

    return result;
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

  getBasicReversedNoteType(): AnkiNoteType {
    return {
      id: Date.now() + 2,
      name: "Basic (and reversed card)",
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
        {
          name: "Card 2",
          ord: 1,
          qfmt: '<div class="front">\n  <h1>{{Back}}</h1>\n</div>',
          afmt: '<div class="back">\n  <div class="question">{{Back}}</div>\n  <hr id="answer">\n  <div class="answer">{{Front}}</div>\n</div>',
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
      css: this.getBasicNoteType().css,
      tags: [],
    };
  }

  getBasicOptionalReversedNoteType(): AnkiNoteType {
    return {
      id: Date.now() + 3,
      name: "Basic (optional reversed card)",
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
        {
          name: "Card 2",
          ord: 1,
          qfmt: '{{#Add Reverse}}<div class="front">\n  <h1>{{Back}}</h1>\n</div>{{/Add Reverse}}',
          afmt: '{{#Add Reverse}}<div class="back">\n  <div class="question">{{Back}}</div>\n  <hr id="answer">\n  <div class="answer">{{Front}}</div>\n</div>{{/Add Reverse}}',
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
        {
          name: "Add Reverse",
          ord: 2,
          sticky: false,
          rtl: false,
          font: "Inter",
          size: 20,
        },
      ],
      css: this.getBasicNoteType().css,
      tags: [],
    };
  }

  getBasicTypeAnswerNoteType(): AnkiNoteType {
    return {
      id: Date.now() + 4,
      name: "Basic (type in the answer)",
      type: 0,
      mod: Date.now(),
      usn: -1,
      sortf: 0,
      tmpls: [
        {
          name: "Card 1",
          ord: 0,
          qfmt: '<div class="front">\n  <h1>{{Front}}</h1>\n  {{type:Back}}\n</div>',
          afmt: '<div class="back">\n  <div class="question">{{Front}}</div>\n  <hr id="answer">\n  <div class="answer">{{Back}}</div>\n  {{type:Back}}\n</div>',
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
      css: this.getBasicNoteType().css,
      tags: [],
    };
  }

  getImageOcclusionNoteType(): AnkiNoteType {
    return {
      id: Date.now() + 5,
      name: "Image Occlusion",
      type: 0,
      mod: Date.now(),
      usn: -1,
      sortf: 0,
      tmpls: [
        {
          name: "Card 1",
          ord: 0,
          qfmt: '<div class="front">\n  {{Image}}\n  <div class="header">{{Header}}</div>\n</div>',
          afmt: '<div class="back">\n  {{Image}}\n  <div class="header">{{Header}}</div>\n  <div class="extra">{{Back Extra}}</div>\n</div>',
        },
      ],
      flds: [
        {
          name: "Image",
          ord: 0,
          sticky: false,
          rtl: false,
          font: "Inter",
          size: 20,
        },
        {
          name: "Header",
          ord: 1,
          sticky: false,
          rtl: false,
          font: "Inter",
          size: 20,
        },
        {
          name: "Back Extra",
          ord: 2,
          sticky: false,
          rtl: false,
          font: "Inter",
          size: 20,
        },
        {
          name: "Comments",
          ord: 3,
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
  padding: 20px;
}
.header { font-size: 1.2rem; font-weight: 600; margin-bottom: 10px; }
.extra { margin-top: 20px; color: #555; }
      `,
      tags: [],
    };
  }

  getVocabNoteType(): AnkiNoteType {
    return {
      id: Date.now() + 10,
      name: "Vocabulary",
      type: 0,
      mod: Date.now(),
      usn: -1,
      sortf: 0,
      tmpls: [
        {
          name: "Card 1",
          ord: 0,
          qfmt: `<div class="vocab-front">
  <div class="word">{{Word}}</div>
  <div class="reading">{{Reading}}</div>
</div>`,
          afmt: `<div class="vocab-back">
  <div class="word">{{Word}}</div>
  <div class="reading">{{Reading}}</div>
  <hr class="divider">
  <div class="meaning">{{Meaning}}</div>
  {{#Example}}
  <div class="example">
    <div class="example-sentence">{{Example}}</div>
    <div class="example-translation">{{ExampleTranslation}}</div>
  </div>
  {{/Example}}
</div>`,
        },
      ],
      flds: [
        {
          name: "Word",
          ord: 0,
          sticky: false,
          rtl: false,
          font: "Inter",
          size: 20,
        },
        {
          name: "Reading",
          ord: 1,
          sticky: false,
          rtl: false,
          font: "Inter",
          size: 16,
        },
        {
          name: "Meaning",
          ord: 2,
          sticky: false,
          rtl: false,
          font: "Inter",
          size: 20,
        },
        {
          name: "Example",
          ord: 3,
          sticky: false,
          rtl: false,
          font: "Inter",
          size: 16,
        },
        {
          name: "ExampleTranslation",
          ord: 4,
          sticky: false,
          rtl: false,
          font: "Inter",
          size: 16,
        },
      ],
      css: `
.card {
  font-family: 'Noto Sans', 'Hiragino Sans', 'Yu Gothic', 'Inter', sans-serif;
  background: #fafaf9;
  min-height: 100%;
  margin: 0;
  padding: 32px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.vocab-front, .vocab-back {
  width: 100%;
  max-width: 480px;
  text-align: center;
}

.word {
  font-size: 2.8rem;
  font-weight: 700;
  color: #1c1917;
  line-height: 1.2;
  margin-bottom: 8px;
}

.reading {
  font-size: 1.1rem;
  color: #78716c;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.divider {
  border: none;
  height: 1px;
  background: #e7e5e4;
  margin: 24px auto;
  width: 60%;
}

.meaning {
  font-size: 1.3rem;
  color: #292524;
  font-weight: 500;
  margin-bottom: 20px;
}

.example {
  background: #f5f5f4;
  border-radius: 12px;
  padding: 16px 20px;
  border-left: 3px solid #a78bfa;
  text-align: left;
}

.example-sentence {
  font-size: 1rem;
  color: #1c1917;
  margin-bottom: 6px;
  line-height: 1.6;
}

.example-translation {
  font-size: 0.9rem;
  color: #78716c;
  font-style: italic;
}
      `,
      tags: [],
    };
  }

  getMedicalNoteType(): AnkiNoteType {
    return {
      id: Date.now() + 11,
      name: "Medical Term",
      type: 0,
      mod: Date.now(),
      usn: -1,
      sortf: 0,
      tmpls: [
        {
          name: "Card 1",
          ord: 0,
          qfmt: `<div class="medical-front">
  <div class="label">Define</div>
  <div class="term">{{Term}}</div>
</div>`,
          afmt: `<div class="medical-back">
  <div class="term-small">{{Term}}</div>
  <div class="definition">{{Definition}}</div>
  {{#Mnemonic}}
  <div class="mnemonic">
    <span class="mnemonic-label">Mnemonic</span>
    {{Mnemonic}}
  </div>
  {{/Mnemonic}}
</div>`,
        },
      ],
      flds: [
        {
          name: "Term",
          ord: 0,
          sticky: false,
          rtl: false,
          font: "Inter",
          size: 20,
        },
        {
          name: "Definition",
          ord: 1,
          sticky: false,
          rtl: false,
          font: "Inter",
          size: 16,
        },
        {
          name: "Mnemonic",
          ord: 2,
          sticky: false,
          rtl: false,
          font: "Inter",
          size: 16,
        },
        {
          name: "Image",
          ord: 3,
          sticky: false,
          rtl: false,
          font: "Inter",
          size: 16,
        },
      ],
      css: `
.card {
  font-family: 'Inter', -apple-system, sans-serif;
  background: #f0f9ff;
  min-height: 100%;
  margin: 0;
  padding: 32px 24px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.medical-front, .medical-back {
  width: 100%;
  max-width: 480px;
  text-align: center;
}

.label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #0284c7;
  margin-bottom: 12px;
}

.term {
  font-size: 2.2rem;
  font-weight: 700;
  color: #0c4a6e;
  line-height: 1.2;
}

.term-small {
  font-size: 1.1rem;
  font-weight: 600;
  color: #0284c7;
  margin-bottom: 16px;
}

.definition {
  font-size: 1.1rem;
  color: #1e3a5f;
  line-height: 1.7;
  margin-bottom: 20px;
}

.mnemonic {
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 10px;
  padding: 14px 18px;
  font-size: 0.95rem;
  color: #9a3412;
  line-height: 1.5;
  text-align: left;
}

.mnemonic-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #c2410c;
  margin-bottom: 4px;
}
      `,
      tags: [],
    };
  }

  getProgrammingNoteType(): AnkiNoteType {
    return {
      id: Date.now() + 12,
      name: "Code Card",
      type: 0,
      mod: Date.now(),
      usn: -1,
      sortf: 0,
      tmpls: [
        {
          name: "Card 1",
          ord: 0,
          qfmt: `<div class="code-front">
  <div class="question">{{Question}}</div>
</div>`,
          afmt: `<div class="code-back">
  <div class="question-small">{{Question}}</div>
  <pre class="code-block"><code>{{Answer}}</code></pre>
  {{#Notes}}
  <div class="notes">{{Notes}}</div>
  {{/Notes}}
</div>`,
        },
      ],
      flds: [
        {
          name: "Question",
          ord: 0,
          sticky: false,
          rtl: false,
          font: "Inter",
          size: 20,
        },
        {
          name: "Answer",
          ord: 1,
          sticky: false,
          rtl: false,
          font: "Fira Code",
          size: 14,
        },
        {
          name: "Notes",
          ord: 2,
          sticky: false,
          rtl: false,
          font: "Inter",
          size: 14,
        },
      ],
      css: `
.card {
  font-family: 'Inter', -apple-system, sans-serif;
  background: #0f172a;
  color: #e2e8f0;
  min-height: 100%;
  margin: 0;
  padding: 28px 20px;
  box-sizing: border-box;
}

.code-front, .code-back {
  max-width: 560px;
  margin: 0 auto;
}

.question {
  font-size: 1.25rem;
  font-weight: 600;
  color: #f1f5f9;
  line-height: 1.5;
  margin-bottom: 8px;
  text-align: center;
}

.question-small {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-bottom: 16px;
  text-align: center;
}

.code-block {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 20px;
  margin: 0 0 16px;
  overflow-x: auto;
  text-align: left;
}

.code-block code {
  font-family: 'Fira Code', 'Cascadia Code', 'JetBrains Mono', 'Consolas', monospace;
  font-size: 0.9rem;
  color: #7dd3fc;
  white-space: pre;
  line-height: 1.7;
}

.notes {
  background: #1e293b;
  border-left: 3px solid #818cf8;
  border-radius: 0 8px 8px 0;
  padding: 12px 16px;
  font-size: 0.88rem;
  color: #cbd5e1;
  line-height: 1.6;
}
      `,
      tags: [],
    };
  }

  getMinimalNoteType(): AnkiNoteType {
    return {
      id: Date.now() + 13,
      name: "Minimal",
      type: 0,
      mod: Date.now(),
      usn: -1,
      sortf: 0,
      tmpls: [
        {
          name: "Card 1",
          ord: 0,
          qfmt: `<div class="minimal-front">
  <div class="question">{{Front}}</div>
</div>`,
          afmt: `<div class="minimal-back">
  <div class="question-repeat">{{Front}}</div>
  <div class="answer">{{Back}}</div>
</div>`,
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
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #ffffff;
  min-height: 100%;
  margin: 0;
  padding: 40px 32px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.minimal-front, .minimal-back {
  width: 100%;
  max-width: 480px;
  text-align: center;
}

.question {
  font-size: 1.5rem;
  font-weight: 500;
  color: #111827;
  line-height: 1.5;
}

.question-repeat {
  font-size: 1rem;
  color: #9ca3af;
  margin-bottom: 24px;
  line-height: 1.5;
}

.answer {
  font-size: 1.6rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.4;
  padding-top: 24px;
  border-top: 1px solid #f3f4f6;
}
      `,
      tags: [],
    };
  }

  getQuoteNoteType(): AnkiNoteType {
    return {
      id: Date.now() + 14,
      name: "Quote",
      type: 0,
      mod: Date.now(),
      usn: -1,
      sortf: 0,
      tmpls: [
        {
          name: "Card 1",
          ord: 0,
          qfmt: `<div class="quote-front">
  <div class="quotemark">"</div>
  <blockquote class="quote-text">{{Quote}}</blockquote>
</div>`,
          afmt: `<div class="quote-back">
  <div class="quotemark">"</div>
  <blockquote class="quote-text">{{Quote}}</blockquote>
  <div class="attribution">
    <span class="author">— {{Author}}</span>
    {{#Context}}<span class="context">{{Context}}</span>{{/Context}}
  </div>
</div>`,
        },
      ],
      flds: [
        {
          name: "Quote",
          ord: 0,
          sticky: false,
          rtl: false,
          font: "Inter",
          size: 20,
        },
        {
          name: "Author",
          ord: 1,
          sticky: false,
          rtl: false,
          font: "Inter",
          size: 16,
        },
        {
          name: "Context",
          ord: 2,
          sticky: false,
          rtl: false,
          font: "Inter",
          size: 14,
        },
      ],
      css: `
.card {
  font-family: 'Georgia', 'Palatino', serif;
  background: #1c1917;
  min-height: 100%;
  margin: 0;
  padding: 40px 32px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quote-front, .quote-back {
  width: 100%;
  max-width: 500px;
  text-align: center;
}

.quotemark {
  font-size: 6rem;
  line-height: 0.5;
  color: #a78bfa;
  margin-bottom: 16px;
  font-family: Georgia, serif;
}

.quote-text {
  font-size: 1.25rem;
  font-style: italic;
  color: #f5f5f4;
  line-height: 1.8;
  margin: 0 0 24px;
}

.attribution {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author {
  font-size: 1rem;
  font-weight: 600;
  color: #a78bfa;
  font-style: normal;
  font-family: 'Inter', sans-serif;
}

.context {
  font-size: 0.82rem;
  color: #78716c;
  font-style: normal;
  font-family: 'Inter', sans-serif;
}
      `,
      tags: [],
    };
  }

  getMathNoteType(): AnkiNoteType {
    return {
      id: Date.now() + 15,
      name: "Math Problem",
      type: 0,
      mod: Date.now(),
      usn: -1,
      sortf: 0,
      tmpls: [
        {
          name: "Card 1",
          ord: 0,
          qfmt: `<div class="math-front">
  <div class="label">Solve</div>
  <div class="problem">{{Problem}}</div>
</div>`,
          afmt: `<div class="math-back">
  <div class="problem-small">{{Problem}}</div>
  <div class="solution">{{Solution}}</div>
  {{#Steps}}
  <div class="steps">
    <div class="steps-label">How</div>
    {{Steps}}
  </div>
  {{/Steps}}
</div>`,
        },
      ],
      flds: [
        {
          name: "Problem",
          ord: 0,
          sticky: false,
          rtl: false,
          font: "Inter",
          size: 20,
        },
        {
          name: "Solution",
          ord: 1,
          sticky: false,
          rtl: false,
          font: "Inter",
          size: 20,
        },
        {
          name: "Steps",
          ord: 2,
          sticky: false,
          rtl: false,
          font: "Inter",
          size: 16,
        },
      ],
      css: `
.card {
  font-family: 'Inter', -apple-system, sans-serif;
  background: #fefce8;
  min-height: 100%;
  margin: 0;
  padding: 32px 24px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.math-front, .math-back {
  width: 100%;
  max-width: 480px;
  text-align: center;
}

.label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #ca8a04;
  margin-bottom: 12px;
}

.problem {
  font-size: 1.4rem;
  color: #1c1917;
  line-height: 1.5;
  font-weight: 500;
}

.problem-small {
  font-size: 0.95rem;
  color: #92400e;
  margin-bottom: 20px;
  line-height: 1.4;
}

.solution {
  font-size: 1.6rem;
  font-weight: 700;
  color: #15803d;
  background: #f0fdf4;
  border: 2px solid #86efac;
  border-radius: 12px;
  padding: 16px 24px;
  margin-bottom: 16px;
}

.steps {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 10px;
  padding: 14px 18px;
  font-size: 0.9rem;
  color: #78350f;
  line-height: 1.7;
  text-align: left;
}

.steps-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #d97706;
  margin-bottom: 6px;
}
      `,
      tags: [],
    };
  }

  getDefaultCss(baseType: NoteBaseType): string {
    return this.getNoteTypeForBaseType(baseType).css;
  }

  getNoteTypeForBaseType(baseType: NoteBaseType): AnkiNoteType {
    switch (baseType) {
      case NoteBaseType.Basic:
        return this.getBasicNoteType();
      case NoteBaseType.BasicReversed:
        return this.getBasicReversedNoteType();
      case NoteBaseType.BasicOptionalReversed:
        return this.getBasicOptionalReversedNoteType();
      case NoteBaseType.BasicTypeAnswer:
        return this.getBasicTypeAnswerNoteType();
      case NoteBaseType.Cloze:
        return this.getClozeNoteType();
      case NoteBaseType.ImageOcclusion:
        return this.getImageOcclusionNoteType();
    }
  }

  getDefaultPreviewDataForBaseType(
    baseType: NoteBaseType
  ): Record<string, string> {
    switch (baseType) {
      case NoteBaseType.Cloze:
        return {
          Text: "Humans landed on the moon in {{c1::1969}}.",
          Extra: "",
        };
      case NoteBaseType.ImageOcclusion:
        return {
          Image: "",
          Header: "Label the diagram",
          "Back Extra": "",
          Comments: "",
        };
      default:
        return {
          Front: "Sample question",
          Back: "Sample answer",
        };
    }
  }
}

export default TemplateApiService;
