import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button
} from '@mui/material';
import api from '../../services/api';

const CostDeliberationSection = ({
  costDeliberationRequests,
  fetchCostDeliberationRequests,
  userId,
  setSelectedCostRequest,
  setOpenCostProposalDialog,
  setOpenCostNegotiationDialog,
  setOpenCostAcceptanceDialog,
  setCostNegotiationForm,
  setCostAcceptanceForm
}) => {
  const getStatusInfo = (status) => {
    if (status === 'MechanicsSelected') {
      return { label: 'Proposal Required', color: 'warning', action: 'propose' };
    } else if (status === 'Proposed') {
      return { label: 'Proposed', color: 'info', action: 'both' };
    } else if (status === 'Negotiating') {
      return { label: 'Negotiating', color: 'warning', action: 'both' };
    } else if (status === 'Agreed') {
      return { label: 'Agreed', color: 'success', action: 'none' };
    } else {
      return { label: 'Pending', color: 'default', action: 'none' };
    }
  };

  return (
    <Box sx={{
      width: '50%',
      background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(37, 99, 235, 0.08)',
      border: '1px solid rgba(37, 99, 235, 0.1)',
      p: 4,
      mt: 4,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '120px',
        height: '120px',
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(37, 99, 235, 0.02) 100%)',
        borderRadius: '50%',
        transform: 'translate(30px, -30px)',
        zIndex: 0
      }} />
      
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          pb: 2,
        
          borderBottom: '1px solid rgba(37, 99, 235, 0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}>
              <span style={{ fontSize: '24px' }}>💰</span>
            </Box>
            <Box>
              <Typography variant="h8" fontWeight={400} sx={{ 
                color: '#1e293b',
                background: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Cost Deliberation Requests
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {costDeliberationRequests.length} active request{costDeliberationRequests.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={fetchCostDeliberationRequests}
              sx={{ 
                borderRadius: '12px',
                borderColor: 'rgba(37, 99, 235, 0.3)',
                color: '#2563eb',
                fontWeight: 600,
                textTransform: 'none',
                px: 3,
                py: 1,
                '&:hover': {
                  borderColor: '#2563eb',
                  backgroundColor: 'rgba(37, 99, 235, 0.04)'
                }
              }}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              onClick={async () => {
                try {
                  const response = await api.get(`/api/MaintenanceRequest/debug/cost-deliberation/${userId}`);
                  } catch (error) {
                  }
              }}
              sx={{ 
                borderRadius: '12px',
                borderColor: 'rgba(255, 0, 0, 0.3)',
                color: '#dc2626',
                fontWeight: 600,
                textTransform: 'none',
                px: 3,
                py: 1,
                '&:hover': {
                  borderColor: '#dc2626',
                  backgroundColor: 'rgba(220, 38, 38, 0.04)'
                }
              }}
            >
              Debug
            </Button>
          </Box>
        </Box>
      
        {costDeliberationRequests.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 6,
            px: 4,
            borderRadius: '12px',
            background: 'rgba(37, 99, 235, 0.02)',
            border: '2px dashed rgba(37, 99, 235, 0.2)'
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(37, 99, 235, 0.1)',
              margin: '0 auto 16px',
              color: '#2563eb'
            }}>
              <span style={{ fontSize: '32px' }}>💰</span>
            </Box>
            <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>
              No Cost Deliberation Requests
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: '400px', margin: '0 auto' }}>
              You will see cost deliberation requests here when a reviewer selects you to propose costs for maintenance requests.
            </Typography>
            <Button
              variant="outlined"
              onClick={fetchCostDeliberationRequests}
              sx={{ 
                borderRadius: '12px',
                borderColor: 'rgba(37, 99, 235, 0.3)',
                color: '#2563eb',
                fontWeight: 600,
                textTransform: 'none',
                px: 3,
                py: 1.5,
                '&:hover': {
                  borderColor: '#2563eb',
                  backgroundColor: 'rgba(37, 99, 235, 0.04)'
                }
              }}
            >
              Check Again
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontWeight: 500 }}>
              You have been selected for cost deliberation for the following maintenance requests:
            </Typography>
          
            <List>
              {costDeliberationRequests.map((request, index) => {
                const statusInfo = getStatusInfo(request.status);
                const hasProposedCost = request.proposedCost && request.proposedCost > 0;
                const hasNegotiatedCost = request.negotiatedCost && request.negotiatedCost > 0;
                const currentCost = hasNegotiatedCost ? request.negotiatedCost : (hasProposedCost ? request.proposedCost : null);
                const wasLastNegotiatedByCurrentUser = request.lastNegotiatedByUserId === userId;
                
                const canNegotiate = statusInfo.action === 'both' && currentCost && !wasLastNegotiatedByCurrentUser;
                const canAccept = statusInfo.action === 'both' && currentCost && !wasLastNegotiatedByCurrentUser;

                return (
                  <ListItem
                    key={index}
                    sx={{
                      mb: 3,
                      borderRadius: '16px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      border: '1px solid rgba(37, 99, 235, 0.1)',
                      p: 3,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #f0f4ff 0%, #e0f2fe 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(37, 99, 235, 0.15)',
                        borderColor: 'rgba(37, 99, 235, 0.2)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Chip 
                            label={statusInfo.label} 
                            color={statusInfo.color} 
                            size="small" 
                            sx={{ 
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              borderRadius: '8px',
                              px: 1,
                              py: 0.5,
                              '& .MuiChip-label': {
                                px: 1
                              }
                            }}
                          />
                          <Typography variant="subtitle2" fontWeight={600}>
                            {request.requestTitle}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Vehicle:</strong> {request.vehicleInfo}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Requested by:</strong> {request.requestedBy}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Selected on:</strong> {new Date(request.selectedDate).toLocaleDateString()}
                          </Typography>
                          {hasProposedCost && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              <strong>Proposed Cost:</strong> ${request.proposedCost?.toFixed(2)}
                            </Typography>
                          )}
                          {hasNegotiatedCost && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              <strong>Negotiated Cost:</strong> ${request.negotiatedCost?.toFixed(2)}
                            </Typography>
                          )}
                          {currentCost && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              <strong>Current Cost:</strong> ${currentCost?.toFixed(2)}
                            </Typography>
                          )}
                          {request.currentNegotiationRound > 0 && (
                            <Box sx={{ mb: 1 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                <strong>Negotiation Round:</strong> {request.currentNegotiationRound}
                              </Typography>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 0.5,
                                flexWrap: 'wrap'
                              }}>
                                {Array.from({ length: Math.min(request.currentNegotiationRound, 5) }, (_, i) => (
                                  <Box
                                    key={i}
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: '50%',
                                      bgcolor: i === request.currentNegotiationRound - 1 ? 'warning.main' : 'grey.400',
                                      border: i === request.currentNegotiationRound - 1 ? '2px solid' : 'none',
                                      borderColor: 'warning.dark'
                                    }}
                                  />
                                ))}
                                {request.currentNegotiationRound > 5 && (
                                  <Typography variant="caption" color="text.secondary">
                                    +{request.currentNegotiationRound - 5} more
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          )}
                          {request.comments && (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              "{request.comments}"
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, minWidth: '120px' }}>
                      {statusInfo.action === 'propose' && (
                        <Button
                          variant="contained"
                          onClick={() => {
                            setSelectedCostRequest(request);
                            setOpenCostProposalDialog(true);
                          }}
                          sx={{ 
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            py: 1.5,
                            background: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
                            color: 'white',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
                              boxShadow: '0 6px 20px rgba(37, 99, 235, 0.4)',
                              transform: 'translateY(-1px)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          Propose Cost
                        </Button>
                      )}
                      
                      {canNegotiate && (
                        <>
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setSelectedCostRequest(request);
                              setCostNegotiationForm({ 
                                negotiatedCost: currentCost.toString(), 
                                comments: '' 
                              });
                              setOpenCostNegotiationDialog(true);
                            }}
                            sx={{ 
                              borderRadius: '12px',
                              textTransform: 'none',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              py: 1.5,
                              borderColor: '#f59e0b',
                              color: '#f59e0b',
                              '&:hover': {
                                borderColor: '#d97706',
                                backgroundColor: 'rgba(245, 158, 11, 0.04)',
                                transform: 'translateY(-1px)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            Negotiate
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setSelectedCostRequest(request);
                              setCostAcceptanceForm({ comments: '' });
                              setOpenCostAcceptanceDialog(true);
                            }}
                            sx={{ 
                              borderRadius: '12px',
                              textTransform: 'none',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              py: 1.5,
                              borderColor: '#22c55e',
                              color: '#22c55e',
                              '&:hover': {
                                borderColor: '#16a34a',
                                backgroundColor: 'rgba(34, 197, 94, 0.04)',
                                transform: 'translateY(-1px)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            Accept
                          </Button>
                        </>
                      )}
                      
                      {statusInfo.action === 'both' && currentCost && wasLastNegotiatedByCurrentUser && !canNegotiate && (
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: 'rgba(59, 130, 246, 0.1)', 
                          borderRadius: '8px',
                          border: '1px solid rgba(59, 130, 246, 0.2)'
                        }}>
                          <Typography variant="body2" color="info.main" sx={{ fontWeight: 600, textAlign: 'center', mb: 1 }}>
                            Waiting for other party to respond...
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={async () => {
                              try {
                                const response = await api.get(`/api/MaintenanceRequest/${request.maintenanceRequestId}/cost-deliberation/history`);
                                alert(`Negotiation History:\n${response.data.history.map(h => 
                                  `Round ${h.sequenceNumber} (${h.negotiationType}): $${h.negotiatedAmount} by ${h.negotiatedBy}`
                                ).join('\n')}`);
                              } catch (error) {
                                }
                            }}
                            sx={{ 
                              fontSize: '0.7rem',
                              p: 0.5,
                              minWidth: 'auto',
                              borderColor: 'rgba(59, 130, 246, 0.3)',
                              color: 'info.main'
                            }}
                          >
                            View History
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CostDeliberationSection;





