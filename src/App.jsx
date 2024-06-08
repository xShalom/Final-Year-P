import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Header from './components/Header';
import HomePage from './pages/Homepage';
import LoginPage from './pages/LoginPage';
import CreatePage from './pages/CreatePage';
import ReviewPage from './pages/ReviewPage';
import './index.css'
import './App.css'

const App = () => {
  const { isAuthenticated } = useAuth0();

  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/home" element={<HomePage/>}/>
          <Route path="/create" element={isAuthenticated ? <CreatePage /> : <LoginPage />} />
          <Route path="/review" element={isAuthenticated ? <ReviewPage /> : <LoginPage />} />
          {/* Add other routes here */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
