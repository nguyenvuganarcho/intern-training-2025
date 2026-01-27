import { Box, Typography, Paper } from '@mui/material';

export default function Grades() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Grades
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Grade
        </Typography>
      </Paper>
    </Box>
  );
}