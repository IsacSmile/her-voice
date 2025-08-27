import React from "react";
import "../index.css";

export default function Header({ onFiles, message, onDeleteTrack, onClearAll }) {
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

      {/* <div style={{ marginTop: 10 }}>
        <button onClick={onClearAll} style={{ padding: "5px 10px", borderRadius: "7px" }}>
          Clear All
        </button>
      </div> */}

      {message && <p className="status-msg">{message}</p>}
    </header>
  );
}
