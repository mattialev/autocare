import { format, formatDistanceToNowStrict, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

export const formatDate = (value?: string) => {
  if (!value) return 'Non indicata';
  return format(parseISO(value), 'dd/MM/yyyy', { locale: it });
};

export const formatLongDate = (value?: string) => {
  if (!value) return 'Non indicata';
  return format(parseISO(value), 'd MMMM yyyy', { locale: it });
};

export const formatCurrency = (value?: number) => {
  if (value === undefined || Number.isNaN(value)) return '-';
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
};

export const formatKm = (value?: number) => {
  if (value === undefined || Number.isNaN(value)) return '-';
  return `${new Intl.NumberFormat('it-IT').format(value)} km`;
};

export const formatFileSize = (bytes?: number) => {
  if (!bytes) return '-';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  return `${size.toLocaleString('it-IT', { maximumFractionDigits: 1 })} ${units[index]}`;
};

export const relativeDueLabel = (daysLeft: number) => {
  if (daysLeft < 0) return `scaduto da ${Math.abs(daysLeft)} giorni`;
  if (daysLeft === 0) return 'oggi';
  if (daysLeft === 1) return 'domani';
  return `tra ${daysLeft} giorni`;
};

export const formatFromNow = (value?: string) => {
  if (!value) return '';
  return formatDistanceToNowStrict(parseISO(value), { locale: it, addSuffix: true });
};
