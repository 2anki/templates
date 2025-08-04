# Anki Template Editor Demo

## Overview

This project transforms the existing 2anki.net template manager into a comprehensive, Notion-inspired Anki template editor with the following key improvements:

## Key Features Implemented

### 1. **Notion-Inspired UI Architecture**

- **Fixed Sidebar Navigation**: Clean, organized sections for Private, Shared, Marketplace, Settings, and Trash
- **Modern Design System**: Using CSS Modules with consistent spacing, typography, and color scheme
- **Responsive Layout**: Main content area with proper spacing and visual hierarchy

### 2. **Enhanced Monaco Editor Experience**

- **Upgraded Dependencies**: Updated to `@monaco-editor/react` v4.6.0 and `monaco-editor` v0.44.0
- **Copilot-Style AI Integration**:
  - Trigger suggestions with `Ctrl+Space`
  - Comment-style prompts (`// Generate...` or `<!-- Generate...`)
  - AI suggestion panel with multiple options
  - Mock AI service ready for real API integration
- **Anki-Specific Features**:
  - Auto-completion for Anki field syntax (`{{Field}}`, `{{#Field}}`, etc.)
  - HTML and CSS language support optimized for card templates
  - Live preview with split-view toggle

### 3. **Comprehensive Anki Note Type Support**

- **Full Note Type Models**: Complete TypeScript interfaces matching Anki's structure
- **Multiple Card Types**: Support for Basic, Cloze, and custom note types
- **Field Management**: Dynamic field creation, editing, and preview data
- **Template Export**: Generate Anki-compatible JSON for direct import

### 4. **Advanced Template Management**

- **Project-Based Workflow**: Each template is a full project with metadata
- **Auto-Save System**: Real-time saving with visual feedback
- **Preview System**: Live preview with customizable test data
- **Template Sharing**: Infrastructure for community template sharing

## Technical Architecture

### **Modern React Stack**

```typescript
// Core technologies
- React 18 with TypeScript
- Monaco Editor with custom language support
- CSS Modules for styling
- Service layer architecture
```

### **Anki Integration**

```typescript
// Complete Anki note type support
interface AnkiNoteType {
  id: number;
  name: string;
  type: number; // 0 = standard, 1 = cloze
  tmpls: AnkiCardType[]; // Card templates
  flds: AnkiField[]; // Fields
  css: string; // Styling
  // ... full Anki compatibility
}
```

### **AI-Powered Assistance**

```typescript
// Extensible AI system
class CopilotService {
  async generateSuggestions(prompt: string): Promise<Suggestion[]>;
  // Mock implementation ready for OpenAI/Anthropic integration
}
```

## Component Overview

### **Sidebar Component (`src/components/Sidebar/`)**

- Organized navigation with icons and metadata
- Empty states for onboarding
- Template management actions

### **Monaco Editor Wrapper (`src/components/MonacoEditorWrapper/`)**

- Full-featured code editor with Anki syntax support
- AI suggestion system with visual feedback
- Live preview integration
- Toolbar with formatting and AI actions

### **Template Editor (`src/components/TemplateEditor/`)**

- Main application orchestration
- Field management interface
- Template project workflow
- Export and sharing functionality

### **API Service Layer (`src/services/TemplateApiService.ts`)**

- Mock API ready for backend integration
- Template CRUD operations
- Preview generation
- Export functionality

## Getting Started

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Start Development Server**:

   ```bash
   npm start
   ```

3. **Key Features to Try**:
   - Create a new template from the sidebar
   - Use `Ctrl+Space` in the editor for AI suggestions
   - Toggle split view to see live preview
   - Edit field data and see real-time updates
   - Export templates for Anki import

## Future Enhancements

### **Real AI Integration**

- Replace mock AI with OpenAI/Anthropic API
- Context-aware template suggestions
- Natural language to template conversion

### **Advanced Features**

- Real-time collaboration
- Template marketplace with ratings
- Import from existing Anki decks
- Advanced preview modes (mobile, dark theme)
- Template version control

### **Community Features**

- User accounts and profiles
- Template sharing and forking
- Community ratings and reviews
- Featured template collections

## Migration from Original

The new architecture maintains compatibility with existing 2anki.net templates while adding powerful new features:

- **Backward Compatible**: Existing templates work without modification
- **Enhanced Workflow**: Improved UX for template creation and editing
- **Extensible Design**: Ready for additional note types and features
- **Modern Codebase**: Updated dependencies and best practices

This represents a significant evolution from a simple template manager to a comprehensive Anki template creation platform.
