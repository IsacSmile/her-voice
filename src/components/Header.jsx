import React from "react";
import "../index.css"; // ✅ import global CSS

export default function Header({ onFiles, message }) {
  return (
    <header className="app-header">
      <h2 className="tittle">Her_Voicee 💞</h2>
      <input
        type="file"
        accept="audio/*"
        multiple
        onChange={onFiles}
        className="file-input"
      />
      {message && <p className="status-msg">{message}</p>}
    </header>
  );
}
