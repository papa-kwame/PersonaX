import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import '../styles/Home.css'; // Make sure to create this CSS file
import NavbarHome from '../components/shared/NavbarHome';
import HomeHero from'../assets/homehero.webp'
import { Box, Typography, Container, Grid, Card, CardContent, Avatar } from '@mui/material';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import Slider from 'react-slick';
import Footer from '../components/shared/Footer';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function Home() {
  useEffect(() => {
    // Add any initialization logic here
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
    slidesToScroll: 1
  };

  return (
    <div className="home-container">
      <NavbarHome/>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="title-part-1">Fleet</span>
            <span className="title-part-2">Management</span>
            <span className="title-part-3">System</span>
          </h1>
          <p className="hero-subtitle">
            Optimize your vehicle fleet operations with our comprehensive management solution
          </p>
          <div className="cta-buttons">
            <Link to="/login" className="btn btn-primary btn-lg">
              Get Started
              <span className="btn-icon">→</span>
            </Link>
            <Link to="/register" className="btn btn-outline-light btn-lg">
              Create Account
            </Link>
          </div>
        </div>
        <div className="hero-image">
        <div ><img className="floating-logo" src={HomeHero} alt="" /></div>
</div>
      </section>

       {/* Features */}
       <section className="features-section">
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" className="section-title" gutterBottom>
            Key Features
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={3} className="feature-card">
                <CardContent>
                  <Avatar className="feature-icon" sx={{ bgcolor: '#3b82f6', mb: 2 }}>
                    <DirectionsCarFilledIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h6">Vehicle Tracking</Typography>
                  <Typography variant="body2">
                    Real-time monitoring of all your fleet vehicles with detailed analytics.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={3} className="feature-card">
                <CardContent>
                  <Avatar className="feature-icon" sx={{ bgcolor: '#16a34a', mb: 2 }}>
                    <SettingsBackupRestoreIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h6">Maintenance Scheduling</Typography>
                  <Typography variant="body2">
                    Automated service reminders and maintenance history tracking.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={3} className="feature-card">
                <CardContent>
                  <Avatar className="feature-icon" sx={{ bgcolor: '#7c3aed', mb: 2 }}>
                    <InsertChartOutlinedIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h6">Performance Reports</Typography>
                  <Typography variant="body2">
                    Comprehensive reporting on fuel usage, mileage, and operational costs.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </section>

      {/* Testimonials Carousel */}
      <section className="testimonials-section">
        <Container maxWidth="md">
          <Typography variant="h4" align="center" className="section-title" gutterBottom>
            Trusted by Fleet Managers
          </Typography>
          <Slider {...settings}>
            {testimonials.map((item, index) => (
              <Card key={index} className="testimonial-card" elevation={2}>
                <CardContent>
                  <Typography className="testimonial-text" gutterBottom>
                    “{item.text}”
                  </Typography>
                  <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
                    <Avatar src={item.avatar} alt={item.name} />
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
            ))}
          </Slider>
        </Container>
      </section>

      <Footer />
    </div>
  );
}