import express from 'express';
import multer from 'multer';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
import { createFlashcardTable, insertFlashcard, getAllFlashcards } from './models/Flashcard.js';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5000;

app.use(cors());

const upload = multer({ dest: 'uploads/' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create Flashcards Table
createFlashcardTable();

// Define a simple GET route for the root URL
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Retry logic with exponential backoff
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
  // Print out information about the uploaded file for debugging
  console.log('File information:', req.file);

  // Check if file is uploaded and is of valid type
  const allowedTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
  if (!req.file || !allowedTypes.includes(req.file.mimetype)) {
    console.log('Invalid file type or no file uploaded');
    console.log('Detected MIME type:', req.file ? req.file.mimetype : 'undefined');
    return res.status(400).json({ error: 'Invalid file type. Only text, PDF, and PowerPoint files are allowed.' });
  }

  try {
    const filePath = path.join(__dirname, 'uploads', req.file.filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    console.log('File content read successfully.');

    // Use OpenAI API to generate flashcards from fileContent
    const response = await retryWithBackoff(() =>
      openai.completions.create({
        model: 'gpt-3.5-turbo',
        prompt: `Generate flashcards with questions and answers from the following text:\n\n${fileContent}`,
        max_tokens: 1000,
      })
    );
    console.log('OpenAI API request successful.');

    const flashcards = response.choices[0].text.trim().split('\n\n').map((flashcard) => {
      const [question, answer] = flashcard.split('\n');
      return { question: question.replace('Q: ', ''), answer: answer.replace('A: ', '') };
    });
    console.log('Flashcards generated successfully.');

    // Save flashcards to the database
    flashcards.forEach(({ question, answer }) => {
      insertFlashcard(question, answer);
    });

    fs.unlinkSync(filePath); // Clean up the uploaded file
    console.log('Uploaded file cleaned up successfully.');

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

app.get('/api/flashcards', (req, res) => {
  try {
    const flashcards = getAllFlashcards();
    res.json(flashcards);
  } catch (error) {
    console.error('Error retrieving flashcards:', error);
    res.status(500).json({ error: 'Error retrieving flashcards', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
