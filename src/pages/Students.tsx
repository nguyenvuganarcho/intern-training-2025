import { Box, Typography, Paper } from '@mui/material';

export default function Students() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Students
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Student list
        </Typography>
      </Paper>
    </Box>
  );
}