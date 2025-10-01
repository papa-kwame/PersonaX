import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  styled
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Fullscreen as FullscreenIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RotateRight as RotateIcon,
  InsertDriveFileRounded as InsertDriveFileRoundedIcon
} from '@mui/icons-material';
import api from '../../services/api';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    maxWidth: '80vw',
    maxHeight: '85vh',
    width: '80vw',
    height: '85vh',
    background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)',
    boxShadow: `
      0 20px 40px rgba(0, 0, 0, 0.12),
      0 10px 20px rgba(0, 0, 0, 0.08),
      0 5px 10px rgba(0, 0, 0, 0.04),
      inset 0 1px 0 rgba(255, 255, 255, 0.8)
    `,
    border: '1px solid rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(20px)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  '& .MuiBackdrop-root': {
    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%)',
    backdropFilter: 'blur(8px)'
  }
}));

const DocumentViewer = ({ 
  open, 
  onClose, 
  documentId, 
  fileName, 
  token,
  onDownload 
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  React.useEffect(() => {
    if (open && documentId) {
      loadDocument();
    }
  }, [open, documentId]);

  const loadDocument = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/api/MaintenanceRequest/documents/${documentId}`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const blob = new Blob([response.data]);
      const url = URL.createObjectURL(blob);
      setDocumentUrl(url);
    } catch (err) {
      setError('Failed to load document');
      } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(documentId, fileName);
    }
    onClose();
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getFileType = (filename) => {
    if (!filename || typeof filename !== 'string') {
      return 'unknown';
    }
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension || 'unknown';
  };

  const renderDocument = () => {
    const fileType = getFileType(fileName);
    
    if (loading) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          flexDirection: 'column',
          gap: 3,
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
        }}>
          <Box sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            <CircularProgress size={40} sx={{ color: 'white' }} />
          </Box>
          <Typography variant="h6" sx={{
            color: 'text.primary',
            fontWeight: 600,
            textAlign: 'center'
          }}>
            Loading Document
          </Typography>
          <Typography variant="body2" sx={{
            color: 'text.secondary',
            textAlign: 'center',
            maxWidth: 300
          }}>
            Please wait while we prepare your document for viewing...
          </Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="outlined" onClick={loadDocument}>
            Retry
          </Button>
        </Box>
      );
    }

    if (!documentUrl) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px' 
        }}>
          <Typography variant="body2" color="text.secondary">
            No document to display
          </Typography>
        </Box>
      );
    }

    // Render based on file type
    switch (fileType) {
      case 'pdf':
        return (
          <Box sx={{ 
            width: '100%', 
            flex: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'hidden'
          }}>
            <iframe
              src={documentUrl}
              width="100%"
              height="100%"
              style={{
                border: 'none',
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'top left',
                width: `${100 / (zoom / 100)}%`,
                height: `${100 / (zoom / 100)}%`
              }}
              title={fileName}
            />
          </Box>
        );

      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
      case 'avif':
        return (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            flex: 1,
            overflow: 'auto',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.1) 0%, transparent 50%)
              `,
              pointerEvents: 'none'
            }
          }}>
            <Box sx={{
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: `
                0 20px 40px rgba(0, 0, 0, 0.1),
                0 10px 20px rgba(0, 0, 0, 0.05),
                inset 0 1px 0 rgba(255, 255, 255, 0.8)
              `,
              border: '1px solid rgba(255, 255, 255, 0.3)',
              background: 'white',
              p: 2,
              minWidth: "100%",
              minHeight: "100%",
              justifyContent: "center",
              display: "flex",
              alignItems: "center",
            }}>
              <img
                src={documentUrl}
                alt={fileName}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transition: 'transform 0.3s ease',
                  borderRadius: '8px',
                  display: 'block'
                }}
              />
            </Box>
          </Box>
        );

      case 'txt':
        return (
          <Box sx={{ 
            width: '100%', 
            flex: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'auto',
            p: 2
          }}>
            <iframe
              src={documentUrl}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              title={fileName}
            />
          </Box>
        );

      default:
        return (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '400px',
            flexDirection: 'column',
            gap: 2
          }}>
            <Typography variant="h6" color="text.secondary">
              Preview not available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This file type ({fileType}) cannot be previewed inline
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
            >
              Download to view
            </Button>
          </Box>
        );
    }
  };

  return (
    <StyledDialog 
      open={open} 
      onClose={onClose}
      maxWidth={isFullscreen ? false : 'md'}
      fullWidth={!isFullscreen}
      fullScreen={isFullscreen}
    >
      <DialogTitle sx={{ 
        background: 'black',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pr: 2,
        py: 1.5,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)',
          animation: 'shimmer 3s ease-in-out infinite'
        },
        '@keyframes shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, position: 'relative', zIndex: 1 }}>
          <Box sx={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <InsertDriveFileRoundedIcon sx={{ fontSize: 18, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ 
              fontWeight: 700,
              fontSize: '1.1rem',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              {fileName}
            </Typography>
            <Typography variant="caption" sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {(getFileType(fileName) || 'unknown').toUpperCase()} Document
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative', zIndex: 1 }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '20px',
            px: 2,
            py: 1,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <IconButton
              size="small"
              onClick={handleZoomOut}
              sx={{ 
                color: 'white',
                '&:hover': { background: 'rgba(255, 255, 255, 0.2)' },
                '&:disabled': { opacity: 0.5 }
              }}
              disabled={zoom <= 50}
            >
              <ZoomOutIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <Typography variant="body2" sx={{ 
              color: 'white', 
              minWidth: '45px', 
              textAlign: 'center',
              fontWeight: 600,
              fontSize: '0.8rem'
            }}>
              {zoom}%
            </Typography>
            <IconButton
              size="small"
              onClick={handleZoomIn}
              sx={{ 
                color: 'white',
                '&:hover': { background: 'rgba(255, 255, 255, 0.2)' },
                '&:disabled': { opacity: 0.5 }
              }}
              disabled={zoom >= 300}
            >
              <ZoomInIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
          
          <IconButton
            size="small"
            onClick={handleRotate}
            sx={{ 
              color: 'white',
              background: 'rgba(255, 255, 255, 0.15)',
              '&:hover': { 
                background: 'rgba(255, 255, 255, 0.25)',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <RotateIcon sx={{ fontSize: 18 }} />
          </IconButton>
          
          <IconButton
            size="small"
            onClick={handleFullscreen}
            sx={{ 
              color: 'white',
              background: 'rgba(255, 255, 255, 0.15)',
              '&:hover': { 
                background: 'rgba(255, 255, 255, 0.25)',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <FullscreenIcon sx={{ fontSize: 18 }} />
          </IconButton>
          
          <IconButton
            onClick={onClose}
            sx={{ 
              color: 'white',
              background: 'rgba(255, 255, 255, 0.15)',
              ml: 1,
              '&:hover': { 
                background: 'rgba(255, 255, 255, 0.25)',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ 
        p: 0, 
        position: 'relative',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {renderDocument()}
      </DialogContent>

      <DialogActions sx={{ 
        p: 2, 
        background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
        borderTop: '1px solid rgba(226, 232, 240, 0.8)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            animation: 'pulse 2s ease-in-out infinite'
          }} />
          <Typography variant="caption" sx={{
            color: 'text.secondary',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Document Ready
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderRadius: '12px',
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: 'rgba(148, 163, 184, 0.3)',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'rgba(148, 163, 184, 0.5)',
                background: 'rgba(148, 163, 184, 0.05)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Close
          </Button>
          <Button
            onClick={handleDownload}
            variant="contained"
            startIcon={<DownloadIcon />}
            sx={{
              borderRadius: '12px',
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Download
          </Button>
        </Box>
      </DialogActions>
    </StyledDialog>
  );
};

export default DocumentViewer;
