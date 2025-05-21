import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Container,
  Stack,
  Fade
} from '@mui/material';

export default function Admin()  { const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/admin/users');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Fade in timeout={500}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e3a8a, #0f172a)',
          color: 'white',
          textAlign: 'center',
          p: 3
        }}
      >
        <Container maxWidth="sm">
          <Stack spacing={4} alignItems="center">
            <Typography variant="h3" fontWeight={700}>
              Welcome, Ameyaw 👋
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Redirecting to your admin dashboard...
            </Typography>
            <CircularProgress color="inherit" thickness={5} />
          </Stack>
        </Container>
      </Box>
    </Fade>
  );
}