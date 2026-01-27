import { Box, Typography, Paper, Grid } from '@mui/material';
import { getUser } from '../utils/auth';

export default function Dashboard() {
  const user = getUser();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Welcome back!
            </Typography>
            <Typography variant="body1">
              Name: {user?.fullName}
            </Typography>
            <Typography variant="body1">
              Email: {user?.email}
            </Typography>
            <Typography variant="body1">
              Role: {user?.role}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Stats
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Coming soon...
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}