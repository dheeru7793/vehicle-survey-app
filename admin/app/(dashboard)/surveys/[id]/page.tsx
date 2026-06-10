import { Box, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import { backendFetch } from '@/lib/server/backend';
import { fmtDate } from '@/lib/format';
import { PhotoGallery } from '@/components/PhotoGallery';
import { MapView } from '@/components/MapView';
import { ZipDownloadButton } from '@/components/ZipDownloadButton';

export const dynamic = 'force-dynamic';

type Survey = {
  _id: string;
  vehicleNumber: string;
  surveyorName: string;
  notes: string;
  status: string;
  photoCount: number;
  createdAt: string;
  syncedAt: string | null;
  location?: { coordinates: [number, number] };
};
type Photo = {
  _id: string;
  sequenceNo: number;
  url: string;
  thumbUrl: string;
  sizeBytes: number;
};

export default async function SurveyDetailPage({ params }: { params: { id: string } }) {
  const [{ survey }, { items: photos }] = await Promise.all([
    backendFetch<{ survey: Survey }>(`/surveys/${params.id}`),
    backendFetch<{ items: Photo[] }>(`/surveys/${params.id}/photos`),
  ]);

  const lat = survey.location?.coordinates[1];
  const lng = survey.location?.coordinates[0];

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4">{survey.vehicleNumber}</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label={survey.status} color={statusColor(survey.status)} />
          <ZipDownloadButton surveyId={survey._id} vehicleNumber={survey.vehicleNumber} />
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={1}>Details</Typography>
              <Field label="Surveyor" value={survey.surveyorName} />
              <Field label="Created" value={fmtDate(survey.createdAt)} />
              <Field label="Synced" value={fmtDate(survey.syncedAt)} />
              <Field label="Photos" value={String(survey.photoCount)} />
              <Field label="GPS" value={lat == null ? '—' : `${lat.toFixed(5)}, ${lng!.toFixed(5)}`} />
              <Field label="Notes" value={survey.notes || '—'} multiline />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 0 }}>
              {lat != null && lng != null ? (
                <MapView lat={lat} lng={lng} label={survey.vehicleNumber} />
              ) : (
                <Box p={3}>
                  <Typography color="text.secondary">No GPS captured for this survey.</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={1}>Photos ({photos.length})</Typography>
              <PhotoGallery photos={photos} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

function Field({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <Stack direction="row" sx={{ py: 0.75 }} spacing={2}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 90 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ whiteSpace: multiline ? 'pre-wrap' : 'normal' }}>
        {value}
      </Typography>
    </Stack>
  );
}

function statusColor(s: string): 'default' | 'success' | 'warning' | 'error' | 'info' {
  return ({
    DRAFT: 'default',
    PENDING: 'warning',
    UPLOADING: 'info',
    SYNCED: 'success',
    FAILED: 'error',
  } as const)[s] ?? 'default';
}
