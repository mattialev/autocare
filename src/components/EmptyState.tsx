export const EmptyState = ({ title, action }: { title: string; action?: React.ReactNode }) => (
  <div className="empty-state">
    <p>{title}</p>
    {action}
  </div>
);
