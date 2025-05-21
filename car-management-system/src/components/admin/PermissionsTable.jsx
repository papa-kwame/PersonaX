import React from 'react';
import { Table, Badge, Button } from 'react-bootstrap';

const PermissionTable = ({ permissions, roles, onPermissionUpdate }) => {
  const handleAddPermission = async (roleId, permissionId) => {
    await axios.post(`/api/roles/${roleId}/permissions/${permissionId}`);
    onPermissionUpdate();
  };

  const handleRemovePermission = async (roleId, permissionId) => {
    await axios.delete(`/api/roles/${roleId}/permissions/${permissionId}`);
    onPermissionUpdate();
  };

  return (
    <div>
      <h4 className="mb-3">Permissions Management</h4>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Permission</th>
            <th>Description</th>
            <th>Assigned Roles</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map(permission => (
            <tr key={permission.id}>
              <td><Badge bg="success">{permission.name}</Badge></td>
              <td>{permission.description}</td>
              <td>
                {permission.rolePermissions?.map(rp => (
                  <Badge key={rp.roleId} bg="info" className="me-1">
                    {rp.role?.name}
                  </Badge>
                ))}
              </td>
              <td>
                <div className="d-flex">
                  <select 
                    className="form-select me-2" 
                    onChange={(e) => handleAddPermission(e.target.value, permission.id)}
                  >
                    <option value="">Add to role...</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => {
                      // You might want to implement a way to select which role to remove from
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default PermissionTable;