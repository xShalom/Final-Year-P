import { DataTypes } from 'sequelize';

const Flashcard = (sequelize) => {
  return sequelize.define('Flashcard', {
    question: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    answer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
};

export default Flashcard;
