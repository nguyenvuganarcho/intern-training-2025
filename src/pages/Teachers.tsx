import { Box, Typography, Paper } from '@mui/material';

export default function Teachers() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Teachers
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Teacher list
        </Typography>
      </Paper>
    </Box>
  );
}