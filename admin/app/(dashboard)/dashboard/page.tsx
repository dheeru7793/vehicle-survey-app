import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import TodayIcon from '@mui/icons-material/Today';
import EventNoteIcon from '@mui/icons-material/EventNote';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import GroupIcon from '@mui/icons-material/Group';
import { backendFetch } from '@/lib/server/backend';
import { StatCard } from '@/components/StatCard';
import { DailyChart } from '@/components/DailyChart';
import { PerformanceChart } from '@/components/PerformanceChart';

export const dynamic = 'force-dynamic';

type Stats = {
  totals: {
    total: number;
    today: number;
    month: number;
    pending: number;
    failed: number;
    activeSurveyors: number;
  };
};
type Daily = { points: Array<{ _id: string; count: number }> };
type Perf = { items: Array<{ _id: { surveyorName: string }; count: number }> };

export default async function DashboardPage() {
  const [stats, daily, perf] = await Promise.all([
    backendFetch<Stats>('/admin/dashboard/stats'),
    backendFetch<Daily>('/admin/dashboard/daily?days=14'),
    backendFetch<Perf>('/admin/dashboard/surveyor-performance?days=30'),
  ]);

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        Dashboard
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard label="Total Surveys" value={stats.totals.total} icon={<DirectionsCarFilledIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard label="Today" value={stats.totals.today} icon={<TodayIcon />} color="#388E3C" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard label="This Month" value={stats.totals.month} icon={<EventNoteIcon />} color="#0288D1" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard label="Pending" value={stats.totals.pending} icon={<HourglassEmptyIcon />} color="#F57C00" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard label="Failed" value={stats.totals.failed} icon={<ErrorOutlineIcon />} color="#D32F2F" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard label="Active Surveyors" value={stats.totals.activeSurveyors} icon={<GroupIcon />} color="#7B1FA2" />
        </Grid>
      </Grid>

      <Grid container spacing={2} mt={1}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={1}>
                Surveys per day (last 14 days)
              </Typography>
              <DailyChart data={daily.points} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={1}>
                Surveyor performance (last 30 days)
              </Typography>
              <PerformanceChart data={perf.items} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
