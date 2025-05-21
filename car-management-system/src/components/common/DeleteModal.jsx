import React from 'react';
import { Modal, Button } from 'react-bootstrap';

export default function DeleteModal({ show, onHide, onConfirm, itemName }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Deletion</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>Are you sure you want to delete <strong>{itemName}</strong>?</p>
        <p>This action cannot be undone.</p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Yes, Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
