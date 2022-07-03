import { useCallback, useEffect, useState } from 'react';
import '@fremtind/jkl-tabs/tabs.min.css';

import TemplateSelect from './components/TemplateSelect';
import fetchBaseType from './components/fetchBaseType';
import { MainContent } from './components/styled';
import PreviewPanel from './components/PreviewPanel';
import { CardTypes, TemplateTypes, TemplateFile } from '../../types/templates';

// Don't put in the render function, it gets recreated
let files: TemplateFile[] = [];

function TemplatePage() {
  const [, setCode] = useState('');
  const [, setLanguage] = useState('html');
  const [openFile, setOpenFile] = useState('front');

  const [currentCardType, setCurrentCardType] = useState(
    localStorage.getItem('current-card-type') || 'n2a-basic',
  );
  const [ready, setReady] = useState(false);

  const getCurrentCardType = useCallback(
    () => files.find((x) => x.storageKey === currentCardType),
    [currentCardType],
  );

  // Fetch the base presets from the server  or load from local storage (should only be called once)
  useEffect(() => {
    const fetchTemplates = async () => {
      files = [];
      await Promise.all(
        [CardTypes.Basic, CardTypes.Input, CardTypes.Cloze].map(async (name) => {
          const local = localStorage.getItem(name);
          if (local) {
            files.push(JSON.parse(local));
          } else {
            const remote = await fetchBaseType(name);
            files.push(remote);
            localStorage.setItem(name, JSON.stringify(remote, null, 2));
          }
        }),
      );
      setReady(true);
      setLanguage('html');
      // Use the first basic front template as default file to load.
      // We might want to change this later to perserve last open file.
      setCode(files[0].front);
    };
    fetchTemplates();
  }, []);

  useEffect(() => {
    const card = getCurrentCardType();
    if (!card) {
      return;
    }
    switch (openFile) {
      case 'styling':
        setLanguage('css');
        setCode(card.styling);
        break;
      case 'back':
        setLanguage('html');
        setCode(card.back);
        break;
      default:
        setLanguage('html');
        setCode(card.front);
    }
  }, [openFile, currentCardType, getCurrentCardType]);
  return (
    <MainContent>
      <h1>Template Manager</h1>
      <div className="container">
        {!ready && <p>Loading....</p>}
        {ready && (
          <>
            <p className="title" />
            <hr />
            <p className="subtitle">
              No saving required, everything is saved instantly! You can always
              revert the template changes in the
              {' '}
              <a href="https://2anki.net/upload?view=template">settings</a>
              . Adding /
              removing fields and preview is coming soon.
            </p>
            <div className="field is-horizontal">
              <div className="field-body">
                <div className="field">
                  <TemplateSelect
                    values={files.map((f) => ({
                      label: f.name,
                      value: f.name,
                    }))}
                    value={currentCardType}
                    pickedTemplate={(t) => {
                      setOpenFile(TemplateTypes.Front);
                      setCurrentCardType(t);
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <PreviewPanel template={getCurrentCardType()} />
    </MainContent>
  );
}

export default TemplatePage;
