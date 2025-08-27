// src/components/Header.jsx

import React from "react";
import "../index.css";

export default function Header({ onFiles, message }) {
  return (
    <header className="app-header">
      <h2 className="tittle">Her_Voicee 💞</h2>

      {/* The original input is now hidden via CSS. We add an 'id' to link it to the label. */}
      <input
        type="file"
        id="file-upload"
        accept="audio/*"
        multiple
        onChange={onFiles}
        className="file-input" 
      />
      
      {/* This label is our new, custom button. Clicking it will open the file dialog. */}
      <label htmlFor="file-upload" className="custom-file-upload">
        Add Your Dezired Songs
      </label>

      {message && (
        <p className={`status-msg ${message.type}`}>
          {message.text}
        </p>
      )}
    </header>
  );
}