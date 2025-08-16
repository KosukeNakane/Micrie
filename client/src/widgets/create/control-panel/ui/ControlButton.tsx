import styled from '@emotion/styled';

type Props = {
  label: React.ReactNode;
  options: string[];
  value?: string;
  onSelect?: (option: string) => void;
};

const Container = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const StyledSelect = styled.select`
  font-family: "brandon-grotesque", sans-serif;
  font-weight: 500;
  font-size: 14px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.87), rgb(212, 221, 240));
  color: rgba(5, 4, 69, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 10px;
  padding: 8px 10px;
  cursor: pointer;
  box-shadow: 0 6px 10px 0 rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(20px);
  appearance: none;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  font-family: "brandon-grotesque", sans-serif;
  color: rgba(5, 4, 69, 0.8);
`;

export default function ControlButton({ label, options, value, onSelect }: Props) {
  return (
    <Container>
      <Label>{label}</Label>
      <StyledSelect value={value} onChange={(e) => onSelect?.(e.target.value)}>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </StyledSelect>
    </Container>
  );
}
