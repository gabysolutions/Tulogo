interface Props {
  label: string;
  className?: string;
  children: React.ReactNode;
}

export default function Field({ label, className = "", children }: Props) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-medium text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}