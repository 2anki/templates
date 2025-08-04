# Anki Template Editor

<p align="center"><img width="256" src="./public/android-chrome-192x192.png" alt="Template Manager logo" /></p>

A beautiful, Notion-inspired template editor for creating and customizing Anki flashcard templates. Features Monaco Editor with Copilot-style AI assistance, live preview, and comprehensive Anki note type support.

## Features

### 🎨 **Notion-Inspired UI**

- Clean, modern sidebar navigation
- Organized sections for Private, Shared, and Marketplace templates
- Intuitive project management

### ⚡ **Monaco Editor with AI**

- Syntax highlighting for HTML, CSS, and Anki template syntax
- Copilot-style inline suggestions (Ctrl+Space)
- Auto-completion for Anki field references
- Comment-style prompts (`// Generate...` or `<!-- Generate...`)
- Live preview with split-view toggle

### 📝 **Comprehensive Anki Support**

- All standard Anki note types (Basic, Cloze, etc.)
- Custom field management
- Card type templates (Front/Back)
- CSS styling editor
- Field placeholder previews

### 🔄 **Real-time Features**

- Auto-save functionality
- Live preview updates
- Field data binding
- Export to Anki format

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd templates
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open your browser to `http://localhost:3000`

## Usage

### Creating Templates

1. **Start a New Template**: Click "Add new template" in the sidebar
2. **Configure Fields**: Add and modify fields for your note type in the Fields section
3. **Edit Templates**: Use the Monaco Editor to write HTML templates for card fronts and backs
4. **Style Your Cards**: Switch to the Styling tab to customize CSS
5. **Preview**: Toggle split view to see live preview with your test data
6. **Export**: Download your template as Anki-compatible JSON

### AI-Powered Assistance

- **Trigger AI**: Press `Ctrl+Space` or click the ✨ Generate button
- **Comment Prompts**: Type `// Generate a flashcard template` for automatic suggestions
- **Multiple Options**: Browse AI suggestions in the side panel

### Anki Field Syntax

The editor provides auto-completion for:

- `{{FieldName}}` - Display field content
- `{{FrontSide}}` - Show front side (back template only)
- `{{#Field}}...{{/Field}}` - Conditional display
- `{{^Field}}...{{/Field}}` - Show when field is empty
- `{{cloze:Field}}` - Cloze deletion

## Architecture

The editor is built with a modular architecture supporting extensible Anki note types and AI assistance.

### Component Hierarchy

```
TemplateEditor (Main App)
├── Sidebar (Navigation)
├── MonacoEditorWrapper (Editor + AI)
└── Preview System
```

### Project Structure

```
src/
├── components/
│   ├── Sidebar/                 # Navigation sidebar
│   ├── MonacoEditorWrapper/     # Monaco editor with AI
│   └── TemplateEditor/          # Main editor component
├── services/
│   └── TemplateApiService.ts    # API service layer
├── types/
│   └── AnkiNoteType.ts         # Type definitions
└── monaco-setup.ts             # Monaco configuration
```

## Contributing

To get started developing, see the [Development](./Documentation/Development.md).
