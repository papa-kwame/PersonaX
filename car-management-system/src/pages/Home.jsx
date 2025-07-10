import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import NavbarHome from '../components/shared/NavbarHome';
import HomeHero from '../assets/homehero.webp';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Avatar, 
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Slider from 'react-slick';
import Footer from '../components/shared/Footer';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { isAuthenticated, userRoles, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (userRoles.includes('Admin')) {
        navigate('/dashboard', { replace: true });
      } else if (userRoles.includes('Mechanic')) {
        navigate('/mechanic', { replace: true });
      } else if (userRoles.includes('User')) {
        navigate('/userdashboard', { replace: true });
      } else {
        navigate('/unauthorized', { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, userRoles, navigate]);

  useEffect(() => {
    document.body.classList.add('home-page-body');
    return () => {
      document.body.classList.remove('home-page-body');
    };
  }, []);

  if (isLoading) return null;

  return (
    <Box sx={{
      backgroundColor: 'background.default',
      overflowX: 'hidden'
    }}>
      <NavbarHome />
      
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: isMobile ? 'column-reverse' : 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? theme.spacing(4) : theme.spacing(8),
        background: `rgba(52, 152, 219, 0.72)`,
        color: 'common.white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{
          maxWidth: isMobile ? '100%' : '50%',
          zIndex: 2,
          textAlign: isMobile ? 'center' : 'left'
        }}>
          <Typography 
            variant={isMobile ? 'h3' : 'h2'} 
            component="h1"
            sx={{
              fontWeight: 400,
              mb: 2,
              lineHeight: 1.2,
              '& span': {
                display: 'block'
              }
            }}
          >
            <Box component="span" sx={{ color: 'black' }}>Fleet</Box>
            <Box component="span" sx={{ color: 'white' }}>Management</Box>
            <Box component="span">System</Box>
          </Typography>
          
          <Typography 
            variant={isMobile ? 'body1' : 'h6'} 
            sx={{ 
              mb: 4,
              opacity: 0.9,
              maxWidth: '800px',
              fontSize:'18px',
              fontWeight:'300'
            }}
          >
            Optimize your vehicle fleet operations with our comprehensive management solution
          </Typography>
          
          <Box sx={{
            display: 'flex',
            gap: 2,
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: isMobile ? 'center' : 'flex-start'
          }}>
            <Button
              component={Link}
              to="/login"
              variant="contained"
              color="secondary"
              endIcon={<ArrowForwardIcon />}
              sx={{
                px: 2,
                py: 1.5,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                borderRadius: '10px',
                fontWeight: 600,
                boxShadow: theme.shadows[4],
                '&:hover': {
                  boxShadow: theme.shadows[8],
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Get Started
            </Button>
            
            <Button
              component={Link}
              to="/register"
              variant="outlined"
              color="white"
              sx={{
                px: 2,
                py: 1.5,
                borderRadius: '10px',
                fontWeight: 600,
                color:'black',
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                borderWidth: '2px',
                '&:hover': {
                  borderWidth: '2px',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Create Account
            </Button>
          </Box>
        </Box>
        
        <Box sx={{
          width: isMobile ? '100%' : '50%',
          display: 'flex',
          justifyContent: 'center',
          zIndex: 1,
          mt: isMobile ? 4 : 0,
          animation: 'float 6s ease-in-out infinite',
          '@keyframes float': {
            '0%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-20px)' },
            '100%': { transform: 'translateY(0px)' }
          }
        }}>
          <Box
            component="img"
            src={HomeHero}
            alt="Fleet management dashboard"
            sx={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: 2,
              boxShadow: theme.shadows[10]
            }}
          />
        </Box>
        
      </Box>

     
    </Box>
  );
}