import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Modal,
  Button as MuiButton,
  Box,
  Typography,
  TextField,
  Switch,
  CircularProgress,
} from '@mui/material';
import {
  PersonCheck,
  PlusCircle,
  Trash,
  PencilSquare,
  People,
} from 'react-bootstrap-icons';
import 'bootstrap/dist/css/bootstrap.min.css';

const AdminUsers = () => {
  const { userRoles } = useAuth();
  const isAdmin = userRoles.includes('Admin');

  const [users, setUsers] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    userName: '',
    email: '',
    phoneNumber: '',
    password: '',
    isActive: true,
  });

  const loadUsers = async () => {
    try {
      setBusy(true);
      setError(null);
      const { data } = await api.get('/api/Auth/users');
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const resetForm = () =>
    setForm({
      userName: '',
      email: '',
      phoneNumber: '',
      password: '',
      isActive: true,
    });

  const openModal = (user = null) => {
    setEditingUser(user);
    if (user) {
      setForm({
        userName: user.userName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        password: '',
        isActive: !user.isLocked,
      });
    } else {
      resetForm();
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
    resetForm();
  };

  const handleInput = ({ target }) => {
    const { name, value, type, checked } = target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const saveUser = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (editingUser) {
        const willLock = !form.isActive && !editingUser.isLocked;
        const willUnlock = form.isActive && editingUser.isLocked;
        if (willLock || willUnlock) {
          await api.post(`/api/Auth/users/${editingUser.id}/lock`);
        }
        alert('User updated');
      } else {
        await api.post('/api/Auth/register', {
          userName: form.userName,
          email: form.email,
          phoneNumber: form.phoneNumber,
          password: form.password,
        });
        alert('User created');
      }
      await loadUsers();
      closeModal();
    } catch (err) {
      const msg =
        err.response?.data?.errors?.[0]?.description ||
        err.response?.data?.message ||
        'Operation failed';
      alert(msg);
    } finally {
      setBusy(false);
    }
  };

  const deleteUser = async (id) => {
    if (!isAdmin || !window.confirm('Delete user?')) return;
    try {
      setBusy(true);
      await api.delete(`/api/Auth/users/${id}`);
      await loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setBusy(false);
    }
  };

  const toggleLock = async (id) => {
    if (!isAdmin) return;
    try {
      setBusy(true);
      await api.post(`/api/Auth/users/${id}/lock`);
      await loadUsers();
    } catch {
      alert('Failed to toggle lock status');
    } finally {
      setBusy(false);
    }
  };

  if (busy && users.length === 0)
    return (
      <div className="text-center py-5">
        <CircularProgress />
        <p className="mt-2">Loading users...</p>
      </div>
    );

  if (error)
    return <div className="alert alert-danger text-center">Error: {error}</div>;

  return (
    <div className="py-4 px-4">
      <div className="d-flex align-items-center mb-4">
        <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
          <People size={28} className="text-primary" />
        </div>
        <div>
          <h2 className="fw-bold mb-0">User Management</h2>
          <p className="text-muted mb-0">Manage system users</p>
        </div>
        <div className="ms-auto">
          <button
            className="btn btn-primary d-flex align-items-center"
            onClick={() => openModal()}
            disabled={!isAdmin}
          >
            <PlusCircle className="me-2" /> Add User
          </button>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive rounded">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length ? (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                            <PersonCheck size={18} className="text-primary" />
                          </div>
                          <div>
                            <div className="fw-medium">{u.userName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-muted">{u.email}</td>
                      <td className="text-muted">{u.phoneNumber || '-'}</td>
                      <td>
                        <span
                          className={`badge ${
                            u.isLocked ? 'bg-danger' : 'bg-success'
                          }`}
                          style={{
                            cursor: isAdmin ? 'pointer' : 'default',
                          }}
                          onClick={() => isAdmin && toggleLock(u.id)}
                        >
                          {u.isLocked ? 'Locked' : 'Active'}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">

                          <button
                            className="btn btn-outline-danger"
                            onClick={() => deleteUser(u.id)}
                            disabled={!isAdmin}
                          >
                            <Trash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={closeModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 420,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" mb={2}>
            {editingUser ? 'Edit User' : 'Add New User'}
          </Typography>

          <form onSubmit={saveUser}>
            <TextField
              label="Username"
              name="userName"
              value={form.userName}
              onChange={handleInput}
              fullWidth
              margin="normal"
              required
              disabled={!!editingUser}
            />

            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleInput}
              fullWidth
              margin="normal"
              required
              disabled={!!editingUser}
            />

            <TextField
              label="Phone Number"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleInput}
              fullWidth
              margin="normal"
            />

            {!editingUser && (
              <TextField
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleInput}
                fullWidth
                margin="normal"
                required
                inputProps={{ minLength: 6 }}
              />
            )}

            {editingUser && (
              <FormControlLabel
                control={
                  <Switch
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleInput}
                    disabled={!isAdmin}
                  />
                }
                label={form.isActive ? 'Active' : 'Inactive'}
                sx={{ mt: 2 }}
              />
            )}

            <div className="d-flex justify-content-between mt-3">
              <MuiButton
                variant="outlined"
                color="secondary"
                onClick={closeModal}
              >
                Cancel
              </MuiButton>
              <MuiButton
                type="submit"
                variant="contained"
                color="primary"
                disabled={busy}
                startIcon={busy && <CircularProgress size={16} />}
              >
                {editingUser ? 'Update' : 'Create'}
              </MuiButton>
            </div>
          </form>
        </Box>
      </Modal>
    </div>
  );
};

export default AdminUsers;
