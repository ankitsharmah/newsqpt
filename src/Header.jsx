
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import TableChartIcon from '@mui/icons-material/TableChart';
const Header = () => {
  return (
    <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0' }}>
      <Toolbar>
        <Box display="flex" alignItems="center" component={RouterLink} to="/" sx={{ textDecoration: 'none', color: 'inherit' }}>
          <TableChartIcon sx={{ mr: 1 }} color="primary" />
          <Typography variant="h6" color="inherit" noWrap>
            PropertyDekho247
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Button color="primary" component={RouterLink} to="/">
          My Spreadsheets
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;