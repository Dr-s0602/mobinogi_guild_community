import React from 'react';
import './CharacterPanel.css';

function CharacterPanel({ 
  characters, 
  getCharacterColors, 
  getCharacterIcon, 
  getCharacterDisplay, 
  handleDragStart, 
  handleDragEnd,
  addCharacter,
  setShowListModal
}) {
  return (
    <div className="character-panel">
      <div className="icons-container">
        {characters.map((char, index) => (
          <div 
            key={char.id} 
            className="character-icon"
            draggable
            onDragStart={(e) => handleDragStart(e, char)}
            onDragEnd={handleDragEnd}
          >
            <div 
              className="icon-circle" 
              style={{ backgroundColor: getCharacterColors()[index] }}
            >
              {getCharacterIcon(char)}
            </div>
            <div className="icon-name">{getCharacterDisplay(char)}</div>
          </div>
        ))}
        {characters.length < 5 && (
          <div className="add-character-icon" onClick={addCharacter}>
            <div className="icon-circle add-circle">+</div>
            <div className="icon-name">추가</div>
          </div>
        )}
        <div className="settings-character-icon" onClick={() => setShowListModal(true)}>
          <div className="icon-circle settings-circle">⚙️</div>
          <div className="icon-name">설정</div>
        </div>
      </div>
    </div>
  );
}

export default CharacterPanel;