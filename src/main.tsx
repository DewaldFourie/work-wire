import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./contexts/AuthProvider.tsx";
import { ThemeProvider } from "./contexts/ThemeProvider.tsx";
import { SoundProvider } from "./contexts/SoundProvider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <SoundProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </SoundProvider>
    </ThemeProvider>
  </React.StrictMode>
);
