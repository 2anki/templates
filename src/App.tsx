import '@fremtind/jkl-core/core.min.css';

import TemplatePage from './features/TemplatePage';

function App() {
  return (
    <div className="jkl" id="app">
      <TemplatePage />
      <div id="preview-pane" />
    </div>
  );
}

export default App;
