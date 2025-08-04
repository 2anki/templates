import React, { useState } from "react";
import { Layout } from "./components/Layout";
import { TemplateEditor } from "./components/TemplateEditor";
import { CardPreview } from "./components/CardPreview";
import { TemplateFile } from "./features/TemplatePage/model/TemplateFile";
import "./styles/globals.css";

function App() {
  const [currentTemplate, setCurrentTemplate] = useState<
    TemplateFile | undefined
  >();

  const handleTemplateChange = (template: TemplateFile) => {
    setCurrentTemplate(template);
  };

  return (
    <Layout
      title="Anki Template Editor"
      subtitle="Create and customize beautiful Anki flashcard templates with live preview"
    >
      <TemplateEditor onTemplateChange={handleTemplateChange} />
      <CardPreview template={currentTemplate} />
    </Layout>
  );
}

export default App;
