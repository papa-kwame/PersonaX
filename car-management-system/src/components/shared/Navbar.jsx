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
  Delete as DeleteIcon
} from '@mui/icons-material';
import logo from "../../../src/assets/persol.png";
import ico from "../../assets/icon-img.jpg";
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
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
      console.error('Profile fetch error:', err);
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
              <img src={logo} alt="Logo" style={{ height: '40px' }} />
            </Link>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

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
                src={ico} 
                sx={{ 
                  width: 55, 
                  height: 55,
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
                  src={ico} 
                  sx={{ 
                    width: 56, 
                    height: 56, 
                    mr: 2,
                    border: `2px solid ${theme.palette.primary.main}`
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
                    backgroundColor: theme.palette.error.light,
                    color: theme.palette.error.contrastText
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                  <ExitToApp fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Logout" 
                  primaryTypographyProps={{ variant: 'body1' }}
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
          backdropFilter: 'blur(4px)'
        }}
      >
        <Card sx={{ 
          width: '100%', 
          maxWidth: 600,
          boxShadow: theme.shadows[10],
          borderRadius: 3,
          overflow: 'hidden'
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
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  color: 'white',
                  textAlign: 'center'
                }}>
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      fontSize: '3rem',
                      mb: 3,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      border: '3px solid white'
                    }}
                  >
                    {profileData.userName?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                    {profileData.userName}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                    {profileData.roles?.map((role) => (
                      <Chip
                        key={role}
                        label={role}
                        color="default"
                        size="small"
                        sx={{ 
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          fontWeight: 500
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                <List sx={{ p: 0 }}>
                  <ListItem sx={{ px: 3, py: 2 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <EmailIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email"
                      primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                      secondary={profileData.email}
                      secondaryTypographyProps={{ variant: 'body1' }}
                    />
                  </ListItem>
                  <Divider component="li" />

                  <ListItem sx={{ px: 3, py: 2 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <PhoneIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone Number"
                      primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                      secondary={profileData.phoneNumber || 'Not provided'}
                      secondaryTypographyProps={{ variant: 'body1' }}
                    />
                  </ListItem>
                  <Divider component="li" />

                  <ListItem sx={{ px: 3, py: 2 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <DepartmentIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Department"
                      primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                      secondary={profileData.department || 'Not specified'}
                      secondaryTypographyProps={{ variant: 'body1' }}
                    />
                  </ListItem>
                  <Divider component="li" />

                  <ListItem sx={{ px: 3, py: 2 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {profileData.isLocked ? (
                        <LockIcon color="error" />
                      ) : (
                        <LockOpenIcon color="success" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary="Account Status"
                      primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                      secondary={
                        profileData.isLocked ? (
                          <Typography component="span" color="error.main" variant="body1">
                            Account is locked
                          </Typography>
                        ) : (
                          <Typography component="span" color="success.main" variant="body1">
                            Account is active
                          </Typography>
                        )
                      }
                    />
                  </ListItem>
                </List>
              </>
            ) : null}
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
            width: 550,
            maxWidth: '90vw',
            boxShadow: theme.shadows[10],
            borderRadius:"18px",
            border: `1px solid ${theme.palette.divider}`,
            pr: 4,
            p: 0,
            mt:9,
            position: 'fixed',
            right: 20,
            top: 0,
            height: '90vh',
          }
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{
            p: 3,
            borderBottom: `1px solid ${theme.palette.divider}`,
            background: `black`,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            position: 'relative',
            maxHeight: 54
          }}>
            <Notifications fontSize="medium" sx={{ mr: 1 }} />
            <Typography id="notification-tray-title" variant="h6" sx={{ fontWeight: 300, flexGrow: 1, letterSpacing: 1 }}>
              Your notifications
            </Typography>
            <IconButton onClick={handleNotificationTrayClose} sx={{ color: 'white', ml: 1 }}>
              <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12l-4.89 4.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z"/></svg>
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#f7fafd', py: 2, borderBottom: '1px solid #e0e7ef' }}>
            <ButtonGroup variant="text" sx={{ boxShadow: 'none', bgcolor: '#f1f5f9', borderRadius: 2, p: 0.5 }}>
              <Button
                onClick={() => setNotifTab('unread')}
                sx={{
                  bgcolor: notifTab === 'unread' ? '#fff' : 'transparent',
                  color: notifTab === 'unread' ? '#2563eb' : '#64748b',
                  fontWeight: notifTab === 'unread' ? 700 : 500,
                  borderRadius: 2,
                  px: 2.5,
                  py: 1.2,
                  boxShadow: notifTab === 'unread' ? '0 2px 8px rgba(56,112,255,0.08)' : 'none',
                  border: notifTab === 'unread' ? '1.5px solid #2563eb' : '1.5px solid transparent',
                  mr: 1,
                  minWidth: 0,
                  minHeight: 0,
                  fontSize: 15,
                  textTransform: 'none',
                }}
              >
                Unread ({notifications.filter(n => !n.isRead).length})
              </Button>
              <Button
                onClick={() => setNotifTab('read')}
                sx={{
                  bgcolor: notifTab === 'read' ? '#fff' : 'transparent',
                  color: notifTab === 'read' ? '#2563eb' : '#64748b',
                  fontWeight: notifTab === 'read' ? 700 : 500,
                  borderRadius: 2,
                  px: 2.5,
                  py: 1.2,
                  boxShadow: notifTab === 'read' ? '0 2px 8px rgba(56,112,255,0.08)' : 'none',
                  border: notifTab === 'read' ? '1.5px solid #2563eb' : '1.5px solid transparent',
                  mr: 1,
                  minWidth: 0,
                  minHeight: 0,
                  fontSize: 15,
                  textTransform: 'none',
                }}
              >
                Read ({notifications.filter(n => n.isRead).length})
              </Button>
              <Button
                onClick={() => setNotifTab('all')}
                sx={{
                  bgcolor: notifTab === 'all' ? '#fff' : 'transparent',
                  color: notifTab === 'all' ? '#2563eb' : '#64748b',
                  fontWeight: notifTab === 'all' ? 700 : 400,
                  borderRadius: 2,
                  px: 2.5,
                  py: 1.2,
                  boxShadow: notifTab === 'all' ? '0 2px 8px rgba(56,112,255,0.08)' : 'none',
                  border: notifTab === 'all' ? '1.5px solid #2563eb' : '1.5px solid transparent',
                  minWidth: 0,
                  minHeight: 0,
                  fontSize: 15,
                  textTransform: 'none',
                }}
              >
                All ({notifications.length})
              </Button>
            </ButtonGroup>
          </Box>
          <Box sx={{ flex: 1, overflowY: 'auto', p: 0, background: 'transparent' }}>
            {notifLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <CircularProgress />
              </Box>
            ) : notifError ? (
              <Alert severity="error">{notifError}</Alert>
            ) : filteredNotifications.length === 0 ? (
              <Box sx={{ p: 6, textAlign: 'center', color: theme.palette.text.secondary }}>
                <Box sx={{ mb: 3 }}>
                  <Notifications fontSize="large" color="disabled" sx={{ fontSize: 64 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  No notifications here
                </Typography>
                <Typography variant="body1">
                  {notifTab === 'unread' ? 'You have no unread notifications.' : notifTab === 'read' ? 'No notifications have been read yet.' : 'No notifications.'}
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2} sx={{ p: 2 }}>
                {filteredNotifications.map((notif, idx) => (
                  <Box key={notif.id}>
                    <Box
                      sx={{ position: 'relative', '&:hover .notif-delete-btn': { display: 'inline-flex' } }}
                    >
                    <Card
                      elevation={notif.isRead ? 0 : 2}
                      sx={{
                        borderRadius: 3,
                        boxShadow: notif.isRead ? '0 1px 4px rgba(0,0,0,0.04)' : '0 4px 16px rgba(56, 112, 255, 0.08)',
                        borderLeft: notif.type === 'System' ? '4px solid #0288d1' : (notif.isRead ? '4px solid #e0e7ef' : '4px solid #3b82f6'),
                        bgcolor: notif.type === 'System' ? '#e3f2fd' : '#fff',
                        position: 'relative',
                        transition: 'box-shadow 0.2s, border 0.2s, background 0.2s, transform 0.2s',
                        '&:hover': {
                          boxShadow: notif.type === 'System' ? '0 8px 32px rgba(2,136,209,0.12)' : '0 8px 32px rgba(56, 112, 255, 0.12)',
                          background: notif.type === 'System' ? '#bbdefb' : '#f7fafd',
                          transform: 'translateY(-2px) scale(1.01)',
                        },
                        cursor: notif.relatedEntityId ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'flex-start',
                        minHeight: 90,
                        pr: 2,
                        pl: 2,
                        py: 2.5,
                      }}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      {notif.type === 'System' ? (
                        <Avatar sx={{ width: 44, height: 44, mr: 2, bgcolor: '#0288d1', color: '#fff', fontWeight: 700, fontSize: 20, border: '2px solid #b3e5fc', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                          <InfoIcon />
                        </Avatar>
                      ) : (
                        <Avatar
                          src={notif.avatarUrl || undefined}
                          sx={{
                            width: 44,
                            height: 44,
                            mr: 2,
                            bgcolor: notif.isRead ? '#e0e7ef' : '#3b82f6',
                            color: notif.isRead ? '#64748b' : '#fff',
                            fontWeight: 700,
                            fontSize: 20,
                            border: '2px solid #f1f5f9',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                          }}
                        >
                          {notif.avatarUrl ? '' : notif.title?.charAt(0) || 'N'}
                        </Avatar>
                      )}
                      <CardContent sx={{ flex: 1, p: 0, pr: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: notif.type === 'System' ? 900 : 800,
                              color: notif.type === 'System' ? '#0288d1' : '#1e293b',
                              fontSize: 17,
                              letterSpacing: 0.1,
                              lineHeight: 1.2,
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
                              sx={{ color: '#94a3b8', fontSize: 13, ml: 2, minWidth: 90, textAlign: 'right' }}
                            >
                              {new Date(notif.timestamp).toLocaleString()}
                            </Typography>
                          )}
                            {/* Delete button */}
                            <IconButton
                              edge="end"
                              color="error"
                              aria-label="delete notification"
                              onClick={e => { e.stopPropagation(); handleDeleteNotification(notif.id); }}
                              sx={{
                                ml: 1,
                                opacity: 0.6,
                                transition: 'opacity 0.2s',
                                '&:hover': { opacity: 1, color: theme.palette.error.main },
                                display: 'none',
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                zIndex: 3
                              }}
                              className="notif-delete-btn"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: notif.type === 'System' ? '#01579b' : '#475569',
                            mb: 0.5,
                            fontSize: 15.5,
                            fontWeight: notif.type === 'System' ? 700 : 500,
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
                            top: 18,
                            right: 18,
                            bgcolor: '#f1f5f9',
                            color: '#3b82f6',
                            boxShadow: '0 2px 8px rgba(56,112,255,0.08)',
                            '&:hover': { bgcolor: '#dbeafe', color: '#2563eb' },
                            zIndex: 2
                          }}
                        >
                          <CheckCircleIcon fontSize="medium" />
                        </IconButton>
                      )}
                    </Card>
                    </Box>
                    {idx < filteredNotifications.length - 1 && (
                      <Divider sx={{ my: 2, borderColor: '#e0e7ef' }} />
                    )}
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
          <Box sx={{ p: 2, borderTop: `1px solid #e0e7ef`, bgcolor: '#f7fafd', display: 'flex', gap: 2 }}>
            <Button
              onClick={handleMarkAllAsRead}
              variant="contained"
              color="primary"
              fullWidth
              disabled={notifications.filter(n => !n.isRead).length === 0}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                bgcolor: '#3b82f6',
                color: '#fff',
                boxShadow: '0 2px 8px rgba(56,112,255,0.08)',
                '&:hover': { bgcolor: '#2563eb' },
                textTransform: 'none',
                fontSize: 16,
                py: 1.2
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
                borderRadius: 2,
                fontWeight: 600,
                borderColor: theme.palette.error.main,
                color: theme.palette.error.main,
                textTransform: 'none',
                fontSize: 16,
                py: 1.2
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