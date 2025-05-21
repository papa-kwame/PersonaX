import { useState, useEffect } from 'react';

const defaultRole = {
  name: '',
  description: '',
  isDefault: false,
  permissions: []
};

export default function RoleCreateModal({ isOpen, onClose, onCreate }) {
  const [role, setRole] = useState(defaultRole);

  useEffect(() => {
    if (isOpen) {
      setRole(defaultRole); 
    }
  }, [isOpen]);

  return (
    <div
      className={`modal fade ${isOpen ? 'show d-block' : ''}`}
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content shadow">
          <div className="modal-header">
            <h5 className="modal-title">Create New Role</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            />
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onCreate(role);
              onClose();
            }}
          >
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Role Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={role.name}
                  onChange={(e) => setRole({ ...role, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={role.description}
                  onChange={(e) =>
                    setRole({ ...role, description: e.target.value })
                  }
                />
              </div>
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isDefaultCheck"
                  checked={role.isDefault}
                  onChange={(e) =>
                    setRole({ ...role, isDefault: e.target.checked })
                  }
                />
                <label className="form-check-label" htmlFor="isDefaultCheck">
                  Default Role for New Users
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={role.name.trim() === ''}
              >
                Create Role
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
