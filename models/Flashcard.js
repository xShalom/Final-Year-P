import db from '../db.js'; // Make sure the path and file extension are correct

const createFlashcardTable = () => {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS flashcards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL
    )
  `).run();
};

const insertFlashcard = (question, answer) => {
  db.prepare('INSERT INTO flashcards (question, answer) VALUES (?, ?)').run(question, answer);
};

const getAllFlashcards = () => {
  return db.prepare('SELECT * FROM flashcards').all();
};

export { createFlashcardTable, insertFlashcard, getAllFlashcards };
