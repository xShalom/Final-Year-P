import { DataTypes } from 'sequelize';

const FlashcardSet = (sequelize) => {
  return sequelize.define('FlashcardSet', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'flashcard_sets',
  });
};

export default FlashcardSet;
