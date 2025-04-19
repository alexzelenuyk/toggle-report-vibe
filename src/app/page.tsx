import ReportForm from '@/components/ReportForm';
import { Container, Typography, Box, Paper } from '@mui/material';

export default function Home() {
  return (
    <Container maxWidth="md" sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 2 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          align="center"
          sx={{ 
            fontSize: { xs: '1.75rem', sm: '2.125rem' }
          }}
        >
          Toggl Report Generator
        </Typography>
        <Box mt={3}>
          <ReportForm />
        </Box>
      </Paper>
    </Container>
  );
}
