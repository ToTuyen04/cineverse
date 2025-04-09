import React from 'react'
import { Button, Container, Row, Col } from 'react-bootstrap'

export default function Backgroundjob() {
  const redirectToHangfire = () => {
    window.open("https://cinemamanagement.azurewebsites.net/hangfire", "_blank");
  }

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8} className="text-center">
          <h2 className="mb-4">Background Job Dashboard</h2>
          <p className="mb-4">Click the button below to access the Hangfire dashboard for monitoring background jobs.</p>
          <Button 
            variant="primary" 
            size="lg" 
            onClick={redirectToHangfire}
            className="px-4 py-2"
          >
            Open Hangfire Dashboard
          </Button>
        </Col>
      </Row>
    </Container>
  )
}
