// オプションのドロップダウンメニューを持つコントロールボタンコンポーネント
import styled from '@emotion/styled';
import { StyledButton } from '../shared/RectButton.tsx';


type ControlButtonProps = {
  label: string;
  options: string[];
  isOpen: boolean;
  onToggle: () => void;
};

// ボタンとドロップダウンを包む相対配置のラッパー
const Wrapper = styled.div`
  position: relative;
  display: inline-block;
`;

 
// オプション項目をリスト表示するドロップダウンメニュー
const Dropdown = styled.ul`
  position: absolute;
  top: 100%;
  background: white;
  border: 2px solid black;
  border-radius: 6px;
  margin-top: 4px;
  list-style: none;
  padding: 6px;
  width: 140%;
  z-index: 100;
`;

// 各オプション項目のスタイルとホバー効果
const DropdownItem = styled.li`
  padding: 6px 12px;
  cursor: pointer;
  &:hover {
    background-color: #eee;
  }
`;

// ボタンと条件付きドロップダウン表示のコンポーネント本体
const ControlButton = ({ label, options, isOpen, onToggle  }: ControlButtonProps) => {
 return (
    <Wrapper>
      {/* クリックで onToggle を呼び出しドロップダウンの開閉を切り替える */}
      <StyledButton onClick={onToggle} active={isOpen}>{label}</StyledButton>
      {isOpen && (
        <Dropdown>
          {/* オプション配列をもとにドロップダウン項目を生成 */}
          {options.map((opt) => (
            <DropdownItem key={opt}>{opt}</DropdownItem>
          ))}
        </Dropdown>
      )}
    </Wrapper>
 );
};

export default ControlButton;