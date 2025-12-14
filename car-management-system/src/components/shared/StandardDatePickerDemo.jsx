import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Stack,
  Alert,
  Divider
} from '@mui/material';
import { CheckCircle, Speed, BugReport, CalendarToday } from '@mui/icons-material';
import StandardDatePicker from './StandardDatePicker';
import StandardDateTimePicker from './StandardDateTimePicker';

const StandardDatePickerDemo = () => {
  const [selectedDate1, setSelectedDate1] = useState(null);
  const [selectedDate2, setSelectedDate2] = useState(new Date());
  const [selectedDateTime1, setSelectedDateTime1] = useState(null);
  const [selectedDateTime2, setSelectedDateTime2] = useState(new Date());

  const benefits = [
    {
      icon: <Speed />,
      title: "Lightweight & Fast",
      description: "Uses standard MUI components with minimal wrapper code"
    },
    {
      icon: <CheckCircle />,
      title: "Consistent UX",
      description: "Same behavior and styling across all components"
    },
    {
      icon: <BugReport />,
      title: "Easy to Maintain",
      description: "Standard MUI DatePicker with built-in features"
    },
    {
      icon: <CalendarToday />,
      title: "Better Performance",
      description: "No custom rendering or complex animations"
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" sx={{ 
          fontWeight: 700, 
          mb: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Standardized Date Pickers
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Clean, consistent, and maintainable date picker components using standard MUI approach
        </Typography>
      </Box>

      {/* Benefits Grid */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {benefits.map((benefit, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              height: '100%',
              textAlign: 'center',
              p: 2,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
              }
            }}>
              <CardContent>
                <Box sx={{ 
                  color: 'primary.main', 
                  mb: 2,
                  '& .MuiSvgIcon-root': { fontSize: 40 }
                }}>
                  {benefit.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {benefit.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {benefit.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Demo Section */}
      <Paper sx={{ p: 4, borderRadius: 4, mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Live Demo
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
              Standard Date Picker
            </Typography>
            
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Basic Date Picker
                </Typography>
                <StandardDatePicker
                  value={selectedDate1}
                  onChange={setSelectedDate1}
                  label="Select a date"
                  format="dd/MM/yyyy"
                />
                {selectedDate1 && (
                  <Alert severity="success" sx={{ mt: 1 }}>
                    Selected: {selectedDate1.toLocaleDateString('en-GB')}
                  </Alert>
                )}
              </Box>

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  With Default Value
                </Typography>
                <StandardDatePicker
                  value={selectedDate2}
                  onChange={setSelectedDate2}
                  label="Pre-selected date"
                  format="dd/MM/yyyy"
                />
              </Box>

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Small Size
                </Typography>
                <StandardDatePicker
                  value={selectedDate1}
                  onChange={setSelectedDate1}
                  label="Small date picker"
                  size="small"
                  format="dd/MM/yyyy"
                />
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
              Date & Time Picker
            </Typography>
            
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Basic DateTime Picker
                </Typography>
                <StandardDateTimePicker
                  value={selectedDateTime1}
                  onChange={setSelectedDateTime1}
                  label="Select date and time"
                  format="dd/MM/yyyy HH:mm"
                />
                {selectedDateTime1 && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    Selected: {selectedDateTime1.toLocaleString('en-GB')}
                  </Alert>
                )}
              </Box>

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  With Default Value
                </Typography>
                <StandardDateTimePicker
                  value={selectedDateTime2}
                  onChange={setSelectedDateTime2}
                  label="Pre-selected datetime"
                  format="dd/MM/yyyy HH:mm"
                />
              </Box>

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Small Size
                </Typography>
                <StandardDateTimePicker
                  value={selectedDateTime1}
                  onChange={setSelectedDateTime1}
                  label="Small datetime picker"
                  size="small"
                  format="dd/MM/yyyy HH:mm"
                />
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Usage Example */}
      <Paper sx={{ p: 4, borderRadius: 4, backgroundColor: '#f8fafc' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Usage Example
        </Typography>
        
        <Box sx={{ 
          backgroundColor: '#1e293b', 
          borderRadius: 2, 
          p: 3, 
          overflow: 'auto',
          fontFamily: 'Monaco, Consolas, "Courier New", monospace'
        }}>
          <Typography component="pre" sx={{ 
            color: '#e2e8f0', 
            fontSize: '0.875rem',
            lineHeight: 1.6,
            margin: 0
          }}>
{`import StandardDatePicker from './components/shared/StandardDatePicker';
import StandardDateTimePicker from './components/shared/StandardDateTimePicker';

function MyComponent() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateTime, setSelectedDateTime] = useState(null);

  return (
    <div>
      <StandardDatePicker
        value={selectedDate}
        onChange={setSelectedDate}
        label="Select Date"
        format="dd/MM/yyyy"
        size="small"
      />
      
      <StandardDateTimePicker
        value={selectedDateTime}
        onChange={setSelectedDateTime}
        label="Select Date & Time"
        format="dd/MM/yyyy HH:mm"
        size="small"
      />
    </div>
  );
}`}
          </Typography>
        </Box>
      </Paper>

      {/* Benefits */}
      <Paper sx={{ p: 4, borderRadius: 4, mt: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Benefits of Standardized Approach
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              ✅ What's Better
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2">• Uses standard MUI DatePicker components</Typography>
              <Typography variant="body2">• Consistent behavior across all components</Typography>
              <Typography variant="body2">• Better performance (no custom rendering)</Typography>
              <Typography variant="body2">• Easier to maintain and debug</Typography>
              <Typography variant="body2">• Standard MUI styling and theming</Typography>
              <Typography variant="body2">• Built-in accessibility features</Typography>
              <Typography variant="body2">• Follows MUI best practices</Typography>
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              🗑️ What We Removed
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2">• Complex custom calendar rendering</Typography>
              <Typography variant="body2">• Heavy animations and transitions</Typography>
              <Typography variant="body2">• Custom date formatting logic</Typography>
              <Typography variant="body2">• Inconsistent styling across components</Typography>
              <Typography variant="body2">• Maintenance burden of custom code</Typography>
              <Typography variant="body2">• Potential performance bottlenecks</Typography>
              <Typography variant="body2">• 400+ lines of complex custom code</Typography>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default StandardDatePickerDemo;










