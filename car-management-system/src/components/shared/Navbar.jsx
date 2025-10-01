import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  Divider, 
  Avatar, 
  Box,
  Modal,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Button,
  useTheme,
  useMediaQuery,
  Badge,
  Drawer,
  ButtonGroup,
  Tabs,
  Tab,
  Stack,
  Snackbar
} from '@mui/material';
import { 
  AccountCircle, 
  Settings, 
  Notifications, 
  ExitToApp,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as DepartmentIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Badge as BadgeIcon,
  Refresh,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Close,
  Upload,
  Edit as EditIcon,
  Edit as UploadIcon,

} from '@mui/icons-material';
import logo from "../../../src/assets/persol.png";
import ico from "../../assets/icon-img.jpg";
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ActivityIndicator from './ActivityIndicator';

export default function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [licenseImageUrl, setLicenseImageUrl] = useState(null);
  const [licenseLoading, setLicenseLoading] = useState(false);
  const [licenseError, setLicenseError] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const { user, logout, userEmail, username, userId } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const open = Boolean(anchorEl);
  const [notificationTrayOpen, setNotificationTrayOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifTab, setNotifTab] = useState('unread'); // 'unread' | 'read' | 'all'
  const [pendingActions, setPendingActions] = useState([]);
  const [toast, setToast] = useState({ open: false, message: '' });
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
  const [avatarHover, setAvatarHover] = useState(false);
  const [editPhotoModalOpen, setEditPhotoModalOpen] = useState(false);
  const [deletePhotoModalOpen, setDeletePhotoModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

const handleEditPhotoClick = () => {
  setEditPhotoModalOpen(true);
  setAvatarHover(false);
};

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = async () => {
    handleClose();
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/api/Auth/users/${userId}`);
      setProfileData(response.data);
      setProfileModalOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch profile data');
      } finally {
      setLoading(false);
    }
  };

  const handleProfileModalClose = () => {
    setProfileModalOpen(false);
    setError(null);
  };

  const handleRetry = () => {
    setError(null);
    handleProfileClick();
  };

  const handleViewLicense = async () => {
    setLicenseLoading(true);
    setLicenseError(null);
    try {
      const response = await api.get(`/api/Auth/license-image/${userId}`, {
        responseType: 'blob'
      });
      const imageUrl = URL.createObjectURL(response.data);
      setLicenseImageUrl(imageUrl);
      setLicenseModalOpen(true);
    } catch (err) {
      setLicenseError('No license image found or failed to load license');
      } finally {
      setLicenseLoading(false);
    }
  };

  const fetchProfilePhoto = async () => {
  try {
    const response = await api.get(`/api/Auth/profile-image/${userId}`, {
      responseType: 'blob',
    });
    const imageUrl = URL.createObjectURL(response.data);
    setProfilePhotoUrl(imageUrl);
  } catch (err) {
    // 404 is expected when user has no profile picture
    // Don't log this as an error to avoid console spam
    if (err.response?.status !== 404) {
      console.warn('Failed to fetch profile photo:', err.message);
    }
    // Keep profilePhotoUrl as null/undefined to show default avatar
  }
};

    const handleViewProfilePhoto = async () => {
    setLicenseLoading(true);
    setLicenseError(null);
    try {
      const response = await api.get(`/api/Auth/profile-image/${userId}`, {
        responseType: 'blob'
      });
      const imageUrl = URL.createObjectURL(response.data);
      setLicenseImageUrl(imageUrl);
      setLicenseModalOpen(true);
    } catch (err) {
      setLicenseError('No profile image found or failed to load license');
      } finally {
      setLicenseLoading(false);
    }
  };
const handleDeletePhoto = async () => {
  setIsDeleting(true);
  try {
    await api.delete(`/api/Auth/DeleteProfileImage?userId=${userId}`);
    setProfilePhotoUrl(null);
    setToast({ open: true, message: 'Profile photo deleted successfully.' });
  } catch (err) {
    setToast({ open: true, message: 'Failed to delete profile photo.' });
  } finally {
    setIsDeleting(false);
    setDeletePhotoModalOpen(false);
  }
};

  const handleLicenseModalClose = () => {
    setLicenseModalOpen(false);
    setLicenseError(null);
    if (licenseImageUrl) {
      URL.revokeObjectURL(licenseImageUrl);
      setLicenseImageUrl(null);
    }
  };

  const handleUploadClick = () => {
    setUploadModalOpen(true);
    setUploadError(null);
    setUploadSuccess(false);
    setSelectedFile(null);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Please select a valid file type (JPG, PNG, GIF, or PDF)');
        return;
      }
      
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload');
      return;
    }

    setUploadLoading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('licenseImage', selectedFile);

      await api.post(`/api/Auth/UpdateLicenseImage?userId=${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadSuccess(true);
      setUploadLoading(false);
      
      // Close upload modal and refresh license view
      setTimeout(() => {
        setUploadModalOpen(false);
        setUploadSuccess(false);
        setSelectedFile(null);
        // Refresh the license view
        handleViewLicense();
      }, 2000);
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload license');
      setUploadLoading(false);
    }
  };

  const handleUploadModalClose = () => {
    setUploadModalOpen(false);
    setUploadError(null);
    setUploadSuccess(false);
    setSelectedFile(null);
  };

  const fetchNotifications = async () => {
    setNotifLoading(true);
    setNotifError(null);
    try {
      const res = await api.get(`/api/Notifications?userId=${userId}`);
      setNotifications(res.data);
    } catch (err) {
      setNotifError('Failed to load notifications');
    } finally {
      setNotifLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get(`/api/Notifications/unread-count?userId=${userId}`);
      setUnreadCount(res.data.count);
    } catch {
      setUnreadCount(0);
    }
  };

  const fetchPendingActions = async () => {
    try {
      const res = await api.get(`/api/MaintenanceRequest/my-pending-actions?userId=${userId}`);
      setPendingActions(res.data);
    } catch {
      setPendingActions([]);
    }
  };

  const handleNotificationsClick = async () => {
    handleClose();
    setNotificationTrayOpen(true);
    await fetchNotifications();
    await fetchUnreadCount();
    await fetchPendingActions();
  };

  const handleNotificationTrayClose = () => {
    setNotificationTrayOpen(false);
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      await api.post(`/api/Notifications/${notifId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Optionally show error
    }
  };

  const handleNotificationClick = async (notif) => {
    // Only handle Maintenance notifications
    if (notif.type !== 'Maintenance') return;
    if (notif.relatedEntityId) {
      const exists = pendingActions.some(r => String(r.id) === String(notif.relatedEntityId));
      if (exists) {
        window.location.href = `/maintenance?highlight=${notif.relatedEntityId}`;
        setNotificationTrayOpen(false);
      } else {
        await handleMarkAsRead(notif.id);
        setToast({ open: true, message: 'This request has already been processed.' });
      }
    }
  };

  const filteredNotifications = notifications.filter(n =>
    notifTab === 'all' ? true :
    notifTab === 'unread' ? !n.isRead :
    n.isRead
  );

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    await Promise.all(unreadIds.map(id => handleMarkAsRead(id)));
  };

  // Add this handler for soft deleting a notification
  const handleDeleteNotification = async (notifId) => {
    try {
      await api.softDeleteNotification(notifId);
      setNotifications((prev) => prev.filter((n) => n.id !== notifId));
      setToast({ open: true, message: 'Notification deleted.' });
      // Optionally update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setToast({ open: true, message: 'Failed to delete notification.' });
    }
  };

  const handleDeleteAllNotifications = async () => {
    if (!window.confirm('Are you sure you want to delete all notifications? This cannot be undone.')) return;
    try {
      await Promise.all(notifications.map(n => api.softDeleteNotification(n.id)));
      setNotifications([]);
      setUnreadCount(0);
      setToast({ open: true, message: 'All notifications deleted.' });
    } catch (err) {
      setToast({ open: true, message: 'Failed to delete all notifications.' });
    }
  };

  React.useEffect(() => {
  if (userId) {
    fetchProfilePhoto();
  }
}, [userId]);

  React.useEffect(() => {
    if (userId) fetchUnreadCount();
  }, [userId]);

  // Poll for notifications and pending actions every 30 seconds
  React.useEffect(() => {
    if (!userId) return;
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
      fetchPendingActions();
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <>
      <AppBar position="static" sx={{ 
        backgroundColor: 'black',
        boxShadow: 'none',
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Toolbar sx={{ 
          minHeight: { xs: 56, sm: 64 },
          paddingX: { xs: 2, sm: 3 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
              <img src={logo} alt="Logo" style={{ height: '25px' }} />
            </Link>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ActivityIndicator />

            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
              sx={{
                p:0,
                border: `1px solid ${theme.palette.grey[700]}`,
                '&:hover': {
                  backgroundColor: theme.palette.grey[800]
                }
              }}
            >
            <Avatar
              alt="Profile"
              src={profilePhotoUrl}
              sx={{
                width: 40,
                height: 40,
                backgroundColor: theme.palette.grey[700]
              }}
            />

            </IconButton>
            <IconButton
              size="large"
              aria-label="show notifications"
              onClick={handleNotificationsClick}
              color="inherit"
              sx={{
                border: `1px solid ${theme.palette.grey[700]}`,
                background: 'rgba(255,255,255,0.02)',
                mr: 1,
                '&:hover': {
                  backgroundColor: theme.palette.grey[800]
                }
              }}
            >
              <Badge
                color="error"
                badgeContent={unreadCount}
                overlap="circular"
                invisible={unreadCount === 0}
              >
                <Notifications />
              </Badge>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={open}
              onClose={handleClose}
              PaperProps={{
                elevation: 3,
                sx: {
                  width: 320,
                  maxWidth: '100%',
                  mt: 1,
                  borderRadius: 2,
                  overflow: 'visible',
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                }
              }}
            >
              <Box sx={{ 
                p: 2, 
                display: 'flex', 
                alignItems: 'center',
                backgroundColor: theme.palette.grey[100]
              }}>
<Avatar
  alt="Profile"
  src={profilePhotoUrl}
  sx={{
    width: 45,
    height: 45,
    backgroundColor: theme.palette.grey[700],
    marginRight:2
  }}
/>

                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {username || "John Doe"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {userEmail}
                  </Typography>
                </Box>
              </Box>
              <Divider />
              <MenuItem 
                onClick={handleProfileClick}
                sx={{
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <AccountCircle fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="My Profile" 
                  primaryTypographyProps={{ variant: 'body1' }}
                />
              </MenuItem>
              <Divider />
              <MenuItem 
                onClick={() => { logout(); handleClose(); }}
                sx={{
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: theme.palette.dark,
                    color: theme.palette.error.contrastText
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'red' }}>
                  <ExitToApp fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Logout" 
                  primaryTypographyProps={{ variant: 'body1',color:'error' }}
                
                />
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Modal */}
      <Modal
        open={profileModalOpen}
        onClose={handleProfileModalClose}
        aria-labelledby="profile-modal-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.4)'
        }}
      >
        <Card sx={{ 
          width: '100%', 
          maxWidth: 650,
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          transform: 'scale(1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: '0 35px 80px rgba(0, 0, 0, 0.3)'
          }
        }}>
          <CardContent sx={{ p: 0 }}>
            {loading ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                minHeight: 300
              }}>
                <CircularProgress size={60} thickness={4} />
              </Box>
            ) : error ? (
              <Box sx={{ 
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 2,
                    width: '100%'
                  }}
                >
                  {error}
                </Alert>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleRetry}
                  startIcon={<Refresh />}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1
                  }}
                >
                  Try Again
                </Button>
              </Box>
            ) : profileData ? (
              <>
                <Box sx={{ 
                  p: 5,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                  color: 'white',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Background Pattern */}
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                    pointerEvents: 'none'
                  }} />
                                    
<Box
  sx={{
    position: 'relative',
    display: 'inline-block',
    '&:hover .avatar-actions': { display: 'flex' }
  }}
  onMouseEnter={() => setAvatarHover(true)}
  onMouseLeave={() => setAvatarHover(false)}
>
  <Avatar
    src={profilePhotoUrl}
    sx={{
      width: 140,
      height: 140,
      fontSize: '3.5rem',
      mb: 3,
      backgroundColor: 'rgba(255,255,255,0.15)',
      border: '4px solid rgba(255,255,255,0.3)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      position: 'relative',
      zIndex: 1,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'scale(1.05)',
        borderColor: 'rgba(255,255,255,0.5)'
      }
    }}
  >
    {!profilePhotoUrl && profileData?.userName?.charAt(0).toUpperCase()}
  </Avatar>

  {/* Edit/Delete Actions (Hidden by default) */}
  <Box
    className="avatar-actions"
    sx={{
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      display: avatarHover ? 'flex' : 'none',
      gap: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: '6px 12px',
      borderRadius: '20px',
      zIndex: 2,
      transition: 'all 0.2s ease'
    }}
  >
    <IconButton
      size="small"
      onClick={handleEditPhotoClick}
      sx={{
        color: 'white',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
      }}
    >
      <EditIcon fontSize="small" />
    </IconButton>
    <IconButton
      size="small"
      onClick={() => setDeletePhotoModalOpen(true)}
      sx={{
        color: 'white',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
      }}
    >
      <DeleteIcon fontSize="small" />
    </IconButton>
  </Box>
</Box>
<Modal
  open={editPhotoModalOpen}
  onClose={() => setEditPhotoModalOpen(false)}
  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
>
  <Card sx={{ width: 500, p: 3 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Upload New Profile Photo
      </Typography>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="edit-profile-photo-input"
        type="file"
        onChange={async (e) => {
          const file = e.target.files[0];
          if (!file) return;

          const formData = new FormData();
          formData.append('ProfileImage', file);

          try {
            await api.put(`/api/Auth/UpdateProfileImage?userId=${userId}`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
            const response = await api.get(`/api/Auth/profile-image/${userId}`, { responseType: 'blob' });
            const imageUrl = URL.createObjectURL(response.data);
            setProfilePhotoUrl(imageUrl);
            setToast({ open: true, message: 'Profile photo updated successfully.' });
          } catch (err) {
            setToast({ open: true, message: 'Failed to update profile photo.' });
          } finally {
            setEditPhotoModalOpen(false);
          }
        }}
      />
      <label htmlFor="edit-profile-photo-input">
        <Button variant="contained" component="span" startIcon={<UploadIcon />}>
          Choose Photo
        </Button>
      </label>
      <Button
        variant="outlined"
        sx={{ mt: 2 }}
        onClick={() => setEditPhotoModalOpen(false)}
      >
        Cancel
      </Button>
    </CardContent>
  </Card>
</Modal>
<Modal
  open={deletePhotoModalOpen}
  onClose={() => setDeletePhotoModalOpen(false)}
  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
>
  <Card sx={{ width: 400, p: 3 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Delete Profile Photo
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Are you sure you want to delete your profile photo? This cannot be undone.
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
        <Button
          variant="outlined"
          onClick={() => setDeletePhotoModalOpen(false)}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleDeletePhoto}
          disabled={isDeleting}
        >
          {isDeleting ? <CircularProgress size={20} /> : 'Delete'}
        </Button>
      </Box>
    </CardContent>
  </Card>
</Modal>

                  <Typography 
                    variant="h4" 
                    component="h2" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 700,
                      position: 'relative',
                      zIndex: 1,
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {profileData.userName}
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 1.5, 
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    {profileData.roles?.map((role) => (
                      <Chip
                        key={role}
                        label={role}
                        size="medium"
                        sx={{ 
                          backgroundColor: 'rgba(255,255,255,0.15)',
                          color: 'white',
                          fontWeight: 600,
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.25)',
                            transform: 'translateY(-1px)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                <List sx={{ p: 0 }}>
                  <ListItem sx={{ 
                    px: 4, 
                    py: 3,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.02)',
                      transform: 'translateX(4px)'
                    }
                  }}>
                    <ListItemIcon sx={{ 
                      minWidth: 56,
                      p: 1.5,
                      borderRadius: '12px',
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      color: theme.palette.primary.main,
                      mr: 2
                    }}>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email Address"
                      primaryTypographyProps={{ 
                        variant: 'subtitle2', 
                        color: 'text.secondary',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        mb: 0.5
                      }}
                      secondary={profileData.email}
                      secondaryTypographyProps={{ 
                        variant: 'body1',
                        fontWeight: 500,
                        color: 'text.primary'
                      }}
                    />
                  </ListItem>
                  <Divider component="li" sx={{ mx: 4, opacity: 0.6 }} />

                  <ListItem sx={{ 
                    px: 4, 
                    py: 3,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.02)',
                      transform: 'translateX(4px)'
                    }
                  }}>
                    <ListItemIcon sx={{ 
                      minWidth: 56,
                      p: 1.5,
                      borderRadius: '12px',
                      backgroundColor: 'rgba(76, 175, 80, 0.08)',
                      color: theme.palette.success.main,
                      mr: 2
                    }}>
                      <PhoneIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone Number"
                      primaryTypographyProps={{ 
                        variant: 'subtitle2', 
                        color: 'text.secondary',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        mb: 0.5
                      }}
                      secondary={profileData.phoneNumber || 'Not provided'}
                      secondaryTypographyProps={{ 
                        variant: 'body1',
                        fontWeight: 500,
                        color: 'text.primary'
                      }}
                    />
                  </ListItem>
                  <Divider component="li" sx={{ mx: 4, opacity: 0.6 }} />

                  <ListItem sx={{ 
                    px: 4, 
                    py: 3,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.02)',
                      transform: 'translateX(4px)'
                    }
                  }}>
                    <ListItemIcon sx={{ 
                      minWidth: 56,
                      p: 1.5,
                      borderRadius: '12px',
                      backgroundColor: 'rgba(156, 39, 176, 0.08)',
                      color: theme.palette.secondary.main,
                      mr: 2
                    }}>
                      <DepartmentIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Department"
                      primaryTypographyProps={{ 
                        variant: 'subtitle2', 
                        color: 'text.secondary',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        mb: 0.5
                      }}
                      secondary={profileData.department || 'Not specified'}
                      secondaryTypographyProps={{ 
                        variant: 'body1',
                        fontWeight: 500,
                        color: 'text.primary'
                      }}
                    />
                  </ListItem>
                  <Divider component="li" sx={{ mx: 4, opacity: 0.6 }} />

                  <ListItem sx={{ 
                    px: 4, 
                    py: 3,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.02)',
                      transform: 'translateX(4px)'
                    }
                  }}>
                    <ListItemIcon sx={{ 
                      minWidth: 56,
                      p: 1.5,
                      borderRadius: '12px',
                      backgroundColor: profileData.isLocked ? 'rgba(244, 67, 54, 0.08)' : 'rgba(76, 175, 80, 0.08)',
                      color: profileData.isLocked ? theme.palette.error.main : theme.palette.success.main,
                      mr: 2
                    }}>
                      {profileData.isLocked ? <LockIcon /> : <LockOpenIcon />}
                    </ListItemIcon>
                    <ListItemText
                      primary="Account Status"
                      primaryTypographyProps={{ 
                        variant: 'subtitle2', 
                        color: 'text.secondary',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        mb: 0.5
                      }}
                      secondary={
                        profileData.isLocked ? (
                          <Typography component="span" color="error.main" variant="body1" fontWeight={600}>
                            Account is locked
                          </Typography>
                        ) : (
                          <Typography component="span" color="success.main" variant="body1" fontWeight={600}>
                            Account is active
                          </Typography>
                        )
                      }
                    />
                  </ListItem>
                  <Divider component="li" sx={{ mx: 4, opacity: 0.6 }} />

                  <ListItem sx={{ 
                    px: 4, 
                    py: 3,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.02)',
                      transform: 'translateX(4px)'
                    }
                  }}>
                    <ListItemIcon sx={{ 
                      minWidth: 56,
                      p: 1.5,
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 152, 0, 0.08)',
                      color: theme.palette.warning.main,
                      mr: 2
                    }}>
                      <BadgeIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Driver's License"
                      primaryTypographyProps={{ 
                        variant: 'subtitle2', 
                        color: 'text.secondary',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        mb: 0.5
                      }}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={handleViewLicense}
                            disabled={licenseLoading}
                            sx={{
                              borderColor: theme.palette.primary.main,
                              color: theme.palette.primary.main,
                              fontWeight: 600,
                              borderRadius: '8px',
                              px: 2,
                              py: 0.5,
                              '&:hover': {
                                borderColor: theme.palette.primary.dark,
                                backgroundColor: theme.palette.primary.light + '15',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {licenseLoading ? 'Loading...' : 'View License'}
                          </Button>
                        </Box>
                      }
                    />
                  </ListItem>
                </List>
              </>
            ) : null}
          </CardContent>
        </Card>
      </Modal>

      {/* License Modal */}
      <Modal
        open={licenseModalOpen}
        onClose={handleLicenseModalClose}
        aria-labelledby="license-modal-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.4)'
        }}
      >
        <Card sx={{ 
          width: '100%', 
          maxWidth: 900,
          maxHeight: '90vh',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          transform: 'scale(1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: '0 35px 80px rgba(0, 0, 0, 0.3)'
          }
        }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ 
              p: 4, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background Pattern */}
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                pointerEvents: 'none'
              }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
                <Box sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <BadgeIcon sx={{ fontSize: 24 }} />
                </Box>
                <Typography variant="h5" component="h2" sx={{ 
                  fontWeight: 700,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  letterSpacing: '0.5px'
                }}>
                  Driver's License
                </Typography>
              </Box>
              
              <IconButton
                onClick={handleLicenseModalClose}
                sx={{ 
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  position: 'relative',
                  zIndex: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <Close />
              </IconButton>
            </Box>

            <Box sx={{ p: 4 }}>
              {licenseError ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  py: 6,
                  textAlign: 'center'
                }}>
                  <Box sx={{
                    p: 3,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(158, 158, 158, 0.1)',
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <InfoIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                  </Box>
                  <Typography variant="h5" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                    No License Found
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
                    {licenseError}
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={handleLicenseModalClose}
                    sx={{ 
                      px: 4,
                      py: 1.5,
                      borderRadius: '8px',
                      fontWeight: 600
                    }}
                  >
                    Close
                  </Button>
                </Box>
              ) : licenseImageUrl ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: 3
                }}>
                  <Box sx={{
                    width: '100%',
                    maxWidth: 700,
                    border: '2px solid rgba(0,0,0,0.1)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    background: 'white',
                    position: 'relative'
                  }}>
                    <img
                      src={licenseImageUrl}
                      alt="Driver's License"
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block'
                      }}
                    />
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    mt: 2,
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                  }}>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = licenseImageUrl;
                        link.download = 'drivers-license';
                        link.click();
                      }}
                      sx={{
                        px: 3,
                        py: 1.5,
                        borderRadius: '8px',
                        fontWeight: 600,
                        borderColor: theme.palette.primary.main,
                        color: theme.palette.primary.main,
                        '&:hover': {
                          borderColor: theme.palette.primary.dark,
                          backgroundColor: theme.palette.primary.light + '15',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Download
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Upload />}
                      onClick={handleUploadClick}
                      sx={{
                        px: 3,
                        py: 1.5,
                        borderRadius: '8px',
                        fontWeight: 600,
                        borderColor: theme.palette.success.main,
                        color: theme.palette.success.main,
                        '&:hover': {
                          borderColor: theme.palette.success.dark,
                          backgroundColor: theme.palette.success.light + '15',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Upload New
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleLicenseModalClose}
                      sx={{
                        px: 3,
                        py: 1.5,
                        borderRadius: '8px',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #2d2d2d 0%, #404040 100%)',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Close
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  py: 6 
                }}>
                  <CircularProgress size={40} />
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Modal>

      {/* Upload License Modal */}
      <Modal
        open={uploadModalOpen}
        onClose={handleUploadModalClose}
        aria-labelledby="upload-license-modal-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          backdropFilter: 'blur(4px)'
        }}
      >
        <Card sx={{ 
          width: '100%', 
          maxWidth: 500,
          boxShadow: theme.shadows[10],
          borderRadius: 3,
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ 
              p: 3, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
              color: 'white'
            }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                Upload New License
              </Typography>
              <IconButton
                onClick={handleUploadModalClose}
                sx={{ color: 'white' }}
              >
                <Close />
              </IconButton>
            </Box>

            <Box sx={{ p: 3 }}>
              {uploadSuccess ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  py: 4,
                  textAlign: 'center'
                }}>
                  <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" color="success.main" gutterBottom>
                    License Updated Successfully!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your license has been updated. The modal will close automatically.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Select License File
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Supported formats: JPG, PNG, GIF, PDF (Max size: 10MB)
                    </Typography>
                    
                    <input
                      accept=".jpg,.jpeg,.png,.gif,.pdf"
                      style={{ display: 'none' }}
                      id="license-file-input"
                      type="file"
                      onChange={handleFileSelect}
                    />
                    <label htmlFor="license-file-input">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<Upload />}
                        fullWidth
                        sx={{
                          py: 2,
                          borderStyle: 'dashed',
                          borderWidth: 2,
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                            backgroundColor: theme.palette.primary.light + '10'
                          }
                        }}
                      >
                        {selectedFile ? selectedFile.name : 'Choose File'}
                      </Button>
                    </label>
                    
                    {selectedFile && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {uploadError && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {uploadError}
                    </Alert>
                  )}

                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={handleUploadModalClose}
                      disabled={uploadLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleUploadSubmit}
                      disabled={!selectedFile || uploadLoading}
                      startIcon={uploadLoading ? <CircularProgress size={16} /> : null}
                    >
                      {uploadLoading ? 'Uploading...' : 'Upload License'}
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Modal>

      {/* Notification Tray Modal */}
      <Drawer
        anchor="right"
        open={notificationTrayOpen}
        onClose={handleNotificationTrayClose}
        PaperProps={{
          sx: {
            width: 580,
            maxWidth: '90vw',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.15)',
            borderRadius: '20px 0 0 20px',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            pr: 0,
            p: 0,
            mt: 9,
            position: 'fixed',
            right: 0,
            top: 0,
            height: '90vh',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Enhanced Header */}
          <Box sx={{
            p: 3,
            borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            position: 'relative',
            minHeight: 70,
            boxShadow: '0 4px 20px rgba(30, 41, 59, 0.2)'
          }}>
            <Box sx={{
              p: 1.5,
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Notifications sx={{ fontSize: 24, color: 'white' }} />
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                flexGrow: 1, 
                letterSpacing: 0.5,
                fontSize: '1.25rem'
              }}
            >
              Notifications
            </Typography>
            <IconButton 
              onClick={handleNotificationTrayClose} 
              sx={{ 
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                p: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="currentColor" d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12l-4.89 4.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z"/>
              </svg>
            </IconButton>
          </Box>

          {/* Enhanced Tab Navigation */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            py: 3, 
            borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: '0 2px 8px rgba(71, 85, 105, 0.08)'
          }}>
            <ButtonGroup 
              variant="text" 
              sx={{ 
                boxShadow: '0 4px 12px rgba(71, 85, 105, 0.1)',
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '12px', 
                p: 0.5,
                border: '1px solid rgba(226, 232, 240, 0.8)'
              }}
            >
              <Button
                onClick={() => setNotifTab('unread')}
                sx={{
                  bgcolor: notifTab === 'unread' ? 'rgba(71, 85, 105, 0.1)' : 'transparent',
                  color: notifTab === 'unread' ? '#1e293b' : '#64748b',
                  fontWeight: notifTab === 'unread' ? 700 : 500,
                  borderRadius: '8px',
                  px: 3,
                  py: 1.5,
                  boxShadow: notifTab === 'unread' ? '0 2px 8px rgba(71, 85, 105, 0.15)' : 'none',
                  border: notifTab === 'unread' ? '1px solid rgba(71, 85, 105, 0.2)' : '1px solid transparent',
                  mr: 0.5,
                  minWidth: 0,
                  minHeight: 0,
                  fontSize: 14,
                  textTransform: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: notifTab === 'unread' ? 'rgba(71, 85, 105, 0.15)' : 'rgba(71, 85, 105, 0.05)'
                  }
                }}
              >
                Unread ({notifications.filter(n => !n.isRead).length})
              </Button>
              <Button
                onClick={() => setNotifTab('read')}
                sx={{
                  bgcolor: notifTab === 'read' ? 'rgba(71, 85, 105, 0.1)' : 'transparent',
                  color: notifTab === 'read' ? '#1e293b' : '#64748b',
                  fontWeight: notifTab === 'read' ? 700 : 500,
                  borderRadius: '8px',
                  px: 3,
                  py: 1.5,
                  boxShadow: notifTab === 'read' ? '0 2px 8px rgba(71, 85, 105, 0.15)' : 'none',
                  border: notifTab === 'read' ? '1px solid rgba(71, 85, 105, 0.2)' : '1px solid transparent',
                  mr: 0.5,
                  minWidth: 0,
                  minHeight: 0,
                  fontSize: 14,
                  textTransform: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: notifTab === 'read' ? 'rgba(71, 85, 105, 0.15)' : 'rgba(71, 85, 105, 0.05)'
                  }
                }}
              >
                Read ({notifications.filter(n => n.isRead).length})
              </Button>
              <Button
                onClick={() => setNotifTab('all')}
                sx={{
                  bgcolor: notifTab === 'all' ? 'rgba(71, 85, 105, 0.1)' : 'transparent',
                  color: notifTab === 'all' ? '#1e293b' : '#64748b',
                  fontWeight: notifTab === 'all' ? 700 : 500,
                  borderRadius: '8px',
                  px: 3,
                  py: 1.5,
                  boxShadow: notifTab === 'all' ? '0 2px 8px rgba(71, 85, 105, 0.15)' : 'none',
                  border: notifTab === 'all' ? '1px solid rgba(71, 85, 105, 0.2)' : '1px solid transparent',
                  minWidth: 0,
                  minHeight: 0,
                  fontSize: 14,
                  textTransform: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: notifTab === 'all' ? 'rgba(71, 85, 105, 0.15)' : 'rgba(71, 85, 105, 0.05)'
                  }
                }}
              >
                All ({notifications.length})
              </Button>
            </ButtonGroup>
          </Box>

          {/* Enhanced Content Area */}
          <Box sx={{ 
            flex: 1, 
            overflowY: 'auto', 
            p: 0, 
            background: 'transparent',
            '&::-webkit-scrollbar': {
              width: '6px'
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(226, 232, 240, 0.5)',
              borderRadius: '3px'
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(71, 85, 105, 0.3)',
              borderRadius: '3px',
              '&:hover': {
                background: 'rgba(71, 85, 105, 0.5)'
              }
            }
          }}>
            {notifLoading ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: 300,
                flexDirection: 'column',
                gap: 2
              }}>
                <CircularProgress sx={{ color: '#475569' }} />
                <Typography variant="body2" color="text.secondary">
                  Loading notifications...
                </Typography>
              </Box>
            ) : notifError ? (
              <Box sx={{ p: 3 }}>
                <Alert 
                  severity="error" 
                  sx={{ 
                    borderRadius: '12px',
                    border: '1px solid rgba(239, 68, 68, 0.2)'
                  }}
                >
                  {notifError}
                </Alert>
              </Box>
            ) : filteredNotifications.length === 0 ? (
              <Box sx={{ 
                p: 6, 
                textAlign: 'center', 
                color: '#64748b',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2
              }}>
                <Box sx={{ 
                  p: 3,
                  borderRadius: '50%',
                  background: 'rgba(71, 85, 105, 0.05)',
                  border: '2px dashed rgba(71, 85, 105, 0.2)',
                  mb: 2
                }}>
                  <Notifications sx={{ fontSize: 48, color: '#94a3b8' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#475569' }}>
                  No notifications
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 300 }}>
                  {notifTab === 'unread' ? 'You have no unread notifications.' : 
                   notifTab === 'read' ? 'No notifications have been read yet.' : 
                   'No notifications available.'}
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2} sx={{ p: 3 }}>
                {filteredNotifications.map((notif, idx) => (
                  <Box key={notif.id}>
                    <Box
                      sx={{ position: 'relative', '&:hover .notif-delete-btn': { display: 'inline-flex' } }}
                    >
                      <Card
                        elevation={notif.isRead ? 0 : 1}
                        sx={{
                          borderRadius: '16px',
                          boxShadow: notif.isRead ? '0 2px 8px rgba(71, 85, 105, 0.06)' : '0 4px 20px rgba(71, 85, 105, 0.12)',
                          borderLeft: notif.type === 'System' ? '4px solid #475569' : 
                                     (notif.isRead ? '4px solid rgba(226, 232, 240, 0.8)' : '4px solid #475569'),
                          bgcolor: notif.type === 'System' ? 'rgba(71, 85, 105, 0.02)' : 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(10px)',
                          position: 'relative',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            boxShadow: notif.type === 'System' ? '0 8px 32px rgba(71, 85, 105, 0.15)' : '0 8px 32px rgba(71, 85, 105, 0.15)',
                            background: notif.type === 'System' ? 'rgba(71, 85, 105, 0.05)' : 'rgba(255, 255, 255, 1)',
                            transform: 'translateY(-2px) scale(1.01)',
                          },
                          cursor: notif.relatedEntityId ? 'pointer' : 'default',
                          display: 'flex',
                          alignItems: 'flex-start',
                          minHeight: 100,
                          pr: 3,
                          pl: 3,
                          py: 3,
                          border: '1px solid rgba(226, 232, 240, 0.6)'
                        }}
                        onClick={() => handleNotificationClick(notif)}
                      >
                        {notif.type === 'System' ? (
                          <Avatar sx={{ 
                            width: 48, 
                            height: 48, 
                            mr: 3, 
                            bgcolor: '#475569', 
                            color: '#fff', 
                            fontWeight: 700, 
                            fontSize: 20, 
                            border: '2px solid rgba(71, 85, 105, 0.2)', 
                            boxShadow: '0 4px 12px rgba(71, 85, 105, 0.15)' 
                          }}>
                            <InfoIcon />
                          </Avatar>
                        ) : (
                          <Avatar
                            src={notif.avatarUrl || undefined}
                            sx={{
                              width: 48,
                              height: 48,
                              mr: 3,
                              bgcolor: notif.isRead ? 'rgba(71, 85, 105, 0.1)' : '#475569',
                              color: notif.isRead ? '#64748b' : '#fff',
                              fontWeight: 700,
                              fontSize: 20,
                              border: '2px solid rgba(226, 232, 240, 0.8)',
                              boxShadow: '0 4px 12px rgba(71, 85, 105, 0.1)'
                            }}
                          >
                            {notif.avatarUrl ? '' : notif.title?.charAt(0) || 'N'}
                          </Avatar>
                        )}
                        <CardContent sx={{ flex: 1, p: 0, pr: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: notif.type === 'System' ? 700 : 600,
                                color: notif.type === 'System' ? '#475569' : '#1e293b',
                                fontSize: 16,
                                letterSpacing: 0.1,
                                lineHeight: 1.3,
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {notif.title || 'Notification'}
                            </Typography>
                            {notif.timestamp && (
                              <Typography
                                variant="caption"
                                sx={{ 
                                  color: '#94a3b8', 
                                  fontSize: 12, 
                                  ml: 2, 
                                  minWidth: 80, 
                                  textAlign: 'right',
                                  fontWeight: 500
                                }}
                              >
                                {new Date(notif.timestamp).toLocaleString()}
                              </Typography>
                            )}
                            {/* Enhanced Delete button */}
                            <IconButton
                              edge="end"
                              color="error"
                              aria-label="delete notification"
                              onClick={e => { e.stopPropagation(); handleDeleteNotification(notif.id); }}
                              sx={{
                                ml: 1,
                                opacity: 0.7,
                                transition: 'all 0.2s ease',
                                '&:hover': { 
                                  opacity: 1, 
                                  color: '#dc2626',
                                  backgroundColor: 'rgba(220, 38, 38, 0.1)',
                                  transform: 'scale(1.1)'
                                },
                                display: 'none',
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                zIndex: 3,
                                borderRadius: '8px'
                              }}
                              className="notif-delete-btn"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: notif.type === 'System' ? '#475569' : '#64748b',
                              mb: 0.5,
                              fontSize: 14,
                              fontWeight: notif.type === 'System' ? 600 : 500,
                              lineHeight: 1.4
                            }}
                          >
                            {notif.message}
                          </Typography>
                        </CardContent>
                        {!notif.isRead && (
                          <IconButton
                            edge="end"
                            color="primary"
                            aria-label="mark as read"
                            onClick={e => { e.stopPropagation(); handleMarkAsRead(notif.id); }}
                            sx={{
                              position: 'absolute',
                              top: 12,
                              right: 12,
                              bgcolor: 'rgba(71, 85, 105, 0.1)',
                              color: '#475569',
                              boxShadow: '0 4px 12px rgba(71, 85, 105, 0.15)',
                              '&:hover': { 
                                bgcolor: 'rgba(71, 85, 105, 0.2)', 
                                color: '#1e293b',
                                transform: 'scale(1.05)'
                              },
                              zIndex: 2,
                              borderRadius: '8px',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Card>
                    </Box>
                    {idx < filteredNotifications.length - 1 && (
                      <Divider sx={{ my: 2, borderColor: 'rgba(226, 232, 240, 0.6)' }} />
                    )}
                  </Box>
                ))}
              </Stack>
            )}
          </Box>

          {/* Enhanced Footer */}
          <Box sx={{ 
            p: 3, 
            borderTop: '1px solid rgba(226, 232, 240, 0.8)', 
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex', 
            gap: 2 
          }}>
            <Button
              onClick={handleMarkAllAsRead}
              variant="contained"
              color="primary"
              fullWidth
              disabled={notifications.filter(n => !n.isRead).length === 0}
              sx={{
                borderRadius: '12px',
                fontWeight: 600,
                bgcolor: '#475569',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(71, 85, 105, 0.2)',
                '&:hover': { 
                  bgcolor: '#334155',
                  boxShadow: '0 6px 20px rgba(71, 85, 105, 0.3)',
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  bgcolor: 'rgba(156, 163, 175, 0.5)',
                  boxShadow: 'none',
                  transform: 'none'
                },
                textTransform: 'none',
                fontSize: 14,
                py: 1.5,
                transition: 'all 0.2s ease'
              }}
            >
              Mark all as read
            </Button>
            <Button
              onClick={handleDeleteAllNotifications}
              variant="outlined"
              color="error"
              fullWidth
              disabled={notifications.length === 0}
              sx={{
                borderRadius: '12px',
                fontWeight: 600,
                borderColor: '#dc2626',
                color: '#dc2626',
                textTransform: 'none',
                fontSize: 14,
                py: 1.5,
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#b91c1c',
                  color: '#b91c1c',
                  backgroundColor: 'rgba(220, 38, 38, 0.05)',
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  borderColor: 'rgba(156, 163, 175, 0.5)',
                  color: 'rgba(156, 163, 175, 0.5)',
                  transform: 'none'
                }
              }}
            >
              Delete all
            </Button>
          </Box>
        </Box>
      </Drawer>
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ open: false, message: '' })}
        message={toast.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
}