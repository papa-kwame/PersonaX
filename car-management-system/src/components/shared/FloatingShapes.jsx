import React from 'react';
import { Box } from '@mui/material';

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

const FloatingShapes = () => {
  // Generate particles for background
  const particles = Array.from({ length: 20 }).map((_, i) => (
    <Particle
      key={i}
      size={Math.random() * 12 + 3}
      top={Math.random() * 100}
      left={Math.random() * 100}
      delay={Math.random() * 5}
    />
  ));

  // Generate floating shapes - many more like the landing page
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
    { type: 'square', size: 18, top: 58, left: 25, delay: 3.1, duration: 6 },
    { type: 'triangle', size: 22, top: 72, left: 85, delay: 1.9, duration: 8 },
    { type: 'circle', size: 26, top: 42, left: 18, delay: 2.3, duration: 7 },
    { type: 'square', size: 24, top: 82, left: 62, delay: 0.6, duration: 5 },
    { type: 'triangle', size: 30, top: 28, left: 38, delay: 3.4, duration: 9 },
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

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    >
      {particles}
      {floatingShapes}
      
      {/* Animated circles */}
      <Box sx={{
        position: 'absolute',
        top: '10%',
        right: '15%',
        width: '200px',
        height: '200px',
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
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        border: '2px solid rgba(255, 255, 255, 0.03)',
        animation: 'pulse 12s infinite alternate-reverse',
        '@keyframes pulse': {
          '0%': { transform: 'scale(0.8)', opacity: 0.1 },
          '100%': { transform: 'scale(1.2)', opacity: 0.2 }
        }
      }} />
    </Box>
  );
};

export default FloatingShapes;
