import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import NavbarHome from '../components/shared/NavbarHome';
import HomeHero from '../assets/homepageimage.webp';
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
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Slider from 'react-slick';
import Footer from '../components/shared/Footer';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useAuth } from '../context/AuthContext';

// Particle component for background animation
const Particle = ({ size, top, left, delay }) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        width: size,
        height: size,
        top: `${top}%`,
        left: `${left}%`,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '50%',
        animation: `float 8s ease-in-out ${delay}s infinite`,
        '@keyframes float': {
          '0%': { 
            transform: 'translateY(0px) rotate(0deg)',
            opacity: 0.2
          },
          '50%': { 
            transform: 'translateY(-30px) rotate(180deg)',
            opacity: 0.5
          },
          '100%': { 
            transform: 'translateY(0px) rotate(360deg)',
            opacity: 0.2
          }
        }
      }}
    />
  );
};

// Floating Shapes component for decorative elements
const FloatingShape = ({ type, size, top, left, delay, duration = 6 }) => {
  const getShapeStyles = () => {
    const baseStyles = {
      position: 'absolute',
      width: size,
      height: size,
      top: `${top}%`,
      left: `${left}%`,
      border: '2px solid rgba(255, 255, 255, 0.3)',
      backgroundColor: 'transparent',
      animation: `floatShape ${duration}s ease-in-out ${delay}s infinite`,
    };

    switch (type) {
      case 'circle':
        return {
          ...baseStyles,
          borderRadius: '50%',
        };
      case 'square':
        return {
          ...baseStyles,
          borderRadius: '8px',
        };
      case 'triangle':
        return {
          ...baseStyles,
          width: 0,
          height: 0,
          border: 'none',
          borderLeft: `${size/2}px solid transparent`,
          borderRight: `${size/2}px solid transparent`,
          borderBottom: `${size}px solid rgba(255, 255, 255, 0.3)`,
          backgroundColor: 'transparent',
        };
      default:
        return baseStyles;
    }
  };

  return (
    <Box
      sx={{
        ...getShapeStyles(),
        '@keyframes floatShape': {
          '0%': { 
            transform: 'translateY(0px) translateX(0px) rotate(0deg)',
            opacity: 0.3
          },
          '25%': { 
            transform: 'translateY(-20px) translateX(10px) rotate(90deg)',
            opacity: 0.6
          },
          '50%': { 
            transform: 'translateY(-40px) translateX(-5px) rotate(180deg)',
            opacity: 0.4
          },
          '75%': { 
            transform: 'translateY(-20px) translateX(-10px) rotate(270deg)',
            opacity: 0.7
          },
          '100%': { 
            transform: 'translateY(0px) translateX(0px) rotate(360deg)',
            opacity: 0.3
          }
        }
      }}
    />
  );
};

