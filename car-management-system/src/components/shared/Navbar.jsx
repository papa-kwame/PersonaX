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
  useMediaQuery
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
  Refresh
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

  return (
    <>
      <AppBar position="static" sx={{ 
        backgroundColor: 'black',
        boxShadow: 'none',
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Toolbar sx={{ 
          minHeight: { xs: 56, sm: 64 },
          paddingX: { xs: 2, sm: 3 }
        }}>
           <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
              <img src={logo} alt="Logo" style={{ height: '40px' }} />
            </Link>
          </Typography>
          
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
    </>
  );
}