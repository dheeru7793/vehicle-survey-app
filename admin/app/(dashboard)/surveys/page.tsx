import { Box, Typography } from '@mui/material';
import { SurveyTable } from '@/components/SurveyTable';

export default function SurveysPage() {
  return (
    <Box>
      <Typography variant="h4" mb={3}>Surveys</Typography>
      <SurveyTable />
    </Box>
  );
}
