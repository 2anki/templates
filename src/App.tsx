import React, { useEffect, useState } from "react";
import TemplateEditor from "./components/TemplateEditor/TemplateEditor";
import TemplateApiService from "./services/TemplateApiService";
import "./App.css";

function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const apiService = TemplateApiService.getInstance();
    apiService.checkAuth().then((isAuthed) => {
      if (!isAuthed) {
        const loginUrl =
          window.location.hostname === "localhost"
            ? "http://localhost:3000/login"
            : "https://2anki.net/login";
        window.location.href = loginUrl;
        return;
      }
      setAuthenticated(true);
      setAuthChecked(true);
    });
  }, []);

  if (!authChecked || !authenticated) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <p>Checking authentication…</p>
      </div>
    );
  }

  return <TemplateEditor />;
}

export default App;
