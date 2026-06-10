import { Box, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import { backendFetch } from '@/lib/server/backend';
import { fmtDate } from '@/lib/format';
import { StatCard } from '@/components/StatCard';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import TodayIcon from '@mui/icons-material/Today';
import EventNoteIcon from '@mui/icons-material/EventNote';

export const dynamic = 'force-dynamic';

type Stats = {
  surveyor: {
    _id: string;
    employeeId: string;
    name: string;
    mobile: string;
    active: boolean;
  };
  totals: { total: number; today: number; month: number };
  lastLoginAt: string | null;
};

export default async function SurveyorStatsPage({ params }: { params: { id: string } }) {
  const stats = await backendFetch<Stats>(`/admin/surveyors/${params.id}/stats`);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4">
          {stats.surveyor.name}{' '}
          <Typography component="span" color="text.secondary">
            ({stats.surveyor.employeeId})
          </Typography>
        </Typography>
        <Chip
          label={stats.surveyor.active ? 'Active' : 'Inactive'}
          color={stats.surveyor.active ? 'success' : 'default'}
        />
      </Stack>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Field label="Mobile" value={stats.surveyor.mobile || '—'} />
          <Field label="Last login" value={fmtDate(stats.lastLoginAt)} />
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <StatCard label="Total surveys" value={stats.totals.total} icon={<DirectionsCarFilledIcon />} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard label="This month" value={stats.totals.month} icon={<EventNoteIcon />} color="#0288D1" />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard label="Today" value={stats.totals.today} icon={<TodayIcon />} color="#388E3C" />
        </Grid>
      </Grid>
    </Box>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" sx={{ py: 0.75 }} spacing={2}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 110 }}>
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  );
}
