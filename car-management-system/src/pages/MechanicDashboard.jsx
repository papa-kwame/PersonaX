import React, { useState } from 'react';
import { formatDateDisplay } from '../utils/dateUtils';
import { dummyRequests } from '../components/approval/dummyData';
import MechanicQuoteForm from '../components/mechanic/MechanicQuoteForm';
import MechanicWorkOrders from '../components/mechanic/MechanicWorkOrders';
import {
  Box, Typography, Tabs, Tab, Card, CardContent, Chip, Button, Stack, Divider, Avatar
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';

const tabLabels = [
  { label: 'Pending Quotes', value: 'pending', icon: <AssignmentIcon /> },
  { label: 'My Work Orders', value: 'assigned', icon: <BuildIcon /> },
  { label: 'Completed Repairs', value: 'completed', icon: <CheckCircleIcon /> },
];

const statusColors = {
  pending_mechanic: 'warning',
  in_progress: 'info',
  completed: 'success',
};

const MechanicDashboard = () => {
  const [requests, setRequests] = useState(dummyRequests);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');

  // Filter requests for mechanic view
  const pendingRequests = requests.filter(req => req.status === 'pending_mechanic');
  const assignedRequests = requests.filter(req => req.status === 'in_progress' && req.assignedMechanic === "Auto Repair Center");
  const completedRequests = requests.filter(req => req.status === 'completed' && req.assignedMechanic === "Auto Repair Center");

  const handleSubmitQuote = (quoteData) => {
    setRequests(requests.map(req => 
      req.id === selectedRequest.id ? { 
        ...req, 
        quote: quoteData, 
        status: 'pending_finance' 
      } : req
    ));
    setSelectedRequest(null);
    setActiveTab('pending');
  };

  const handleStartWork = (requestId) => {
    setRequests(requests.map(req => 
      req.id === requestId ? { 
        ...req, 
        status: 'in_progress',
        workStartedAt: new Date().toISOString()
      } : req
    ));
  };

  const handleCompleteWork = (requestId) => {
    const completionNotes = prompt("Enter completion notes and any additional details:");
    if (completionNotes) {
      setRequests(requests.map(req => 
        req.id === requestId ? { 
          ...req, 
          status: 'completed',
          workCompletedAt: new Date().toISOString(),
          completionNotes
        } : req
      ));
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 5, p: 3, background: '#fff', borderRadius: 4, boxShadow: 6 }}>
      <Typography variant="h4" fontWeight={900} color="primary.main" sx={{ mb: 2, letterSpacing: 1 }}>
        Mechanic Dashboard
      </Typography>
      <Tabs
        value={activeTab}
        onChange={(e, v) => setActiveTab(v)}
        indicatorColor="primary"
        textColor="primary"
        sx={{ mb: 3 }}
      >
        {tabLabels.map(tab => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={<Stack direction="row" alignItems="center" gap={1}>{tab.icon}{tab.label}</Stack>}
            sx={{ fontWeight: 700, fontSize: 16, textTransform: 'none' }}
          />
        ))}
      </Tabs>
      <Divider sx={{ mb: 3 }} />
          {selectedRequest ? (
            <MechanicQuoteForm 
              request={selectedRequest}
              onSubmit={handleSubmitQuote}
              onCancel={() => setSelectedRequest(null)}
            />
          ) : (
        <Box>
              {activeTab === 'pending' && (
            <Box>
                  {pendingRequests.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                  <AssignmentIcon sx={{ fontSize: 48, mb: 1, color: 'primary.light' }} />
                  <Typography variant="h6" fontWeight={700}>No pending quotes</Typography>
                  <Typography variant="body2">All caught up! Check back later for new requests.</Typography>
                </Box>
              ) : (
                <Stack spacing={3}>
                  {pendingRequests.map(request => (
                    <Card key={request.id} sx={{ borderRadius: 3, boxShadow: 3, p: 0 }}>
                      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Avatar sx={{ bgcolor: 'primary.light', width: 56, height: 56, mr: 2 }}>
                          <DirectionsCarIcon fontSize="large" />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight={800} color="primary.main">
                            Request #{request.id}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5, mb: 1 }}>
                            <Chip label={request.urgency} color="warning" size="small" sx={{ fontWeight: 700 }} />
                            <Chip label={request.department} color="info" size="small" />
                          </Stack>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {request.issueDescription}
                          </Typography>
                          <Stack direction="row" spacing={2}>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Vehicle:</strong> {request.vehicleId}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Mileage:</strong> {request.mileage}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Date:</strong> {formatDateDisplay(request.createdAt)}
                            </Typography>
                          </Stack>
                        </Box>
                        <Button
                          variant="contained"
                          color="primary"
                          sx={{ fontWeight: 700, borderRadius: 2, px: 3, py: 1, minWidth: 140 }}
                            onClick={() => setSelectedRequest(request)}
                          startIcon={<AssignmentIcon />}
                        >
                          Prepare Quote
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </Box>
          )}
              {activeTab === 'assigned' && (
                <MechanicWorkOrders 
                  requests={assignedRequests}
                  onComplete={handleCompleteWork}
                />
              )}
              {activeTab === 'completed' && (
            <Box>
                  {completedRequests.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                  <CheckCircleIcon sx={{ fontSize: 48, mb: 1, color: 'primary.light' }} />
                  <Typography variant="h6" fontWeight={700}>No completed repairs</Typography>
                  <Typography variant="body2">Work on assigned jobs to see them appear here.</Typography>
                </Box>
              ) : (
                <Stack spacing={3}>
                  {completedRequests.map(request => (
                    <Card key={request.id} sx={{ borderRadius: 3, boxShadow: 3, p: 0 }}>
                      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Avatar sx={{ bgcolor: 'success.light', width: 56, height: 56, mr: 2 }}>
                          <CheckCircleIcon fontSize="large" />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight={800} color="success.main">
                            Request #{request.id}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5, mb: 1 }}>
                            <Chip label={request.urgency} color="warning" size="small" sx={{ fontWeight: 700 }} />
                            <Chip label={request.department} color="info" size="small" />
                          </Stack>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {request.issueDescription}
                          </Typography>
                          <Stack direction="row" spacing={2}>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Vehicle:</strong> {request.vehicleId}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Mileage:</strong> {request.mileage}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Date:</strong> {formatDateDisplay(request.createdAt)}
                            </Typography>
                          </Stack>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default MechanicDashboard;