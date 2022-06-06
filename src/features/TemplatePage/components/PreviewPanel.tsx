import {
  Tab, TabList, Tabs,
} from '@fremtind/jkl-tabs-react';
import '@fremtind/jkl-loader/loader.min.css';
import { Loader } from '@fremtind/jkl-loader-react';
import { useEffect, useState } from 'react';
import { TemplateFile } from '../../../types/templates';

import 'grapesjs/dist/css/grapes.min.css';

const grapesjs = require('grapesjs');

interface PreviewPanelProps {
  template: TemplateFile | undefined
}

export default function PreviewPanel({ template }: PreviewPanelProps) {
  const [tabIndex, setTabIndex] = useState(0);
  const [editor, setEditor] = useState(null);
  useEffect(() => {
    console.log('tabIndex', tabIndex);
    if (template) {
      const { front, back, styling } = template;
      const component = tabIndex === 0 ? front : back;
      if (!editor) {
        setEditor(grapesjs.init({
          container: '#preview-pane',
          components: component,
          style: styling,
        }));
      } else {
        /* @ts-ignore */
        editor.setComponents(component);
        /* @ts-ignore */
        editor.setStyle(styling);
      }
    } else {
      console.log('editor', editor);
    }
  }, [tabIndex]);

  if (!template) {
    return (
      <Loader
        variant="large"
        textDescription="Loading preview"
      />
    );
  }

  return (
    <Tabs onChange={(index) => setTabIndex(index)}>
      <TabList aria-label="tabs">
        <Tab>Front Preview</Tab>
        <Tab>Back Preview</Tab>
      </TabList>
    </Tabs>
  );
}
