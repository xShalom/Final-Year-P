import express from 'express';
import multer from 'multer';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
import pdfParse from 'pdf-parse';
import officeparser from 'officeparser';
import db from './models/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

db.sequelize.sync().then(() => {
  console.log('Database synced');
}).catch((error) => {
  console.error('Error syncing database:', error);
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

const retryWithBackoff = async (fn, retries = 5, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0 || error.status !== 429) {
      throw error;
    }
    console.log(`Rate limit exceeded. Retrying in ${delay} ms...`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
};

app.post('/api/upload', upload.single('file'), async (req, res) => {
  console.log('File information:', req.file);

  const allowedTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
  if (!req.file || !allowedTypes.includes(req.file.mimetype)) {
    console.log('Invalid file type or no file uploaded');
    console.log('Detected MIME type:', req.file ? req.file.mimetype : 'undefined');
    return res.status(400).json({ error: 'Invalid file type. Only text, PDF, and PowerPoint files are allowed.' });
  }

  try {
    const filePath = path.join(__dirname, 'uploads', req.file.filename);
    let fileContent = '';

    if (req.file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      fileContent = pdfData.text;
    } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      const pptData = await new Promise((resolve, reject) => {
        officeparser.parsePpt(filePath, (data, err) => {
          if (err) {
            reject(new Error('Error parsing PPTX file'));
          } else {
            resolve(data.map(slide => slide.text).join('\n'));
          }
        });
      });
      fileContent = pptData;
    } else {
      fileContent = fs.readFileSync(filePath, 'utf-8');
    }

    console.log('File content read successfully.');

    const response = await retryWithBackoff(() =>
      openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that generates flashcards.' },
          { role: 'user', content: `Generate flashcards with questions and answers from the following text. Each question and answer should be formatted as "Question 1: ..." and "Answer 1: ...". Please ensure the format is strictly followed.\n\n${fileContent}` }
        ],
        max_tokens: 1000,
      })
    );
    console.log('OpenAI API request successful.');

    const messageContent = response.choices[0]?.message?.content.trim();
    if (!messageContent) {
      throw new Error('Received empty response from OpenAI API');
    }

    console.log('Response from OpenAI:', messageContent);

    const flashcards = [];
    const regex = /Question\s*\d+:\s*(.*?)\s*Answer\s*\d+:\s*([\s\S]*?)(?=Question\s*\d+:|$)/g;
    let match;

    while ((match = regex.exec(messageContent)) !== null) {
      const question = match[1].trim();
      const answer = match[2].trim().replace(/\n/g, '<br>');
      flashcards.push({ question, answer });
    }

    console.log('Parsed flashcards:', flashcards);

    if (flashcards.length === 0) {
      throw new Error('No flashcards were generated. Please check the file content.');
    }

    res.json({ flashcards });
  } catch (error) {
    console.error('Error processing file:', error);
    if (error.status === 429) {
      res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    } else if (error.code === 'EAI_AGAIN') {
      res.status(500).json({ error: 'DNS lookup failed. Please check your network settings.' });
    } else {
      res.status(500).json({ error: 'Error processing file', details: error.message });
    }
  }
});

app.post('/api/flashcards/save', async (req, res) => {
  const { name, flashcards } = req.body;

  try {
    const flashcardSet = await db.FlashcardSet.create({ name });

    const flashcardPromises = flashcards.map(({ question, answer }) => {
      return db.Flashcard.create({ question, answer, flashcardSetId: flashcardSet.id });
    });

    await Promise.all(flashcardPromises);

    console.log('Flashcards saved successfully.');
    res.status(200).json({ message: 'Flashcards saved successfully.' });
  } catch (error) {
    console.error('Error saving flashcards:', error);
    res.status(500).json({ error: 'Error saving flashcards', details: error.message });
  }
});

app.get('/api/flashcards', async (req, res) => {
  try {
    const flashcardSets = await db.FlashcardSet.findAll({
      include: {
        model: db.Flashcard,
        as: 'flashcards'
      }
    });
    res.json(flashcardSets);
  } catch (error) {
    console.error('Error retrieving flashcard sets:', error);
    res.status(500).json({ error: 'Error retrieving flashcard sets', details: error.message });
  }
});

app.get('/api/flashcards/:setId', async (req, res) => {
  const { setId } = req.params;
  try {
    const flashcardSet = await db.FlashcardSet.findByPk(setId, {
      include: {
        model: db.Flashcard,
        as: 'flashcards'
      }
    });

    if (!flashcardSet) {
      return res.status(404).json({ error: 'Flashcard set not found' });
    }

    res.json(flashcardSet);
  } catch (error) {
    console.error('Error retrieving flashcard set:', error);
    res.status(500).json({ error: 'Error retrieving flashcard set', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
