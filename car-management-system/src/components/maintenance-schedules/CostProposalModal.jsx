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

const CostProposalModal = ({
  openCostProposalDialog,
  setOpenCostProposalDialog,
  selectedCostRequest,
  costProposalForm,
  setCostProposalForm,
  handleSubmitCostProposal,
  loading
}) => {
  return (
    <Dialog
      open={openCostProposalDialog}
      onClose={() => setOpenCostProposalDialog(false)}
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
        background: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
        color: 'white',
        fontWeight: 600
      }}>
        💰 Propose Cost
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
            <Typography variant="body2" color="text.secondary">
              <strong>Requested by:</strong> {selectedCostRequest.requestedBy}
            </Typography>
          </Box>
        )}
        
        <TextField
          fullWidth
          label="Proposed Cost ($)"
          type="number"
          value={costProposalForm.proposedCost}
          onChange={(e) => setCostProposalForm({ ...costProposalForm, proposedCost: e.target.value })}
          InputProps={{
            startAdornment: <span style={{ color: '#2563eb', fontWeight: 600 }}>$</span>
          }}
          sx={{ mb: 3 }}
        />
        
        <TextField
          fullWidth
          label="Comments (Optional)"
          multiline
          rows={4}
          value={costProposalForm.comments}
          onChange={(e) => setCostProposalForm({ ...costProposalForm, comments: e.target.value })}
          placeholder="Explain your cost breakdown, parts needed, labor hours, etc..."
        />
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={() => setOpenCostProposalDialog(false)}
          sx={{ color: 'text.secondary' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmitCostProposal}
          variant="contained"
          disabled={loading || !costProposalForm.proposedCost}
          sx={{
            background: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
            color: 'white',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)'
            }
          }}
        >
          {loading ? 'Submitting...' : 'Submit Proposal'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CostProposalModal;