/*const ScrollIndicator = () => {
  return (
    <Box sx={{
      position: 'absolute',
      bottom: '5%',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 1,
      animation: 'bounce 2s infinite',
      '@keyframes bounce': {
        '0%, 20%, 50%, 80%, 100%': { 
          transform: 'translateX(-50%) translateY(0)' 
        },
        '40%': { 
          transform: 'translateX(-50%) translateY(-10px)' 
        },
        '60%': { 
          transform: 'translateX(-50%) translateY(-5px)' 
        }
      }
    }}>
      <Typography 
        variant="caption" 
        sx={{ 
          color: 'white', 
          opacity: 0.7,
          fontSize: '0.75rem',
          fontWeight: 300,
          letterSpacing: '0.5px'
        }}
      >
        Scroll to explore
      </Typography>
      <ArrowDownwardIcon 
        sx={{ 
          color: 'white', 
          opacity: 0.6,
          fontSize: '1.5rem'
        }} 
      />
    </Box>
  );
};
*/
export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { isAuthenticated, userRoles, isLoading } = useAuth();
  const [textIndex, setTextIndex] = useState(0);

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

  // Generate particles for background
  const particles = Array.from({ length: 15 }).map((_, i) => (
    <Particle
      key={i}
      size={Math.random() * 10 + 2}
      top={Math.random() * 100}
      left={Math.random() * 100}
      delay={Math.random() * 5}
    />
  ));

  // Generate floating shapes for text area
  const floatingShapes = [
    { type: 'circle', size: 40, top: 15, left: 10, delay: 0, duration: 8 },
    { type: 'square', size: 35, top: 25, left: 80, delay: 1, duration: 6 },
    { type: 'triangle', size: 30, top: 60, left: 15, delay: 2, duration: 7 },
    { type: 'circle', size: 25, top: 70, left: 85, delay: 0.5, duration: 9 },
    { type: 'square', size: 30, top: 40, left: 5, delay: 1.5, duration: 5 },
    { type: 'triangle', size: 35, top: 80, left: 70, delay: 3, duration: 8 },
    { type: 'circle', size: 20, top: 30, left: 90, delay: 2.5, duration: 6 },
    { type: 'square', size: 28, top: 50, left: 8, delay: 1.2, duration: 7 },
    { type: 'triangle', size: 32, top: 20, left: 75, delay: 0.8, duration: 9 },
    { type: 'circle', size: 22, top: 75, left: 25, delay: 2.8, duration: 5 },
    // Additional shapes
    { type: 'square', size: 26, top: 35, left: 60, delay: 1.8, duration: 6 },
    { type: 'triangle', size: 28, top: 45, left: 40, delay: 2.2, duration: 8 },
    { type: 'circle', size: 18, top: 55, left: 95, delay: 0.3, duration: 7 },
    { type: 'square', size: 32, top: 65, left: 50, delay: 3.5, duration: 5 },
    { type: 'triangle', size: 24, top: 85, left: 35, delay: 1.7, duration: 9 },
    { type: 'circle', size: 30, top: 10, left: 65, delay: 2.9, duration: 6 },
    { type: 'square', size: 22, top: 90, left: 15, delay: 0.7, duration: 8 },
    { type: 'triangle', size: 36, top: 5, left: 45, delay: 3.2, duration: 7 },
    { type: 'circle', size: 16, top: 95, left: 80, delay: 1.4, duration: 5 },
    { type: 'square', size: 34, top: 12, left: 30, delay: 2.1, duration: 9 },
    { type: 'triangle', size: 26, top: 38, left: 88, delay: 0.9, duration: 6 },
    { type: 'circle', size: 24, top: 68, left: 55, delay: 3.8, duration: 8 },
    { type: 'square', size: 20, top: 78, left: 12, delay: 1.6, duration: 7 },
    { type: 'triangle', size: 38, top: 48, left: 72, delay: 2.7, duration: 5 },
    { type: 'circle', size: 28, top: 88, left: 42, delay: 0.4, duration: 9 },
  ].map((shape, i) => (
    <FloatingShape
      key={`shape-${i}`}
      type={shape.type}
      size={shape.size}
      top={shape.top}
      left={shape.left}
      delay={shape.delay}
      duration={shape.duration}
    />
  ));

  if (isLoading) return null;

  return (
    <Box sx={{
      backgroundColor: 'background.default',
      overflowX: 'hidden',
      position: 'relative'
    }}>
      {/* Animated background elements */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: 0
      }}>
        {particles}
        
        {/* Animated circles */}
        <Box sx={{
          position: 'absolute',
          top: '10%',
          right: '15%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          border: '2px solid rgba(255, 255, 255, 0.05)',
          animation: 'pulse 15s infinite alternate',
          '@keyframes pulse': {
            '0%': { transform: 'scale(0.8)', opacity: 0.1 },
            '100%': { transform: 'scale(1.2)', opacity: 0.2 }
          }
        }} />
        
        <Box sx={{
          position: 'absolute',
          bottom: '20%',
          left: '10%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          border: '2px solid rgba(255, 255, 255, 0.05)',
          animation: 'pulse2 12s infinite alternate',
          '@keyframes pulse2': {
            '0%': { transform: 'scale(0.7)', opacity: 0.1 },
            '100%': { transform: 'scale(1.1)', opacity: 0.15 }
          }
        }} />
      </Box>
      
      <NavbarHome />
      
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: isMobile ? 'column-reverse' : 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 0,
        position: 'relative',
        overflow: 'hidden',
        zIndex: 1
      }}>
        {/* Text Content */}
        <Box sx={{
          width: isMobile ? '100%' : '50%',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: isMobile ? theme.spacing(4) : theme.spacing(8),
          backgroundColor: 'rgba(27, 43, 54, 0.97)',
          zIndex: 2,
          textAlign: isMobile ? 'center' : 'left',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Floating Shapes */}
          {floatingShapes}
          {/* Animated underline for heading */}
          <Box sx={{
            position: 'relative',
            display: 'inline-block',
            width: 'fit-content',
            mx: isMobile ? 'auto' : 'unset',
            mb: 3
          }}>
            <Typography 
              variant={isMobile ? 'h3' : 'h2'} 
              component="h1"
              sx={{
                fontWeight: 700,
                mb: 2,
                lineHeight: 1.2,
                color: 'white',
                '& span': {
                  display: 'block'
                }
              }}
            >
              <Box component="span" sx={{ 
                color: 'primary.main',
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'fadeInUp 1s ease-out forwards',
                animationDelay: '0.2s',
                opacity: 0,
                '@keyframes fadeInUp': {
                  '0%': { 
                    opacity: 0, 
                    transform: 'translateY(30px)' 
                  },
                  '100%': { 
                    opacity: 1, 
                    transform: 'translateY(0)' 
                  }
                }
              }}>Fleet</Box>
              <Box component="span" sx={{
                animation: 'fadeInUp 1s ease-out forwards',
                animationDelay: '0.4s',
                opacity: 0,
                '@keyframes fadeInUp': {
                  '0%': { 
                    opacity: 0, 
                    transform: 'translateY(30px)' 
                  },
                  '100%': { 
                    opacity: 1, 
                    transform: 'translateY(0)' 
                  }
                }
              }}>Management</Box>
              <Box component="span" sx={{
                animation: 'fadeInUp 1s ease-out forwards',
                animationDelay: '0.6s',
                opacity: 0,
                '@keyframes fadeInUp': {
                  '0%': { 
                    opacity: 0, 
                    transform: 'translateY(30px)' 
                  },
                  '100%': { 
                    opacity: 1, 
                    transform: 'translateY(0)' 
                  }
                }
              }}>System</Box>
            </Typography>
            
            <Box sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '4px',
              background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
              borderRadius: '2px',
              transform: 'scaleX(0)',
              transformOrigin: 'left',
              animation: 'underline 1.5s ease-out forwards',
              animationDelay: '0.5s',
              '@keyframes underline': {
                '0%': { transform: 'scaleX(0)' },
                '100%': { transform: 'scaleX(1)' }
              }
            }} />
          </Box>
          
          <Typography 
            variant="body1"
            sx={{ 
              mb: 4,
              opacity: 0.9,
              maxWidth: '800px',
              fontSize: '18px',
              color: 'white',
              fontWeight: '300',
              animation: 'fadeIn 1s ease-out forwards',
              animationDelay: '0.8s',
              opacity: 0,
              '@keyframes fadeIn': {
                '0%': { opacity: 0, transform: 'translateY(10px)' },
                '100%': { opacity: 0.9, transform: 'translateY(0)' }
              }
            }}
          >
            Optimize your vehicle fleet operations with our comprehensive management solution
          </Typography>
          
          <Box sx={{
            display: 'flex',
            gap: 2,
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: isMobile ? 'center' : 'flex-start',
            animation: 'fadeIn 1s ease-out forwards',
            animationDelay: '1.1s',
            opacity: 0,
            '@keyframes fadeIn': {
              '0%': { opacity: 0, transform: 'translateY(10px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' }
            }
          }}>
            <Button
              component={Link}
              to="/login"
              variant="contained"
              color="primary"
              endIcon={<ArrowForwardIcon />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: '50px',
                fontWeight: 600,
                boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)',
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                position: 'relative',
                overflow: 'hidden',
                '&:before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  transition: '0.5s'
                },
                '&:hover': {
                  boxShadow: '0 6px 25px rgba(25, 118, 210, 0.5)',
                  transform: 'translateY(-3px) scale(1.02)',
                  '&:before': {
                    left: '100%'
                  }
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              Get Started
            </Button>
            
            <Button
              component={Link}
              to="/register"
              variant="outlined"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: '50px',
                fontWeight: 600,
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                borderWidth: '2px',
                position: 'relative',
                overflow: 'hidden',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateX(-100%)',
                  transition: 'transform 0.3s ease'
                },
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-2px) scale(1.01)',
                  '&:after': {
                    transform: 'translateX(0)'
                  }
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              Create Account
            </Button>
          </Box>
        </Box>
        
        {/* Image with Overlay */}
        <Box sx={{
          width: isMobile ? '100%' : '50%',
          height: '100vh',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box
            component="img"
            src={HomeHero}
            alt="Fleet management dashboard"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.02)'
              }
            }}
          />
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(45deg, rgba(27, 43, 54, 0.5) 0%, rgba(27, 43, 54, 0.3) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            '&:hover': {
              opacity: 1
            }
          }}>

          </Box>
        </Box>

      </Box>

      {/* Additional sections would go here */}
      
    </Box>
  );
}