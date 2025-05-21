import { AppBar, Toolbar, IconButton, Button, Box, Drawer, List, ListItem, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import logo from '../../assets/persol.png';

export default function NavbarHome() {
  const [open, setOpen] = useState(false);

  const toggleDrawer = (open) => () => {
    setOpen(open);
  };

  return (
    <>
      <AppBar position="fixed" sx={{ backgroundColor: '#212529', boxShadow: 3, px: 2 }}>
        <Toolbar>
          <Box component={Link} to="/" sx={{ flexGrow: 1 }}>
            <img src={logo} alt="Logo" style={{ height: 40 }} />
          </Box>

          {/* Hamburger menu for small screens */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <IconButton color="inherit" edge="end" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Normal buttons for medium and up */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            <Button component={Link} to="/login" variant="outlined" color="inherit">
              Login
            </Button>
            <Button component={Link} to="/register" variant="contained" color="primary">
              Sign Up
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer for small screens */}
      <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            <ListItem button component={Link} to="/login">
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem button component={Link} to="/register">
              <ListItemText primary="Sign Up" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}
