import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, ProgressBar, Alert } from 'react-bootstrap';
import SidebarLayout from '../components/SidebarLayout';
import LogoutButton from '../components/LogoutButton';
import './CreatePage.css';

const CreatePage = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];

    if (selectedFile && selectedFile.size <= 2000000 && allowedTypes.includes(selectedFile.type)) { // 2000kb = 2MB
      setFile(selectedFile);
      setError('');
    } else {
      setError('Invalid file type or file size should be less than 2MB');
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please upload a file');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      const generatedFlashcards = response.data.flashcards;
      setFlashcards(generatedFlashcards);
      setUploadProgress(0); // Reset progress bar
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Error uploading file. Please try again.');
      setUploadProgress(0); // Reset progress bar
    }
  };

  return (
    <SidebarLayout>
      <h1>Create Your Flashcards</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formFile">
          <Form.Label>Upload your notes (max 2MB)</Form.Label>
          <Form.Control type="file" onChange={handleFileChange} />
        </Form.Group>
        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        <Button variant="primary" type="submit" className="mt-3">
          Upload and Generate
        </Button>
        {uploadProgress > 0 && <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} className="mt-3" />}
      </Form>
      <div className="flashcards mt-5">
        {flashcards.map((card, index) => (
          <div key={index} className="flashcard">
            <h2>Question: {card.question}</h2>
            <p>Answer: {card.answer}</p>
          </div>
        ))}
      </div>
      <LogoutButton />
    </SidebarLayout>
  );
};

export default CreatePage;
