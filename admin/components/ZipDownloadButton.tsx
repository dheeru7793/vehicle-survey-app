'use client';

import { Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useState } from 'react';

export function ZipDownloadButton({
  surveyId,
  vehicleNumber,
}: {
  surveyId: string;
  vehicleNumber: string;
}) {
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/proxy/surveys/${surveyId}/photos/zip`);
      if (!res.ok) throw new Error(`Download failed (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${vehicleNumber}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      onClick={download}
      startIcon={<DownloadIcon />}
      variant="outlined"
      disabled={busy}
    >
      {busy ? 'Preparing…' : 'Download ZIP'}
    </Button>
  );
}
