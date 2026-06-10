import { Box, Typography } from '@mui/material';
import { SurveyorTable } from '@/components/SurveyorTable';

export default function SurveyorsPage() {
  return (
    <Box>
      <Typography variant="h4" mb={3}>Surveyors</Typography>
      <SurveyorTable />
    </Box>
  );
}
