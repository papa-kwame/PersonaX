import { useState } from 'react';

const mockDepartments = ['Sales', 'Marketing', 'IT', 'Operations', 'Finance'];

export default function UserForm({ user = null }) {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    fullName: user?.fullName || '',
    email: user?.email || '',
    department: user?.department || '',
    isActive: user?.isActive || true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    };

  return (
    <div className="user-form">
      <h2>{user ? 'Edit User' : 'Add New User'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
          />
        </div>
        <div className="form-group">
          <label>Full Name:</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>
        <div className="form-group">
          <label>Department:</label>
          <select
            value={formData.department}
            onChange={(e) => setFormData({...formData, department: e.target.value})}
          >
            <option value="">Select Department</option>
            {mockDepartments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
            />
            Active User
          </label>
        </div>
        <button type="submit" className="btn-primary">Save</button>
      </form>
    </div>
  );
}