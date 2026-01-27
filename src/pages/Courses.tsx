import { Box, Typography, Paper } from '@mui/material';

export default function Courses() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Courses
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Course
        </Typography>
      </Paper>
    </Box>
  );
}