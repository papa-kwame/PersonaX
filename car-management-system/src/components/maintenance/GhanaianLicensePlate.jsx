import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const GhanaianLicensePlate = ({ vehicleMake, vehicleModel, licensePlate }) => {
  const licensePlateStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    background: '#fff',
    color: '#000',
    border: '3px solid #000',
    borderRadius: '10px',
    fontFamily: 'Arial, sans-serif',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '16px auto',
    width: '200px',
    height: '150px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
    flexDirection: 'column',
    position: 'relative',
  };

  const plateRowStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '40px',
  };

  const topRowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: '4px',
    padding: '0 8px',
    fontSize: '20px',
  };

  const flagStyle = {
    width: '15px',
    height: '10px',
    objectFit: 'cover',
  };

  const [region, numberAndYear] = licensePlate.split('-');
  const mainNumber = numberAndYear?.slice(0, numberAndYear.length - 2);
  const year = numberAndYear?.slice(-2);

  return (
    <Box>
      <Typography variant="h6" sx={{ textAlign: 'center', mb: 1 }}>
        {vehicleMake} {vehicleModel}
      </Typography>
      <Box sx={licensePlateStyle}>
        <Box sx={topRowStyle}>
          <Typography variant="body1" sx={{ marginLeft: '40px', fontSize: '30px', marginRight: '25px' }}>
            {region}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Flag_of_Ghana.svg/640px-Flag_of_Ghana.svg.png"
              alt="Ghana Flag"
              style={flagStyle}
            />
            <Typography variant="body1" sx={{ marginLeft: '4px', fontSize: '8px' }}>GH</Typography>
          </Box>
        </Box>
        <Box sx={plateRowStyle}>
          <Typography variant="body1" sx={{ marginLeft: '4px', fontSize: '40px' }}>
            {mainNumber}-{year}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default GhanaianLicensePlate;