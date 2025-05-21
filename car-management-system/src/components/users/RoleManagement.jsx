const mockRoles = ['Admin', 'Manager', 'FleetManager', 'Driver', 'Mechanic'];

export default function RoleManagement() {
  return (
    <div className="role-management">
      <h2>Role Management</h2>
      <div className="roles-list">
        {mockRoles.map(role => (
          <div key={role} className="role-item">
            <h3>{role}</h3>
            <div className="permissions">
              <label>
                <input type="checkbox" /> View Vehicles
              </label>
              <label>
                <input type="checkbox" /> Manage Vehicles
              </label>
              <label>
                <input type="checkbox" /> Assign Vehicles
              </label>
              <label>
                <input type="checkbox" /> Manage Maintenance
              </label>
              <label>
                <input type="checkbox" /> Manage Users
              </label>
            </div>
          </div>
        ))}
      </div>
      <button className="btn-primary">Save Permissions</button>
    </div>
  );
}