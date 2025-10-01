import { useState, useEffect } from 'react';
import RolePermissionsMatrix from './RolePermissionsMatrix';
import RoleCloneModal from './RoleCloneModal';
import RoleCreateModal from './RoleCreateModal';

const defaultRole = {
  name: '',
  description: '',
  permissions: [],
  isDefault: false
};

export default function AdminRoles() {
  const [roles, setRoles] = useState([]);
  const [editingRole, setEditingRole] = useState(null);
  const [newRole, setNewRole] = useState({ ...defaultRole });
  const [permissionGroups, setPermissionGroups] = useState([]);
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [roleToClone, setRoleToClone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesRes, permissionsRes] = await Promise.all([
          fetch('/api/roles'),
          fetch('/api/permissions')
        ]);

        const rolesData = await rolesRes.json();
        const permissionsData = await permissionsRes.json();

        setRoles(rolesData);
        setPermissionGroups(permissionsData);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const togglePermission = (roleId, permission) => {
    setRoles(prev => prev.map(role => {
      if (role.id === roleId) {
        const newPermissions = role.permissions.includes(permission)
          ? role.permissions.filter(p => p !== permission)
          : [...role.permissions, permission];
        return { ...role, permissions: newPermissions };
      }
      return role;
    }));
  };

  const handleSaveRole = async () => {
    try {
      const method = editingRole ? 'PUT' : 'POST';
      const url = editingRole
        ? `/api/roles/${editingRole.id}`
        : '/api/roles';
  
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRole || newRole),
      });
  
      const savedRole = await response.json();
  
      setRoles(prev =>
        editingRole
          ? prev.map(r => r.id === savedRole.id ? savedRole : r)
          : [...prev, savedRole]
      );
  
      setEditingRole(null);
      setNewRole({ ...defaultRole });
    } catch (error) {
      }
  };

  const handleCloneRole = (sourceRoleId) => {
    const sourceRole = roles.find(r => r.id === sourceRoleId);
    if (sourceRole) {
      setNewRole({
        ...defaultRole,
        permissions: [...sourceRole.permissions]
      });
      setEditingRole(null);
      setCloneModalOpen(false);
    }
  };

  return (
    <div className="admin-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><i className="bi bi-person-badge me-2"></i> Role Management</h2>
        <div>
          <button
            className="btn btn-outline-primary me-2"
            onClick={() => setCloneModalOpen(true)}
          >
            <i className="bi bi-copy me-1"></i> Clone Role
          </button>
          <button
  className="btn btn-primary"
  onClick={() => {
    setCreateModalOpen(true);
  }}
>
  <i className="bi bi-plus-lg me-1"></i> New Role
</button>

        </div>
      </div>
      <RoleCreateModal
  isOpen={createModalOpen}
  onClose={() => setCreateModalOpen(false)}
  onCreate={(newRole) => {
    setEditingRole(null);
    setNewRole(newRole); // prefill
  }}
/>
      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                {editingRole ? 'Edit Role' : newRole.name ? 'New Role' : 'Roles'}
              </h5>
            </div>
            <div className="card-body">
              {(editingRole || newRole.name) ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveRole();
                }}>
                  <div className="mb-3">
                    <label className="form-label">Role Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingRole?.name || newRole.name}
                      onChange={(e) =>
                        editingRole
                          ? setEditingRole({ ...editingRole, name: e.target.value })
                          : setNewRole({ ...newRole, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={editingRole?.description || newRole.description}
                      onChange={(e) =>
                        editingRole
                          ? setEditingRole({ ...editingRole, description: e.target.value })
                          : setNewRole({ ...newRole, description: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={editingRole?.isDefault || newRole.isDefault}
                      onChange={(e) =>
                        editingRole
                          ? setEditingRole({ ...editingRole, isDefault: e.target.checked })
                          : setNewRole({ ...newRole, isDefault: e.target.checked })
                      }
                      id="defaultRoleCheck"
                    />
                    <label className="form-check-label" htmlFor="defaultRoleCheck">
                      Default Role for New Users
                    </label>
                  </div>
                  <div className="d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-outline-secondary me-2"
                      onClick={() => {
                        setEditingRole(null);
                        setNewRole({ ...defaultRole });
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingRole ? 'Update' : 'Create'} Role
                    </button>
                  </div>
                </form>
              ) : (
                <div className="list-group list-group-flush">
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : roles.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      No roles found
                    </div>
                  ) : (
                    roles.map(role => (
                      <button
                        key={role.id}
                        className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${editingRole?.id === role.id ? 'active' : ''}`}
                        onClick={() => {
                          setEditingRole(role);
                          setNewRole({ ...defaultRole });
                        }}
                      >
                        <div>
                          <div className="fw-bold">{role.name}</div>
                          <small className="text-muted">{role.description}</small>
                        </div>
                        {role.isDefault && (
                          <span className="badge bg-primary">Default</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Permission Management</h5>
              {editingRole && (
                <div className="d-flex align-items-center">
                  <span className="badge bg-primary me-2">
                    {editingRole.permissions.length} permissions
                  </span>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="selectAllToggle"
                      checked={editingRole.permissions.length === getAllPermissionCount()}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditingRole({
                            ...editingRole,
                            permissions: getAllPermissions()
                          });
                        } else {
                          setEditingRole({
                            ...editingRole,
                            permissions: []
                          });
                        }
                      }}
                    />
                    <label className="form-check-label" htmlFor="selectAllToggle">
                      Select All
                    </label>
                  </div>
                </div>
              )}
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : !editingRole && !newRole.name ? (
                <div className="text-center py-4 text-muted">
                  Select or create a role to manage permissions
                </div>
              ) : (
                <div className="permission-groups">
                  {permissionGroups.map((group) => (
                    <div key={group.id} className="permission-group mb-4">
                      <div className="group-header d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">
                          <i className="bi bi-folder2-open me-2"></i>
                          {group.name}
                        </h6>
                        <small className="text-muted">
                          {getSelectedCount(group)}/{group.permissions.length} selected
                        </small>
                      </div>
                      <RolePermissionsMatrix
                        permissions={group.permissions}
                        selectedPermissions={editingRole?.permissions || newRole.permissions}
                        onToggle={(permission) => {
                          if (editingRole) {
                            setEditingRole({
                              ...editingRole,
                              permissions: toggleArrayItem(editingRole.permissions, permission)
                            });
                          } else {
                            setNewRole({
                              ...newRole,
                              permissions: toggleArrayItem(newRole.permissions, permission)
                            });
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <RoleCloneModal
        isOpen={cloneModalOpen}
        roles={roles.filter(r => !r.isDefault)}
        onClose={() => setCloneModalOpen(false)}
        onClone={handleCloneRole}
      />
    </div>
  );

  function getSelectedCount(group) {
    const selected = editingRole?.permissions || newRole.permissions;
    return group.permissions.filter(p => selected.includes(p.id)).length;
  }

  function getAllPermissions() {
    return permissionGroups.flatMap(g => g.permissions.map(p => p.id));
  }

  function getAllPermissionCount() {
    return permissionGroups.reduce((sum, g) => sum + g.permissions.length, 0);
  }

  function toggleArrayItem(array, item) {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  }
}
