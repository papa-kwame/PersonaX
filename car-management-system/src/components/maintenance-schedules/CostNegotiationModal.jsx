import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography
} from '@mui/material';

const CostNegotiationModal = ({
  openCostNegotiationDialog,
  setOpenCostNegotiationDialog,
  selectedCostRequest,
  costNegotiationForm,
  setCostNegotiationForm,
  handleSubmitCostNegotiation,
  loading
}) => {
  return (
    <Dialog
      open={openCostNegotiationDialog}
      onClose={() => setOpenCostNegotiationDialog(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        color: 'white',
        fontWeight: 600
      }}>
        💰 Negotiate Cost
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        {selectedCostRequest && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {selectedCostRequest.requestTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Vehicle:</strong> {selectedCostRequest.vehicleInfo}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Current Proposed Cost:</strong> ${selectedCostRequest.proposedCost?.toFixed(2)}
            </Typography>
            {selectedCostRequest.negotiatedCost && (
              <Typography variant="body2" color="text.secondary">
                <strong>Current Negotiated Cost:</strong> ${selectedCostRequest.negotiatedCost?.toFixed(2)}
              </Typography>
            )}
          </Box>
        )}
        
        <TextField
          fullWidth
          label="Negotiated Cost ($)"
          type="number"
          value={costNegotiationForm.negotiatedCost}
          onChange={(e) => setCostNegotiationForm({ ...costNegotiationForm, negotiatedCost: e.target.value })}
          InputProps={{
            startAdornment: <span style={{ color: '#f59e0b', fontWeight: 600 }}>$</span>
          }}
          sx={{ mb: 3 }}
        />
        
        <TextField
          fullWidth
          label="Comments (Optional)"
          multiline
          rows={4}
          value={costNegotiationForm.comments}
          onChange={(e) => setCostNegotiationForm({ ...costNegotiationForm, comments: e.target.value })}
          placeholder="Explain your negotiation reasoning..."
        />
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={() => setOpenCostNegotiationDialog(false)}
          sx={{ color: 'text.secondary' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmitCostNegotiation}
          variant="contained"
          disabled={loading || !costNegotiationForm.negotiatedCost}
          sx={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: 'white',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
            }
          }}
        >
          {loading ? 'Negotiating...' : 'Submit Negotiation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CostNegotiationModal;





