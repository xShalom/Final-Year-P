// Auth0Button.jsx
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from 'react-bootstrap';

const Auth0Button = () => {
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0();

  return (
    <>
      {isAuthenticated ? (
        <Button onClick={() => logout({ returnTo: window.location.origin })}>
          Log Out
        </Button>
      ) : (
        <Button onClick={() => loginWithRedirect()}>
          Log In / Sign Up
        </Button>
      )}
    </>
  );
};

export default Auth0Button;
