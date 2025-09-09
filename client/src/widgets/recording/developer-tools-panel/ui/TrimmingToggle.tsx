interface Props {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export const TrimmingToggle = ({ enabled, onChange }: Props) => {
  return (
    <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
      <input type="checkbox" checked={enabled} onChange={(e) => onChange(e.target.checked)} />
      Trimming
    </label>
  );
};

