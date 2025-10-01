import React from 'react';
import { Chip, Box, Typography } from '@mui/material';
import { AttachMoney, TrendingUp, CheckCircle, Info } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledChip = styled(Chip)(({ theme, status }) => ({
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 4px 12px ${
      status === 'Pending' ? 'rgba(3, 169, 244, 0.3)' :
      status === 'MechanicsSelected' ? 'rgba(25, 118, 210, 0.3)' :
      status === 'Proposed' ? 'rgba(25, 118, 210, 0.3)' :
      status === 'Negotiating' ? 'rgba(255, 152, 0, 0.3)' :
      status === 'Agreed' ? 'rgba(76, 175, 80, 0.3)' :
      'rgba(158, 158, 158, 0.3)'
    }`
  }
}));

const CostDeliberationBadge = ({ 
  status, 
  proposedCost, 
  negotiatedCost, 
  finalCost, 
  onClick,
  showAmount = true 
}) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Info />;
      case 'MechanicsSelected': return <Info />;
      case 'Proposed': return <AttachMoney />;
      case 'Negotiating': return <TrendingUp />;
      case 'Agreed': return <CheckCircle />;
      default: return <Info />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'info';
      case 'MechanicsSelected': return 'primary';
      case 'Proposed': return 'primary';
      case 'Negotiating': return 'warning';
      case 'Agreed': return 'success';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Pending': return 'Cost Deliberation Pending';
      case 'MechanicsSelected': return 'Mechanics Selected';
      case 'Proposed': return 'Cost Proposed';
      case 'Negotiating': return 'Cost Negotiating';
      case 'Agreed': return 'Cost Agreed';
      default: return 'No Cost Deliberation';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getDisplayAmount = () => {
    if (finalCost) return formatCurrency(finalCost);
    if (negotiatedCost) return formatCurrency(negotiatedCost);
    if (proposedCost) return formatCurrency(proposedCost);
    return '';
  };

  if (!status) {
    return null;
  }

  return (
    <Box onClick={onClick} sx={{ cursor: 'pointer' }}>
      <StyledChip
        icon={getStatusIcon(status)}
        label={
          <Box>
            <Typography variant="body2" component="span">
              {getStatusLabel(status)}
            </Typography>
            {showAmount && getDisplayAmount() && (
              <Typography 
                variant="body2" 
                component="span" 
                sx={{ 
                  ml: 1, 
                  fontWeight: 'bold',
                  color: 'inherit'
                }}
              >
                {getDisplayAmount()}
              </Typography>
            )}
          </Box>
        }
        color={getStatusColor(status)}
        variant="outlined"
        status={status}
      />
    </Box>
  );
};

export default CostDeliberationBadge;

