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
      
      {/* Hero Section */}
      <Box sx={{
        minHeight: '90vh',
        display: 'flex',
        flexDirection: isMobile ? 'column-reverse' : 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? theme.spacing(4) : theme.spacing(8),
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
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
            <Box component="span" sx={{ color: 'secondary.main' }}>Management</Box>
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
                px: 4,
                py: 1.5,
                borderRadius: '50px',
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
              color="inherit"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: '50px',
                fontWeight: 600,
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

      {/* Features Section */}
      <Box sx={{ py: 8, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            align="center" 
            sx={{ 
              mb: 6,
              fontWeight: 700,
              color: 'text.primary',
              position: 'relative',
              '&:after': {
                content: '""',
                display: 'block',
                width: '80px',
                height: '4px',
                backgroundColor: 'secondary.main',
                margin: '16px auto 0',
                borderRadius: '2px'
              }
            }}
          >
            Key Features
          </Typography>
          
          <Grid container spacing={4} justifyContent="center">
            {[
              {
                icon: <DirectionsCarFilledIcon fontSize="large" />,
                title: "Vehicle Tracking",
                description: "Real-time monitoring of all your fleet vehicles with detailed analytics.",
                color: theme.palette.primary.main
              },
              {
                icon: <SettingsBackupRestoreIcon fontSize="large" />,
                title: "Maintenance Scheduling",
                description: "Automated service reminders and maintenance history tracking.",
                color: theme.palette.success.main
              },
              {
                icon: <InsertChartOutlinedIcon fontSize="large" />,
                title: "Performance Reports",
                description: "Comprehensive reporting on fuel usage, mileage, and operational costs.",
                color: theme.palette.secondary.main
              }
            ].map((feature, index) => (
              <Grid item key={index} xs={12} sm={6} md={4}>
                <Card sx={{
                  height: '100%',
                  borderRadius: 3,
                  boxShadow: theme.shadows[4],
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[8]
                  }
                }}>
                  <CardContent sx={{
                    textAlign: 'center',
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                    <Avatar sx={{ 
                      bgcolor: feature.color, 
                      mb: 3,
                      width: 70,
                      height: 70,
                      '& svg': {
                        fontSize: '2rem'
                      }
                    }}>
                      {feature.icon}
                    </Avatar>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ 
        py: 8,
        backgroundColor: 'primary.light',
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))'
      }}>
        <Container maxWidth="md">
          <Typography 
            variant="h3" 
            align="center" 
            sx={{ 
              mb: 6,
              fontWeight: 700,
              color: 'common.white',
              position: 'relative',
              '&:after': {
                content: '""',
                display: 'block',
                width: '80px',
                height: '4px',
                backgroundColor: 'secondary.main',
                margin: '16px auto 0',
                borderRadius: '2px'
              }
            }}
          >
            Trusted by Fleet Managers
          </Typography>
          
          <Slider {...settings}>
            {testimonials.map((item, index) => (
              <Box key={index} sx={{ px: isMobile ? 1 : 4 }}>
                <Card sx={{
                  borderRadius: 3,
                  boxShadow: theme.shadows[6],
                  backgroundColor: 'background.paper',
                  p: 4,
                  textAlign: 'center'
                }}>
                  <CardContent>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        mb: 4,
                        fontStyle: 'italic',
                        fontWeight: 400,
                        color: 'text.primary',
                        position: 'relative',
                        '&:before, &:after': {
                          content: '"\\201C"',
                          fontSize: '4rem',
                          color: theme.palette.primary.light,
                          opacity: 0.3,
                          position: 'absolute'
                        },
                        '&:before': {
                          top: -20,
                          left: -10
                        },
                        '&:after': {
                          content: '"\\201D"',
                          bottom: -40,
                          right: -10
                        }
                      }}
                    >
                      {item.text}
                    </Typography>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      gap: 2,
                      mt: 3
                    }}>
                      <Avatar 
                        src={item.avatar} 
                        alt={item.name} 
                        sx={{ 
                          width: 60, 
                          height: 60,
                          border: `2px solid ${theme.palette.primary.main}`
                        }} 
                      />
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.role}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Slider>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}