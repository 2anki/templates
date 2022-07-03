import {
  Tab, TabList, Tabs,
} from '@fremtind/jkl-tabs-react';
import '@fremtind/jkl-loader/loader.min.css';
import { Loader } from '@fremtind/jkl-loader-react';
import { useEffect, useState } from 'react';
import { TemplateFile } from '../../../types/templates';
import 'grapesjs/dist/css/grapes.min.css';

require('grapesjs-preset-webpage/dist/grapesjs-preset-webpage.min.css');

const grapesjs = require('grapesjs');
require('grapesjs-preset-webpage');

interface PreviewPanelProps {
  template: TemplateFile | undefined
}

export default function PreviewPanel({ template }: PreviewPanelProps) {
  const [tabIndex, setTabIndex] = useState(0);
  const [editor, setEditor] = useState(null);
  useEffect(() => {
    if (template) {
      const { front, back, styling } = template;
      const component = tabIndex === 0 ? front : back;
      if (!editor) {
        const ed = grapesjs.init({
          container: '#preview-pane',
          plugins: ['gjs-preset-webpage'],
          pluginsOpts: {
            'gjs-preset-webpage': {
              // options
            },
          },
          components: component,
          style: styling,
        });
        /* @ts-ignore */
        ed.on('update', () => {
          localStorage.setItem('gjs-components', JSON.stringify(ed.getComponents()));
          localStorage.setItem('gjs-style', JSON.stringify(ed.getStyle()));
          localStorage.setItem('gjs-html', ed.getHtml());
          localStorage.setItem('gjs-css', ed.getCss());
        });
        setEditor(ed);
      } else {
        /* @ts-ignore */
        editor.setComponents(component);
        /* @ts-ignore */
        editor.setStyle(styling);
      }
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
