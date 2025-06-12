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
  FormControlLabel,
  CircularProgress,
  Pagination,
  InputAdornment,
} from '@mui/material';
import {
  PersonCheck,
  PlusCircle,
  Trash,
  PencilSquare,
  People,
  Search,
} from 'react-bootstrap-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
    department: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const loadUsers = async () => {
    try {
      setBusy(true);
      setError(null);
      const { data } = await api.get('/api/Auth/users');
      setUsers(data);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch users';
      setError(errorMsg);
      toast.error(errorMsg);
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
      department: '',
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
        department: user.department || '',
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

        await api.put(`/api/Auth/users/${editingUser.id}`, {
          userName: form.userName,
          email: form.email,
          phoneNumber: form.phoneNumber,
          department: form.department,
        });

        toast.success('User updated successfully');
      } else {
        await api.post('/api/Auth/register', {
          userName: form.userName,
          email: form.email,
          phoneNumber: form.phoneNumber,
          password: form.password,
          department: form.department,
        });
        toast.success('User created successfully');
      }
      await loadUsers();
      closeModal();
    } catch (err) {
      const msg =
        err.response?.data?.errors?.[0]?.description ||
        err.response?.data?.message ||
        'Operation failed';
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const deleteUser = async (id) => {
    if (!isAdmin) return;
    
    const confirmDelete = window.confirm('Are you sure you want to delete this user?');
    if (!confirmDelete) return;

    try {
      setBusy(true);
      await api.delete(`/api/Auth/users/${id}`);
      await loadUsers();
      toast.success('User deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
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
      toast.success('User lock status updated');
    } catch {
      toast.error('Failed to toggle lock status');
    } finally {
      setBusy(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const filteredUsers = users.filter((user) =>
    user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  if (busy && users.length === 0)
    return (
      <div className="text-center py-5">
        <CircularProgress />
        <p className="mt-2">Loading users...</p>
      </div>
    );

  return (
    <div className="py-4 px-4">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <div className="d-flex align-items-center mb-4">
        <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
          <People size={28} className="text-primary" />
        </div>
        <div>
          <h2 className="fw-bold mb-0">User Management</h2>
          <p className="text-muted mb-0">Manage system users</p>
        </div>
        <div className="ms-auto d-flex align-items-center">
          <TextField
            label="Search"
            variant="outlined"
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ mr: 2 }}
          />
          <button
            className="btn btn-primary d-flex align-items-center"
            onClick={() => openModal()}
            disabled={!isAdmin}
          >
            <PlusCircle className="me-2" /> Add User
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger text-center">Error: {error}</div>
      )}

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive rounded">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Department</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length ? (
                  currentUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                            <PersonCheck size={18} className="text-primary" />
                          </div>
                          <div>
                            <div className="fw-medium">{u.userName}</div>
                            <div className="small text-muted">
                              {u.isLocked ? (
                                <span className="text-danger">Inactive</span>
                              ) : (
                                <span className="text-success">Active</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-muted">{u.email}</td>
                      <td className="text-muted">{u.phoneNumber || '-'}</td>
                      <td className="text-muted">{u.department || '-'}</td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => openModal(u)}
                            disabled={!isAdmin}
                          >
                            <PencilSquare />
                          </button>
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
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </div>
      )}

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

            <TextField
              label="Department"
              name="department"
              value={form.department}
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