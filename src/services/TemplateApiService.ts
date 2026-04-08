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

  private loggedIn: boolean | null = null;

  private async isLoggedIn(): Promise<boolean> {
    if (this.loggedIn !== null) return this.loggedIn;
    try {
      const response = await fetch(`${getBaseURL()}/api/templates/user`, {
        credentials: "include",
      });
      this.loggedIn = response.ok;
      if (response.ok) {
        const data = await response.json();
        this.serverData = data;
      }
      return this.loggedIn;
    } catch {
      this.loggedIn = false;
      return false;
    }
  }

  private serverData: {
    templates: TemplateProject[];
    hiddenIds: string[];
  } | null = null;

  private async syncToServer(): Promise<void> {
    if (!this.serverData) return;
    await fetch(`${getBaseURL()}/api/templates/user`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(this.serverData),
    });
  }

  async getUserTemplates(): Promise<TemplateProject[]> {
    const defaultTemplates = await this.fetchDefaultTemplates();
    const userTemplates = await this.getUserCreatedTemplates();
    return [...defaultTemplates, ...userTemplates];
  }

  private async fetchDefaultTemplates(): Promise<TemplateProject[]> {
    try {
      const response = await fetch(`${getBaseURL()}/api/templates/defaults`);
      if (!response.ok) return [];
      const defaults = await response.json();
      const hidden = await this.getHiddenTemplateIds();
      return defaults
        .map((t: any) => ({
          ...t,
          createdAt: new Date(0).toISOString(),
          updatedAt: new Date(0).toISOString(),
          isShared: false,
          isDefault: true,
        }))
        .filter((t: TemplateProject) => !hidden.includes(t.id));
    } catch {
      return [];
    }
  }

  private async getHiddenTemplateIds(): Promise<string[]> {
    if (await this.isLoggedIn()) {
      return this.serverData?.hiddenIds || [];
    }
    const stored = localStorage.getItem("hiddenTemplateIds");
    if (!stored) return [];
    return JSON.parse(stored);
  }

  private async hideTemplate(templateId: string): Promise<void> {
    if (await this.isLoggedIn()) {
      if (!this.serverData) this.serverData = { templates: [], hiddenIds: [] };
      if (!this.serverData.hiddenIds.includes(templateId)) {
        this.serverData.hiddenIds.push(templateId);
      }
      await this.syncToServer();
      return;
    }
    const hidden = await this.getHiddenTemplateIds();
    if (!hidden.includes(templateId)) {
      hidden.push(templateId);
      localStorage.setItem("hiddenTemplateIds", JSON.stringify(hidden));
    }
  }

  private async getUserCreatedTemplates(): Promise<TemplateProject[]> {
    if (await this.isLoggedIn()) {
      return this.serverData?.templates || [];
    }
    const stored = localStorage.getItem("userCreatedTemplates");
    if (!stored) return [];
    return JSON.parse(stored);
  }

  private async saveUserCreatedTemplates(
    templates: TemplateProject[]
  ): Promise<void> {
    if (await this.isLoggedIn()) {
      if (!this.serverData) this.serverData = { templates: [], hiddenIds: [] };
      this.serverData.templates = templates;
      await this.syncToServer();
      return;
    }
    localStorage.setItem("userCreatedTemplates", JSON.stringify(templates));
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

  async saveTemplate(template: TemplateProject): Promise<void> {
    const userTemplates = await this.getUserCreatedTemplates();
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

    this.saveUserCreatedTemplates(userTemplates);
  }

  async deleteTemplate(
    templateId: string,
    template?: TemplateProject
  ): Promise<void> {
    if (template?.isDefault) {
      await this.hideTemplate(templateId);
      return;
    }

    if (template?.isShared) {
      await this.hideTemplate(templateId);
      return;
    }

    const userTemplates = await this.getUserCreatedTemplates();
    const filtered = userTemplates.filter((t) => t.id !== templateId);
    await this.saveUserCreatedTemplates(filtered);
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
      <!DOCTYPE html>
      <html>
      <head><style>
        html { margin: 0; padding: 0; height: 100%; }
        ${noteType.css}
      </style></head>
      <body class="${cardClass}">
        ${html}
      </body>
      </html>
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
  background-size: cover;
  background-repeat: no-repeat;
  min-height: 100vh;
  padding: 40px;
  margin: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card > * {
  max-width: 600px;
  width: 100%;
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
  color: #ffffff;
  background: linear-gradient(135deg, #1e3a5f 0%, #0f2027 100%);
  min-height: 100%;
  padding: 40px;
  margin: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.cloze-question, .cloze-answer {
  color: #e2e8f0;
  line-height: 1.8;
  font-size: 1.3rem;
}

.cloze {
  font-weight: 700;
  background: rgba(99, 179, 237, 0.2);
  color: #63b3ed;
  padding: 4px 10px;
  border-radius: 6px;
  border-bottom: 2px solid #63b3ed;
}

.extra {
  margin-top: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.75);
  border-left: 4px solid #63b3ed;
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
