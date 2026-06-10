'use client';

import { Card, CardContent, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export function StatCard({
  label,
  value,
  icon,
  color = 'primary.main',
}: {
  label: string;
  value: number | string;
  icon?: ReactNode;
  color?: string;
}) {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          {icon && (
            <Stack
              alignItems="center"
              justifyContent="center"
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: color,
                color: 'white',
              }}
            >
              {icon}
            </Stack>
          )}
          <Stack>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h5">{value}</Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
