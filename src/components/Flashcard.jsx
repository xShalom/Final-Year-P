import React, { useState } from 'react';
import './Flashcard.css';

const Flashcard = ({ question, answer, onResponse, onUpdate, isReviewMode }) => {
  const [flipped, setFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState(question);
  const [editedAnswer, setEditedAnswer] = useState(answer);

  const handleFlip = () => {
    if (!isEditing) {
      setFlipped(!flipped);
    }
  };

  const handleResponse = (difficulty) => {
    onResponse(difficulty);
    setFlipped(false); // Flip back to question side after response
  };

  const handleEditToggle = () => {
    if (isEditing) {
      onUpdate(editedQuestion, editedAnswer);
    }
    setIsEditing(!isEditing);
  };

  const formattedAnswer = answer
    .split('\n')
    .map(line => line.trim())
    .map((line, index) => line.startsWith('-') ? `<li key=${index}>${line.slice(1).trim()}</li>` : `<p key=${index}>${line}</p>`)
    .join('');

  return (
    <div className="flashcard-container">
      <div className={`flashcard ${flipped ? 'flipped' : ''}`}>
        <div className="flashcard-inner" onClick={handleFlip}>
          <div className="flashcard-front">
            <h2>Question</h2>
            {isEditing ? (
              <textarea
                value={editedQuestion}
                onChange={(e) => setEditedQuestion(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <p>{question}</p>
            )}
          </div>
          <div className="flashcard-back">
            <h2>Answer</h2>
            {isEditing ? (
              <textarea
                value={editedAnswer}
                onChange={(e) => setEditedAnswer(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: `<ul>${formattedAnswer}</ul>` }}></div>
            )}
          </div>
        </div>
      </div>
      <div className="flashcard-buttons">
        {!isReviewMode && (
          <>
            {isEditing ? (
              <button onClick={handleEditToggle}>Save</button>
            ) : (
              <button onClick={handleEditToggle}>Edit</button>
            )}
            {!isEditing && (
              <>
                <button onClick={() => handleResponse('easy')}>Easy</button>
                <button onClick={() => handleResponse('ok')}>Ok</button>
                <button onClick={() => handleResponse('hard')}>Hard</button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Flashcard;
