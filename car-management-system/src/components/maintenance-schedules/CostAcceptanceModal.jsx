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

const CostAcceptanceModal = ({
  openCostAcceptanceDialog,
  setOpenCostAcceptanceDialog,
  selectedCostRequest,
  costAcceptanceForm,
  setCostAcceptanceForm,
  handleSubmitCostAcceptance,
  loading
}) => {
  return (
    <Dialog
      open={openCostAcceptanceDialog}
      onClose={() => setOpenCostAcceptanceDialog(false)}
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
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        color: 'white',
        fontWeight: 600
      }}>
        ✅ Accept Cost
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
              <strong>Proposed Cost:</strong> ${selectedCostRequest.proposedCost?.toFixed(2)}
            </Typography>
            {selectedCostRequest.negotiatedCost && (
              <Typography variant="body2" color="text.secondary">
                <strong>Negotiated Cost:</strong> ${selectedCostRequest.negotiatedCost?.toFixed(2)}
              </Typography>
            )}
            <Typography variant="body2" color="success.main" sx={{ mt: 2, fontWeight: 600 }}>
              You are accepting the {selectedCostRequest.negotiatedCost ? 'negotiated' : 'proposed'} cost.
            </Typography>
          </Box>
        )}
        
        <TextField
          fullWidth
          label="Comments (Optional)"
          multiline
          rows={4}
          value={costAcceptanceForm.comments}
          onChange={(e) => setCostAcceptanceForm({ ...costAcceptanceForm, comments: e.target.value })}
          placeholder="Any additional comments about accepting this cost..."
        />
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={() => setOpenCostAcceptanceDialog(false)}
          sx={{ color: 'text.secondary' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmitCostAcceptance}
          variant="contained"
          disabled={loading}
          sx={{
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            color: 'white',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
            }
          }}
        >
          {loading ? 'Accepting...' : 'Accept Cost'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CostAcceptanceModal;














