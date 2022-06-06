import { InfoCard } from '@fremtind/jkl-card-react';
import {
  Tab, TabList, TabPanel, Tabs,
} from '@fremtind/jkl-tabs-react';
import '@fremtind/jkl-loader/loader.min.css';
import { Loader } from '@fremtind/jkl-loader-react';
import { TemplateFile } from '../../../types/templates';

interface PreviewPanelProps {
  template: TemplateFile | undefined
}

function renderTemplate(content: string) {
  return (
    <InfoCard>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </InfoCard>
  );
}

export default function PreviewPanel({ template }: PreviewPanelProps) {
  if (!template) {
    return (
      <Loader
        variant="large"
        textDescription="Loading preview"
      />
    );
  }
  const { front, back } = template;
  return (
    <Tabs>
      <TabList aria-label="tabs">
        <Tab>Front Preview</Tab>
        <Tab>Back Preview</Tab>
      </TabList>
      <TabPanel>
        {renderTemplate(front)}
      </TabPanel>
      <TabPanel>
        {renderTemplate(back)}
      </TabPanel>
    </Tabs>
  );
}
