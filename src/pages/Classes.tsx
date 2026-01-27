import { Box, Typography, Paper } from '@mui/material';

export default function Classes() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Classes
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Class list
        </Typography>
      </Paper>
    </Box>
  );
}