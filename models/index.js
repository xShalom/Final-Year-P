import { Sequelize } from 'sequelize';
import FlashcardSet from './FlashcardSet.js';
import Flashcard from './Flashcard.js';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
});

const db = {
  Sequelize,
  sequelize,
  FlashcardSet: FlashcardSet(sequelize),
  Flashcard: Flashcard(sequelize),
};

db.FlashcardSet.hasMany(db.Flashcard, { as: 'flashcards', foreignKey: 'flashcardSetId' });
db.Flashcard.belongsTo(db.FlashcardSet, { as: 'flashcardSet', foreignKey: 'flashcardSetId' });

export default db;
