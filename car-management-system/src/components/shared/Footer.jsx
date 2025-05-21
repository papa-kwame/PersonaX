import { Box, Typography, Container, Stack } from '@mui/material';

export default function Footer() {
  return (
    <Box component="footer" py={1} sx={{ backgroundColor: '#0f172a', color: 'white' }}>
      <Container>
        <Stack spacing={1} alignItems="center">
          <Typography variant="h6" fontWeight={700}>
            Persol Fleet
          </Typography>
          <Typography variant="body2" color="gray">
            © {new Date().getFullYear()} All rights reserved.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
