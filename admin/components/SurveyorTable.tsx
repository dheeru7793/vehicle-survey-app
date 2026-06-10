'use client';

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import KeyIcon from '@mui/icons-material/Key';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import BarChartIcon from '@mui/icons-material/BarChart';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { fmtDate } from '@/lib/format';

type Surveyor = {
  _id: string;
  employeeId: string;
  name: string;
  mobile: string;
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

export function SurveyorTable() {
  const [rows, setRows] = useState<Surveyor[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageModel, setPageModel] = useState<GridPaginationModel>({ page: 0, pageSize: 25 });
  const [q, setQ] = useState('');
  const [active, setActive] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Surveyor | null>(null);
  const [resetting, setResetting] = useState<Surveyor | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/surveyors', {
        params: {
          q: q || undefined,
          active: active || undefined,
          page: pageModel.page + 1,
          limit: pageModel.pageSize,
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

  const toggleActive = async (s: Surveyor) => {
    await api.post(`/admin/surveyors/${s._id}/${s.active ? 'deactivate' : 'activate'}`);
    load();
  };

  const cols: GridColDef<Surveyor>[] = [
    { field: 'employeeId', headerName: 'Employee ID', flex: 1 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'mobile', headerName: 'Mobile', width: 140 },
    {
      field: 'active',
      headerName: 'Status',
      width: 120,
      renderCell: (p) => (
        <Chip
          size="small"
          label={p.row.active ? 'Active' : 'Inactive'}
          color={p.row.active ? 'success' : 'default'}
        />
      ),
    },
    {
      field: 'lastLoginAt',
      headerName: 'Last login',
      width: 200,
      renderCell: (p) => fmtDate(p.row.lastLoginAt),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 220,
      sortable: false,
      renderCell: (p) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Stats">
            <IconButton size="small" component={Link} href={`/surveyors/${p.row._id}`}>
              <BarChartIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => setEditing(p.row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset password">
            <IconButton size="small" onClick={() => setResetting(p.row)}>
              <KeyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={p.row.active ? 'Deactivate' : 'Activate'}>
            <IconButton size="small" onClick={() => toggleActive(p.row)}>
              <PowerSettingsNewIcon
                fontSize="small"
                color={p.row.active ? 'warning' : 'success'}
              />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
        <TextField
          label="Search"
          size="small"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <TextField
          select
          label="Status"
          size="small"
          value={active}
          onChange={(e) => setActive(e.target.value)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="true">Active</MenuItem>
          <MenuItem value="false">Inactive</MenuItem>
        </TextField>
        <Button variant="contained" onClick={() => { setPageModel((m) => ({ ...m, page: 0 })); load(); }}>
          Search
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
          New surveyor
        </Button>
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

      <SurveyorCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={() => {
          setCreateOpen(false);
          load();
        }}
      />
      <SurveyorEditDialog
        surveyor={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          load();
        }}
      />
      <ResetPasswordDialog surveyor={resetting} onClose={() => setResetting(null)} />
    </Stack>
  );
}

function SurveyorCreateDialog({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [employeeId, setEmployeeId] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const save = async () => {
    setBusy(true);
    setErr(null);
    try {
      await api.post('/admin/surveyors', { employeeId, name, mobile, password });
      setEmployeeId('');
      setName('');
      setMobile('');
      setPassword('');
      onSaved();
    } catch (e) {
      const ax = e as { response?: { data?: { error?: { message?: string } } } };
      setErr(ax.response?.data?.error?.message ?? 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>New surveyor</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField label="Employee ID" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} />
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
          <TextField
            label="Initial password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="Min 6 characters. Surveyor should change after first login."
          />
          {err && <Box color="error.main">{err}</Box>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={save} disabled={busy}>
          {busy ? 'Saving…' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function SurveyorEditDialog({
  surveyor,
  onClose,
  onSaved,
}: {
  surveyor: Surveyor | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (surveyor) {
      setName(surveyor.name);
      setMobile(surveyor.mobile);
    }
  }, [surveyor]);

  if (!surveyor) return null;

  const save = async () => {
    setBusy(true);
    setErr(null);
    try {
      await api.patch(`/admin/surveyors/${surveyor._id}`, { name, mobile });
      onSaved();
    } catch (e) {
      const ax = e as { response?: { data?: { error?: { message?: string } } } };
      setErr(ax.response?.data?.error?.message ?? 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit surveyor — {surveyor.employeeId}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
          {err && <Box color="error.main">{err}</Box>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={save} disabled={busy}>
          {busy ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ResetPasswordDialog({
  surveyor,
  onClose,
}: {
  surveyor: Surveyor | null;
  onClose: () => void;
}) {
  const [pwd, setPwd] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!surveyor) return null;

  const submit = async () => {
    setBusy(true);
    setErr(null);
    try {
      await api.post(`/admin/surveyors/${surveyor._id}/reset-password`, { password: pwd });
      setDone(true);
    } catch (e) {
      const ax = e as { response?: { data?: { error?: { message?: string } } } };
      setErr(ax.response?.data?.error?.message ?? 'Reset failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open
      onClose={() => {
        setPwd('');
        setDone(false);
        onClose();
      }}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Reset password — {surveyor.employeeId}</DialogTitle>
      <DialogContent>
        {done ? (
          <Box>Password updated. Tell the surveyor the new password securely.</Box>
        ) : (
          <Stack spacing={2} mt={1}>
            <TextField
              label="New password"
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
            />
            {err && <Box color="error.main">{err}</Box>}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => {
          setPwd('');
          setDone(false);
          onClose();
        }}>
          Close
        </Button>
        {!done && (
          <Button variant="contained" onClick={submit} disabled={busy}>
            {busy ? 'Saving…' : 'Reset'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
