import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Container, Button } from 'react-bootstrap';
import './LoginPage.css';

const LoginPage = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="login-page">
      <Container className="text-center">
        <h1 className="login-title">Welcome to Flashcard Generator</h1>
        <p className="login-subtitle">Create and organize your flashcards with ease.</p>
        <div className="button-group">
          <Button
            variant="primary"
            size="lg"
            className="login-button"
            onClick={() => loginWithRedirect({ screen_hint: 'login' })}
          >
            Log In
          </Button>
          <Button
            variant="success"
            size="lg"
            className="signup-button"
            onClick={() => loginWithRedirect({ screen_hint: 'signup' })}
          >
            Sign Up
          </Button>
        </div>
      </Container>
    </div>    
  );
};

export default LoginPage;
