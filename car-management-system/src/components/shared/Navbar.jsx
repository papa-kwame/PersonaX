import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Typography, Menu, MenuItem, ListItemIcon, Divider, Avatar, Box } from '@mui/material';
import { AccountCircle, Settings, Notifications, ExitToApp } from '@mui/icons-material';
import logo from "../../../src/assets/persol.png";
import ico from "../../assets/icon-img.jpg";
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout, userEmail, username } = useAuth();
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: 'black' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
            <img src={logo} alt="Logo" style={{ height: '40px' }} />
          </Link>
        </Typography>
        <div>
          <IconButton
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar alt="Profile" src={ico} />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={open}
            onClose={handleClose}
          >
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
              <Avatar alt="Profile" src={ico} sx={{ width: 64, height: 64, mr: 2 }} />
              <div>
                <Typography variant="subtitle1" fontWeight="bold">
                  {username || "John Doe"}
                </Typography>   
              </div>
            </Box>
            <Divider />
            <MenuItem component={Link} to="/profile" onClick={handleClose}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              My Profile
            </MenuItem>
            <MenuItem component={Link} to="/settings" onClick={handleClose}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <MenuItem component={Link} to="/notification" onClick={handleClose}>
              <ListItemIcon>
                <Notifications fontSize="small" />
              </ListItemIcon>
              Notifications
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { logout(); handleClose(); }}>
              <ListItemIcon>
                <ExitToApp fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  );
}
