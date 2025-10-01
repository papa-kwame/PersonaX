import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Modal,
  Button,
  Box,
  Typography,
  TextField,
  CircularProgress,
  Pagination,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  PersonCheck,
  PlusCircle,
  Trash,
  PencilSquare,
  People,
  Search,
  Person,
  Upload,
} from 'react-bootstrap-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Close, Visibility } from '@mui/icons-material';

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
    confirmPassword: '',
    isActive: true,
    department: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // License-related state
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [licenseViewModalOpen, setLicenseViewModalOpen] = useState(false);
  const [selectedUserForLicense, setSelectedUserForLicense] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);
  const [licenseImageUrl, setLicenseImageUrl] = useState(null);

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
      confirmPassword: '',
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
        confirmPassword: '',
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

    if (!editingUser && form.password !== form.confirmPassword) {
      toast.error('Password and Confirm Password do not match');
      return;
    }

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
          confirmPassword: form.confirmPassword,
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
    setUserToDelete(users.find((u) => u.id === id));
    setDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!isAdmin || !userToDelete) return;
    try {
      setBusy(true);
      await api.delete(`/api/Auth/users/${userToDelete.id}`);
      await loadUsers();
      toast.success('User deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setBusy(false);
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const cancelDeleteUser = () => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
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

  // License-related functions
  const openLicenseModal = (user) => {
    setSelectedUserForLicense(user);
    setLicenseFile(null);
    setLicenseModalOpen(true);
  };

  const closeLicenseModal = () => {
    setLicenseModalOpen(false);
    setSelectedUserForLicense(null);
    setLicenseFile(null);
  };

  const openLicenseViewModal = async (user) => {
    try {
      setSelectedUserForLicense(user);
      setBusy(true);
      
      // Get the license image URL
      const response = await api.get(`/api/Auth/license-image/${user.id}`, {
        responseType: 'blob'
      });
      
      const imageUrl = URL.createObjectURL(response.data);
      setLicenseImageUrl(imageUrl);
      setLicenseViewModalOpen(true);
    } catch (error) {
      toast.error('Failed to load license image');
    } finally {
      setBusy(false);
    }
  };

  const closeLicenseViewModal = () => {
    setLicenseViewModalOpen(false);
    setSelectedUserForLicense(null);
    if (licenseImageUrl) {
      URL.revokeObjectURL(licenseImageUrl);
      setLicenseImageUrl(null);
    }
  };

  const handleLicenseFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please select a valid image or PDF file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setLicenseFile(file);
    }
  };

  const uploadLicense = async () => {
    if (!licenseFile || !selectedUserForLicense) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      setBusy(true);
      const formData = new FormData();
      formData.append('licenseImage', licenseFile);

      await api.post(`/api/Auth/UploadLicenseImage?userId=${selectedUserForLicense.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('License uploaded successfully');
      closeLicenseModal();
      await loadUsers(); // Refresh user list to show updated license status
    } catch (error) {
      toast.error('Failed to upload license');
    } finally {
      setBusy(false);
    }
  };

  if (busy && users.length === 0)
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8}>
        <CircularProgress />
        <Typography mt={2}>Loading users...</Typography>
      </Box>
    );

  return (
    <Box py={4} px={{ xs: 1, sm: 4 }}>
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

      <Stack direction="row" alignItems="center" spacing={3} mb={4}>
        <Box sx={{ p: 2, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 1 }}>
          <People sx={{ color: 'primary.main', fontSize: 32 }} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={400} color="primary.main">User Management</Typography>
          <Typography color="text.secondary">Manage system users</Typography>
        </Box>
        <Box flexGrow={1} />
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
          sx={{ mr: 2, borderRadius: 4, background: '#f7fafd', minWidth: 200 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => openModal()}
          disabled={!isAdmin}
          sx={{ borderRadius: 3, px: 4, py: 1.5, fontWeight: 700, boxShadow: 2 }}
          startIcon={<People />}
        >
          Add User
        </Button>
      </Stack>

      {error && (
        <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 3, background: '#fff' }}>
          <Typography color="error" align="center">Error: {error}</Typography>
        </Paper>
      )}

      <Paper elevation={3} sx={{ borderRadius: 4, mb: 4, boxShadow: '0 2px 12px rgba(60,72,100,0.07)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ background: '#f5f7fa' }}>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>License</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentUsers.length ? (
                currentUsers.map((u) => (
                  <TableRow key={u.id} hover sx={{ borderRadius: 3, transition: 'background 0.2s' }}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{   fontWeight: 700 }}>
                          <Person />
                        </Avatar>
                        <Typography fontWeight={400}>{u.fullName || u.userName}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{u.email}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{u.phoneNumber || '-'}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{u.department || '-'}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 2,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: u.isActive ? '#e8f5e8' : '#ffeaea',
                          color: u.isActive ? '#2e7d32' : '#d32f2f',
                        }}
                      >
                        {u.isActive ? '🟢 Active' : '🔴 Inactive'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {u.licenseImagePath ? (
                          <IconButton 
                            onClick={() => openLicenseViewModal(u)} 
                            size="small" 
                            sx={{ color: 'primary.main' }}
                            title="View License"
                          >
                            <Visibility />
                          </IconButton>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            No License
                          </Typography>
                        )}
                        <IconButton 
                          onClick={() => openLicenseModal(u)} 
                          size="small" 
                          sx={{ color: 'secondary.main' }}
                          title="Upload License"
                        >
                          <Upload />
                        </IconButton>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => openModal(u)}
                          disabled={!isAdmin}
                          sx={{ borderRadius: 2, minWidth: 0, px: 2 }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => deleteUser(u.id)}
                          disabled={!isAdmin}
                          sx={{ borderRadius: 2, minWidth: 0, px: 2 }}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
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
            borderRadius: 4,
          }}
        >
          <Typography variant="h6" mb={2} fontWeight={700} color="primary.main">
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
              sx={{ borderRadius: 4, background: '#f7fafd' }}
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
              sx={{ borderRadius: 4, background: '#f7fafd' }}
            />
            <TextField
              label="Phone Number"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleInput}
              fullWidth
              margin="normal"
              sx={{ borderRadius: 4, background: '#f7fafd' }}
            />
            <TextField
              label="Department"
              name="department"
              value={form.department}
              onChange={handleInput}
              fullWidth
              margin="normal"
              sx={{ borderRadius: 4, background: '#f7fafd' }}
            />
            {!editingUser && (
              <>
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
                  sx={{ borderRadius: 4, background: '#f7fafd' }}
                />
                <TextField
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleInput}
                  fullWidth
                  margin="normal"
                  required
                  inputProps={{ minLength: 6 }}
                  sx={{ borderRadius: 4, background: '#f7fafd' }}
                />
              </>
            )}

            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={closeModal}
                sx={{ borderRadius: 2, px: 4, py: 1.2, fontWeight: 700 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                sx={{ borderRadius: 2, px: 4, py: 1.2, fontWeight: 700 }}
                disabled={busy}
              >
                {editingUser ? 'Update' : 'Create'}
              </Button>
            </Stack>
          </form>
        </Box>
      </Modal>

      <Modal open={deleteModalOpen} onClose={cancelDeleteUser}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 380,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 4,
          }}
        >
          <Typography variant="h6" mb={2} fontWeight={700} color="error.main">
            Confirm Deletion
          </Typography>
          <Typography mb={3} color="text.secondary">
            Are you sure you want to delete user{' '}
            <b>{userToDelete?.userName}</b>? This action cannot be undone.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              color="secondary"
              onClick={cancelDeleteUser}
              sx={{ borderRadius: 2, px: 4, py: 1.2, fontWeight: 700 }}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={confirmDeleteUser}
              sx={{ borderRadius: 2, px: 4, py: 1.2, fontWeight: 700 }}
              disabled={busy}
            >
              Delete
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* License Upload Modal */}
      <Modal open={licenseModalOpen} onClose={closeLicenseModal}>
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
            borderRadius: 4,
          }}
        >
          <Typography variant="h6" mb={2} fontWeight={700} color="primary.main">
            Upload License for {selectedUserForLicense?.fullName || selectedUserForLicense?.userName}
          </Typography>
          
          <Box mb={3}>
            <input
              accept="image/*,.pdf"
              style={{ display: 'none' }}
              id="license-file-input"
              type="file"
              onChange={handleLicenseFileChange}
            />
            <label htmlFor="license-file-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<Upload />}
                fullWidth
                sx={{ borderRadius: 2, py: 2 }}
              >
                {licenseFile ? licenseFile.name : 'Choose License File'}
              </Button>
            </label>
            {licenseFile && (
              <Typography variant="caption" display="block" mt={1} color="text.secondary">
                Selected: {licenseFile.name} ({(licenseFile.size / 1024 / 1024).toFixed(2)} MB)
              </Typography>
            )}
          </Box>

          <Typography variant="body2" color="text.secondary" mb={3}>
            Supported formats: JPG, PNG, GIF, PDF (Max 5MB)
          </Typography>

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              color="secondary"
              onClick={closeLicenseModal}
              sx={{ borderRadius: 2, px: 4, py: 1.2, fontWeight: 700 }}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={uploadLicense}
              sx={{ borderRadius: 2, px: 4, py: 1.2, fontWeight: 700 }}
              disabled={busy || !licenseFile}
            >
              {busy ? <CircularProgress size={20} /> : 'Upload'}
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* License View Modal */}
      <Dialog 
        open={licenseViewModalOpen} 
        onClose={closeLicenseViewModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={700}>
              License for {selectedUserForLicense?.fullName || selectedUserForLicense?.userName}
            </Typography>
            <IconButton onClick={closeLicenseViewModal}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {licenseImageUrl ? (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              {licenseImageUrl.toLowerCase().includes('pdf') ? (
                <iframe
                  src={licenseImageUrl}
                  width="100%"
                  height="500px"
                  title="License PDF"
                />
              ) : (
                <img
                  src={licenseImageUrl}
                  alt="License"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '500px',
                    objectFit: 'contain'
                  }}
                />
              )}
            </Box>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height="200px">
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeLicenseViewModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsers;
