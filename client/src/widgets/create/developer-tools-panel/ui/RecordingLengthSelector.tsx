import { useBarCount } from "@entities/bar-count/model/BarCountContext";

export function RecordingLengthSelector() {
  const { barCount, setBarCount } = useBarCount();
  return (
    <select value={barCount} onChange={(e) => setBarCount(Number(e.target.value))}>
      <option value={1}>1 bar</option>
      <option value={2}>2 bar</option>
      <option value={4}>4 bar</option>
    </select>
  );
}
