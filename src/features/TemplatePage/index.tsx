import { useCallback, useEffect, useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import '@fremtind/jkl-tabs/tabs.min.css';

import TemplateSelect from './components/TemplateSelect';
import TemplateFile from './model/TemplateFile';
import fetchBaseType from './components/fetchBaseType';
import { MainContent } from './components/styled';
import PreviewPanel from './components/PreviewPanel';

// Don't put in the render function, it gets recreated
let files: TemplateFile[] = [];

const options = {
  minimap: { enabled: false },
  colorDecorators: false,
};

function TemplatePage() {
  const [code, setCode] = useState('');
  const [isFront, setIsFront] = useState(true);
  const [isBack, setIsBack] = useState(false);
  const [isStyling, setIsStyling] = useState(false);
  const [language, setLanguage] = useState('html');

  const [currentCardType, setCurrentCardType] = useState(
    localStorage.getItem('current-card-type') || 'n2a-basic',
  );
  const [ready, setReady] = useState(false);

  const editorDidMount = (editor: { focus: () => void }) => {
    editor.focus();
  };

  const getCurrentCardType = useCallback(
    () => files.find((x) => x.storageKey === currentCardType),
    [currentCardType],
  );

  const onChange = (newValue: any) => {
    const card = getCurrentCardType();
    if (card) {
      if (isFront) {
        card.front = newValue;
      } else if (isBack) {
        card.back = newValue;
      } else if (isStyling) {
        card.styling = newValue;
      }
      localStorage.setItem(card.storageKey, JSON.stringify(card, null, 2));
    }
  };

  // Fetch the base presets from the server  or load from local storage (should only be called once)
  useEffect(() => {
    const fetchTemplates = async () => {
      files = [];
      const templateTypes = ['n2a-basic', 'n2a-input', 'n2a-cloze'];
      await Promise.all(
        templateTypes.map(async (name) => {
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

  // Switching to front from back or styling
  useEffect(() => {
    if (isFront) {
      const card = getCurrentCardType();
      if (card) {
        setLanguage('html');
        setCode(card.front);
      }
      setIsStyling(false);
      setIsBack(false);
    }
  }, [isFront, currentCardType, getCurrentCardType]);

  // Switching to back from front or styling
  useEffect(() => {
    if (isBack) {
      const card = getCurrentCardType();
      if (card) {
        setCode(card.back);
        setLanguage('html');
      }
      setIsStyling(false);
      setIsFront(false);
    }
  }, [getCurrentCardType, isBack]);

  useEffect(() => {
    if (isStyling) {
      setIsStyling(isStyling);
      setIsFront(false);
      setIsBack(false);
      const c = getCurrentCardType();
      if (c) {
        setCode(c.styling);
        setLanguage('css');
      }
    }
  }, [getCurrentCardType, isStyling]);

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
              <TemplateSelect
                values={files.map((f) => ({
                  label: f.name,
                  value: f.name,
                }))}
                value={currentCardType}
                pickedTemplate={(t) => {
                  setIsFront(true);
                  setCurrentCardType(t);
                }}
              />
            </div>
            <MonacoEditor
              height="512px"
              language={language}
              theme="vs-dark"
              value={code}
              options={options}
              onChange={onChange}
              editorDidMount={editorDidMount}
            />
          </>
        )}
      </div>
      <PreviewPanel template={getCurrentCardType()} />
    </MainContent>
  );
}

export default TemplatePage;
