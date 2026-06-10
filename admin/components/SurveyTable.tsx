'use client';

import {
  Box,
  Button,
  Chip,
  Stack,
  TextField,
  MenuItem,
  IconButton,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { fmtDate } from '@/lib/format';
import Link from 'next/link';

const STATUS_COLORS: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  DRAFT: 'default',
  PENDING: 'warning',
  UPLOADING: 'info',
  SYNCED: 'success',
  FAILED: 'error',
};

type Survey = {
  _id: string;
  vehicleNumber: string;
  surveyorName: string;
  status: string;
  photoCount: number;
  createdAt: string;
};

export function SurveyTable() {
  const [rows, setRows] = useState<Survey[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageModel, setPageModel] = useState<GridPaginationModel>({ page: 0, pageSize: 25 });
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/surveys', {
        params: {
          page: pageModel.page + 1,
          limit: pageModel.pageSize,
          vehicleNumber: q || undefined,
          status: status || undefined,
          from: from || undefined,
          to: to || undefined,
          sort: 'createdAt',
          order: 'desc',
        },
      });
      setRows(res.data.items);
      setTotal(res.data.page.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageModel.page, pageModel.pageSize]);

  const cols: GridColDef<Survey>[] = [
    {
      field: 'vehicleNumber',
      headerName: 'Vehicle',
      flex: 1,
      renderCell: (p) => (
        <Link href={`/surveys/${p.row._id}`} style={{ textDecoration: 'none' }}>
          <b>{p.row.vehicleNumber}</b>
        </Link>
      ),
    },
    { field: 'surveyorName', headerName: 'Surveyor', flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (p) => (
        <Chip
          size="small"
          label={p.row.status}
          color={STATUS_COLORS[p.row.status] ?? 'default'}
        />
      ),
    },
    { field: 'photoCount', headerName: 'Photos', width: 90, type: 'number' },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 200,
      renderCell: (p) => fmtDate(p.row.createdAt),
    },
  ];

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
        <TextField
          label="Vehicle number"
          size="small"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <TextField
          select
          label="Status"
          size="small"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All</MenuItem>
          {['PENDING', 'UPLOADING', 'SYNCED', 'FAILED'].map((s) => (
            <MenuItem key={s} value={s}>{s}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="From"
          size="small"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="To"
          size="small"
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" onClick={() => { setPageModel((m) => ({ ...m, page: 0 })); load(); }}>
          Search
        </Button>
        <IconButton onClick={load}>
          <RefreshIcon />
        </IconButton>
      </Stack>
      <Box sx={{ width: '100%' }}>
        <DataGrid
          autoHeight
          rows={rows}
          columns={cols}
          getRowId={(r) => r._id}
          loading={loading}
          paginationMode="server"
          paginationModel={pageModel}
          onPaginationModelChange={setPageModel}
          rowCount={total}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
        />
      </Box>
    </Stack>
  );
}
