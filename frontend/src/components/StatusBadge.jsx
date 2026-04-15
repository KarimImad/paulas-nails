const STATUS_MAP = {
  pending:   { label: 'En attente', cls: 'badge-pending'   },
  confirmed: { label: 'Confirmé',   cls: 'badge-confirmed' },
  cancelled: { label: 'Annulé',     cls: 'badge-cancelled' },
};

export default function StatusBadge({ status }) {
  const { label, cls } = STATUS_MAP[status] || STATUS_MAP.pending;
  return <span className={cls}>{label}</span>;
}
