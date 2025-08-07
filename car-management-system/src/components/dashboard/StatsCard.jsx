import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  alpha,
  Chip
} from "@mui/material";
import { ArrowForward as ArrowForwardIcon } from "@mui/icons-material";

const COLORS = {
  PRIMARY: '#1a1a1a',
  SECONDARY: '#6366f1',
  SUCCESS: '#10b981',
  ERROR: '#ef4444',
  WARNING: '#f59e0b',
  INFO: '#3b82f6',
  BACKGROUND: '#f8fafc',
  TEXT_PRIMARY: '#1e293b',
  TEXT_SECONDARY: '#64748b',
  DIVIDER: '#e2e8f0',
  WHITE: '#ffffff',
  BLACK: '#000000',
  CARD_BG: '#ffffff',
  CARD_BORDER: '#f1f5f9'
};

export default function StatsCard({ title, stats, link, linkText, icon, color }) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: `1px solid ${COLORS.CARD_BORDER}`,
        background: COLORS.CARD_BG,
        overflow: 'visible',
        position: 'relative',
        marginTop: 1.3,
        minWidth: 280,
        height: 200,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
          transition: 'all 0.3s ease'
        }
      }}
    >
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              backgroundColor: alpha(color, 0.1),
              color: color,
              mr: 2,
              border: `1px solid ${alpha(color, 0.2)}`
            }}
          >
            {icon}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: COLORS.TEXT_PRIMARY,
                fontSize: '1rem',
                lineHeight: 1.2
              }}
            >
              {title}
            </Typography>
          </Box>
        </Box>

        {/* Stats Content */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          position: 'relative'
        }}>
          {Object.entries(stats).map(([key, value]) => (
            <Box key={key} sx={{ textAlign: 'center' }}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 400,
                  fontSize: '3.5rem',
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                  color: color,
                  textShadow: `0 2px 4px ${alpha(color, 0.2)}`,
                  mb: 0.5
                }}
              >
                {value}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Link */}
        {link && linkText && (
          <Box sx={{ 
            mt: 'auto',
            pt: 2,
            borderTop: `1px solid ${alpha(COLORS.DIVIDER, 0.3)}`
          }}>
            <Link 
              to={link} 
              style={{ 
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: color,
                fontWeight: 600,
                fontSize: '0.875rem',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{linkText}</span>
              <ArrowForwardIcon 
                sx={{ 
                  fontSize: 20,
                  transition: 'transform 0.2s ease'
                }}
              />
            </Link>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}