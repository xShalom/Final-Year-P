import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, ProgressBar, Alert, Spinner, Modal } from 'react-bootstrap';
import SidebarLayout from '../components/SidebarLayout';
import LogoutButton from '../components/LogoutButton';
import Flashcard from '../components/Flashcard';
import './CreatePage.css';

const CreatePage = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [reviewCounts, setReviewCounts] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [setName, setSetName] = useState('');

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
      setLoading(true);
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
      if (!generatedFlashcards || generatedFlashcards.length === 0) {
        setError('No flashcards were generated. Please check the file content.');
        setLoading(false);
        return;
      }

      const initialReviewCounts = generatedFlashcards.map(() => 0);
      console.log('Received flashcards:', generatedFlashcards);
      setFlashcards(shuffleArray(generatedFlashcards));
      setReviewCounts(initialReviewCounts);
      setUploadProgress(0); // Reset progress bar
      setLoading(false);
      setCurrentFlashcardIndex(0);
      setSessionCompleted(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Error uploading file. Please try again.');
      setUploadProgress(0); // Reset progress bar
      setLoading(false);
    }
  };

  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const handleResponse = (difficulty) => {
    const newReviewCounts = [...reviewCounts];
    const repetitions = {
      easy: 2,
      ok: 4,
      hard: 6
    };

    newReviewCounts[currentFlashcardIndex] += repetitions[difficulty];

    setReviewCounts(newReviewCounts);

    let nextIndex = currentFlashcardIndex;
    do {
      nextIndex = (nextIndex + 1) % flashcards.length;
    } while (newReviewCounts[nextIndex] >= 6 && nextIndex !== currentFlashcardIndex);

    if (newReviewCounts.every(count => count >= 6)) {
      setSessionCompleted(true);
    } else {
      setCurrentFlashcardIndex(nextIndex);
    }
  };

  const handleUpdate = (updatedQuestion, updatedAnswer) => {
    const updatedFlashcards = [...flashcards];
    updatedFlashcards[currentFlashcardIndex] = {
      question: updatedQuestion,
      answer: updatedAnswer,
    };
    setFlashcards(updatedFlashcards);
  };

  const handleSave = () => {
    setShowSaveModal(true);
  };

  const handleSaveSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/flashcards/save', {
        name: setName,
        flashcards
      });
      console.log(response.data.message);
      setShowSaveModal(false);
    } catch (error) {
      console.error('Error saving flashcards:', error);
      setError('Error saving flashcards. Please try again.');
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
        {loading && <Spinner animation="border" className="mt-3" />}
        {uploadProgress > 0 && <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} className="mt-3" />}
      </Form>
      <div className="flashcard-container">
        {sessionCompleted ? (
          <div className="completion-message">
            <h2>Congratulations! You've completed the session.</h2>
          </div>
        ) : (
          flashcards.length > 0 && (
            <Flashcard
              key={currentFlashcardIndex}
              question={flashcards[currentFlashcardIndex].question}
              answer={flashcards[currentFlashcardIndex].answer}
              onResponse={handleResponse}
              onUpdate={handleUpdate}
            />
          )
        )}
      </div>
      {flashcards.length > 0 && !loading && (
        <Button variant="success" className="mt-3" onClick={handleSave}>
          Save Flashcards
        </Button>
      )}
      <LogoutButton />
      <Modal show={showSaveModal} onHide={() => setShowSaveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Save</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="setName">
            <Form.Label>Set Name</Form.Label>
            <Form.Control
              type="text"
              value={setName}
              onChange={(e) => setSetName(e.target.value)}
              placeholder="Enter a name for your flashcard set"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSaveModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveSubmit}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </SidebarLayout>
  );
};

export default CreatePage;
