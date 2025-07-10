import React, { useEffect, useState } from 'react';
import {
  Card, CardContent, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Chip, Box, CircularProgress, Divider, Button
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EventIcon from '@mui/icons-material/Event';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Link } from 'react-router-dom';
import api from '../../services/api';

// ... existing code ...
<Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', px: 3, py: 1.5 }}>
  <Button
    endIcon={<ArrowForwardIosIcon />}
    size="small"
    sx={{ fontWeight: 700, textTransform: 'none' }}
    color="primary"
    component={Link}
    to="/schedule"
  >
    View All
  </Button>
</Box>
// ... existing code ... 