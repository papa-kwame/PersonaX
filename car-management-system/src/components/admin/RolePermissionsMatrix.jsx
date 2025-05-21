import { useMemo } from 'react';

export default function RolePermissionsMatrix({ 
  permissions, 
  selectedPermissions, 
  onToggle 
}) {
  const groupedPermissions = useMemo(() => {
    const groups = {};
    permissions.forEach(perm => {
      const [category] = perm.id.split(':');
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(perm);
    });
    return Object.entries(groups);
  }, [permissions]);

  return (
    <div className="permission-matrix">
      {groupedPermissions.map(([category, perms]) => (
        <div key={category} className="permission-category">
          <h6 className="category-title">{category.toUpperCase()}</h6>
          <div className="permission-items">
            {perms.map(permission => (
              <div 
                key={permission.id} 
                className={`permission-item ${selectedPermissions.includes(permission.id) ? 'selected' : ''}`}
                onClick={() => onToggle(permission.id)}
              >
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={selectedPermissions.includes(permission.id)}
                    onChange={() => {}}
                  />
                  <label className="form-check-label">
                    <span className="permission-name">{permission.name}</span>
                    <small className="permission-id">{permission.id}</small>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}