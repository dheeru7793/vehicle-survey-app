import { format, formatDistanceToNow } from 'date-fns';

export const fmtDate = (d?: string | Date | null) => {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return '—';
  return format(date, 'd MMM yyyy HH:mm');
};

export const fmtRelative = (d?: string | Date | null) => {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return '—';
  return formatDistanceToNow(date, { addSuffix: true });
};
