import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './SidebarLayout.css';

const SidebarLayout = ({ children }) => {
  return (
    <Container fluid className="sidebar-layout">
      <Row>
        <Col md={2} className="sidebar">
          <Nav className="flex-column">
            <Nav.Link as={Link} to="/create">Create</Nav.Link>
            <Nav.Link as={Link} to="/review">Review</Nav.Link>
          </Nav>
        </Col>
        <Col md={10} className="main-content">
          {children}
        </Col>
      </Row>
    </Container>
  );
};

export default SidebarLayout;
