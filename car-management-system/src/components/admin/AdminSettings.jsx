export default function AdminSettings() {
  return (
    <div className="admin-container">
      <h2><i className="bi bi-gear me-2"></i> System Settings</h2>
      
      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">General Settings</h5>
            </div>
            <div className="card-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">Application Name</label>
                  <input type="text" className="form-control" defaultValue="My Admin Panel" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Timezone</label>
                  <select className="form-select">
                    <option>UTC</option>
                    <option selected>Local Time</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">Email Settings</h5>
            </div>
            <div className="card-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">SMTP Host</label>
                  <input type="text" className="form-control" />
                </div>
                <div className="mb-3">
                  <label className="form-label">SMTP Port</label>
                  <input type="number" className="form-control" />
                </div>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}