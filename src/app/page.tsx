import ReportForm from '@/components/ReportForm';
import { Container, Typography, Box, Paper } from '@mui/material';

export default function Home() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Toggl Report Generator
        </Typography>
        <Box mt={4}>
          <ReportForm />
        </Box>
      </Paper>
    </Container>
  );
}
