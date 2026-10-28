import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string | Date): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(dateString);
  }
}

export function formatDateTime(dateString?: string | Date): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(dateString);
  }
}

export function maskApaarId(raw?: string): string {
  if (!raw) return 'N/A';
  const clean = raw.replace(/[\s-]/g, '');
  if (clean.length < 4) return '••••';
  const lastFour = clean.slice(-4);
  return `•••• •••• ${lastFour}`;
}

export function formatNoUnderscores(str?: string | null): string {
  if (!str) return '';
  return String(str).replace(/_/g, ' ');
}

export function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'VALID':
    case 'ACCEPTED':
    case 'VERIFIED':
    case 'ACTIVE':
    case 'SUCCESS':
    case 'NORMAL':
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    case 'NEAR_CAPACITY':
    case 'WARNING':
    case 'PENDING':
    case 'REQUIRES_MANUAL_REVIEW':
    case 'UNDER_INVESTIGATION':
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    case 'EXCESS_ENROLMENT':
    case 'CONFIRMED_DATA_ERROR':
    case 'MALFORMED':
    case 'MISSING':
    case 'DUPLICATE_CANDIDATE':
    case 'CROSS_INSTITUTION_FLAG':
    case 'EXCESS_INTAKE_FLAG':
    case 'FAILURE':
      return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    case 'LEGITIMATE_EXCEPTION':
    case 'RESOLVED':
      return 'bg-white/10 text-white border-white/20';
    default:
      return 'bg-slate-700/30 text-slate-300 border-slate-600/30';
  }
}

