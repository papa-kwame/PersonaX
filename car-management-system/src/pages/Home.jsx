import { Link } from 'react-router-dom';
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

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    document.body.classList.add('home-page-body');
    return () => {
      document.body.classList.remove('home-page-body');
    };
  }, []);

  const testimonials = [
    {
      text: "This system reduced our fleet maintenance costs by 30% and improved our vehicle utilization rate significantly.",
      name: "Michael Johnson",
      role: "Fleet Manager, TransGlobal Logistics",
      avatar: "https://i.pravatar.cc/100?img=3"
    },
    {
      text: "We streamlined operations, cut down paperwork, and now track everything in real time!",
      name: "Sarah Luma",
      role: "Logistics Lead, RoadSync",
      avatar: "https://i.pravatar.cc/100?img=5"
    },
    {
      text: "The UI is intuitive and saved my team tons of admin time.",
      name: "Carlos Mendes",
      role: "Maintenance Chief, SpeedWheels",
      avatar: "https://i.pravatar.cc/100?img=12"
    }
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    autoplay: true,
    arrows: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplaySpeed: 5000,
  };

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
        background: ` #3498db`,
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
              fontWeight: 700,
              mb: 2,
              lineHeight: 1.2,
              '& span': {
                display: 'block'
              }
            }}
          >
            <Box component="span" sx={{ color: 'primary.light' }}>Fleet</Box>
            <Box component="span" sx={{ color: 'white' }}>Management</Box>
            <Box component="span">System</Box>
          </Typography>
          
          <Typography 
            variant={isMobile ? 'body1' : 'h6'} 
            sx={{ 
              mb: 4,
              opacity: 0.9,
              maxWidth: '600px'
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
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{
                px: 2,
                py: 1.5,
                backgroundColor: 'rgb(0, 0, 0)',
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
              size="large"
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
        
        <Box sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '100px',
          background: `linear-gradient(to top, ${theme.palette.background.default}, transparent)`,
          zIndex: 3
        }} />
      </Box>

     
    </Box>
  );
}