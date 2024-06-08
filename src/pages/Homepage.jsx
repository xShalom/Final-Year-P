import React from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { Button, Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import LogoutButton from '../components/LogoutButton';
import './Homepage.css';


const HomePage = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();
  console.log(user)
  if (isLoading) {
    return <div>Loading ...</div>;
  }
 if(!isAuthenticated){
  navigate('/');
  return null;
 }
  return (
<div className="homepage">
      <Container fluid className="hero-section text-center">
        <h1 className="hero-title">Welcome to Flashcard Generator</h1>
        <p className="hero-subtitle">Create and organize your flashcards with ease.</p>
        <Button variant="primary" size="lg" onClick={() => navigate('/create')}>
          Get Started
        </Button>
      </Container>
      <Container fluid className="features-section">
        <Row className="justify-content-center">
          <Col md={4}>
            <Card className="feature">
              <Card.Body>
                <Card.Title>Automatic Flashcard Generation</Card.Title>
                <Card.Text>
                  Generate flashcards automatically based on your input text using advanced AI technology.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="feature">
              <Card.Body>
                <Card.Title>Organize and Manage</Card.Title>
                <Card.Text>
                  Easily organize your flashcards into different categories for efficient study sessions.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="feature">
              <Card.Body>
                <Card.Title>Interactive Learning</Card.Title>
                <Card.Text>
                  Review your flashcards with our interactive tools and track your learning progress.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <LogoutButton />
    </div>
  );
};


export default HomePage;
