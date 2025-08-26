import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import ReloadPrompt from "./components/ReloadPrompt.jsx"; // Make sure this uses vite-plugin-pwa hook

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    <ReloadPrompt /> {/* Shows update prompt when a new service worker is available */}
  </StrictMode>
);
