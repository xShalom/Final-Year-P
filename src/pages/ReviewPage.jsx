import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/SidebarLayout';
import Flashcard from '../components/Flashcard';
import '../pages/ReviewPage.css'; 

const ReviewPage = () => {
    const [flashcardSets, setFlashcardSets] = useState([]);
    const [selectedFlashcardSet, setSelectedFlashcardSet] = useState(null);
    const [flashcards, setFlashcards] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFlashcardSets = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/flashcards');
                setFlashcardSets(response.data);
            } catch (error) {
                console.error('Error fetching flashcard sets:', error);
            }
        };
        fetchFlashcardSets();
    }, []);

    const handleSetClick = async (setId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/flashcards/${setId}`);
            setSelectedFlashcardSet(response.data);
            setFlashcards(response.data.flashcards);
        } catch (error) {
            console.error('Error fetching flashcards:', error);
        }
    };

    return (
        <SidebarLayout>
            <div className="review-page">
                <h1>Review Your Flashcards</h1>
                <p>Select a flashcard set to review its flashcards.</p>
                <div className="flashcard-sets">
                    {flashcardSets.map((set) => (
                        <button key={set.id} onClick={() => handleSetClick(set.id)}>
                            {set.name}
                        </button>
                    ))}
                </div>
                {selectedFlashcardSet && (
                    <div className="flashcard-container">
                        {flashcards.map((flashcard) => (
                            <Flashcard
                                key={flashcard.id}
                                question={flashcard.question}
                                answer={flashcard.answer}
                            />
                        ))}
                    </div>
                )}
            </div>
        </SidebarLayout>
    );
};

export default ReviewPage;
