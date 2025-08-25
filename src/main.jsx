import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import ReloadPrompt from "./components/ReloadPrompt.jsx"; // correct path

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    <ReloadPrompt /> {/* Show update prompt if new version is available */}
  </StrictMode>
);
