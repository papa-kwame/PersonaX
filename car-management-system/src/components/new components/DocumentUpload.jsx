// DocumentUpload.js
import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
  Paper,
  styled,
  alpha,
  useTheme
} from '@mui/material';
import {
  InsertDriveFileRounded as InsertDriveFileRoundedIcon,
  DownloadRounded as DownloadRoundedIcon,
  CloudUploadRounded as CloudUploadRoundedIcon,
  EventRounded as EventRoundedIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../services/api';

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: '8px',
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 2px 12px ${alpha(theme.palette.primary.main, 0.1)}`
  }
}));

const DocumentUpload = ({ requestId, userId, token, documents, onDocumentUpload, onDocumentDownload }) => {
  const theme = useTheme();
  const [uploading, setUploading] = useState(false);

  const handleDocumentUpload = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post(`/api/MaintenanceRequest/${requestId}/upload-document?userId=${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      onDocumentUpload();
    } catch (error) {
      console.error('Failed to upload document:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentDownload = async (documentId, fileName) => {
    try {
      const response = await api.get(`/api/MaintenanceRequest/documents/${documentId}`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download document:', error);
    }
  };

  return (
    <Box>
      <StyledPaper elevation={0} sx={{ mb: 4, p: 3, borderRadius: '8px' }}>
        <Typography variant="overline" sx={{
          display: 'block',
          color: 'text.secondary',
          fontWeight: 600,
          letterSpacing: 1,
          fontSize: '0.7rem',
          mb: 2
        }}>
          Upload Document
        </Typography>
        <Box
          sx={{
            p: 3,
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            textAlign: 'center',
            backgroundColor: 'background.paper',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'action.hover',
              borderColor: 'primary.main',
              cursor: 'pointer'
            }
          }}
        >
          <input
            type="file"
            style={{ display: 'none' }}
            id={`upload-${requestId}`}
            onChange={(e) => handleDocumentUpload(e.target.files[0])}
            disabled={uploading}
          />
          <label htmlFor={`upload-${requestId}`}>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1
            }}>
              {uploading ? (
                <CircularProgress size={40} />
              ) : (
                <CloudUploadRoundedIcon sx={{
                  color: 'primary.main',
                  fontSize: '2.5rem'
                }} />
              )}
              <Typography variant="body2" sx={{
                color: 'primary.main',
                fontWeight: 500
              }}>
                Click to select file or drag and drop
              </Typography>
              <Typography variant="caption" sx={{
                color: 'text.secondary'
              }}>
                PDF, DOCX, XLSX up to 10MB
              </Typography>
            </Box>
          </label>
        </Box>
      </StyledPaper>
      {documents.length > 0 && (
        <StyledPaper elevation={0} sx={{ mb: 4, p: 3, borderRadius: '8px' }}>
          <Typography variant="overline" sx={{
            display: 'block',
            color: 'text.secondary',
            fontWeight: 600,
            letterSpacing: 1,
            fontSize: '0.7rem',
            mb: 2
          }}>
            Attached Documents ({documents.length})
          </Typography>
          <List disablePadding>
            {documents.map((document, index) => (
              <ListItem
                key={index}
                sx={{
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  py: 1.5,
                  px: 0,
                  '&:last-child': {
                    borderBottom: 'none'
                  }
                }}
                secondaryAction={
                  <Tooltip title="Download">
                    <IconButton
                      edge="end"
                      aria-label="download"
                      onClick={() => handleDocumentDownload(document.documentId, document.fileName)}
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1)
                        }
                      }}
                    >
                      <DownloadRoundedIcon color="primary" />
                    </IconButton>
                  </Tooltip>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main'
                  }}>
                    <InsertDriveFileRoundedIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{
                      fontWeight: 500,
                      color: 'text.primary'
                    }}>
                      {document.fileName}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" sx={{
                      color: 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}>
                      <EventRoundedIcon sx={{ fontSize: '0.9rem' }} />
                      {format(new Date(document.uploadDate), 'PPpp')}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </StyledPaper>
      )}
    </Box>
  );
};

export default DocumentUpload;
