import React from 'react';
import { Table, Badge, Button, Dropdown } from 'react-bootstrap';

const UserRoleAssignment = ({ users, roles, onAddRole, onRemoveRole }) => {
  return (
    <div>
      <h4 className="mb-3">User Role Assignments</h4>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>User ID</th>
            <th>Email</th>
            <th>Current Roles</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>
                {user.roles?.map(role => (
                  <Badge key={role} bg="primary" className="me-1">
                    {role}
                    <Button 
                      variant="link" 
                      className="text-white p-0 ms-1"
                      onClick={() => onRemoveRole(user.id, role)}
                    >
                      ×
                    </Button>
                  </Badge>
                ))}
              </td>
              <td>
                <Dropdown>
                  <Dropdown.Toggle variant="outline-primary" size="sm">
                    Add Role
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {roles
                      .filter(role => !user.roles?.includes(role.name))
                      .map(role => (
                        <Dropdown.Item 
                          key={role.id}
                          onClick={() => onAddRole(user.id, role.id)}
                        >
                          {role.name}
                        </Dropdown.Item>
                      ))}
                  </Dropdown.Menu>
                </Dropdown>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default UserRoleAssignment;