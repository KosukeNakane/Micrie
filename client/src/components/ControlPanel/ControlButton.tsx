//VIBEボタン
import styled from '@emotion/styled';

type ControlButtonProps = {
  label: string;
  options: string[];
  isOpen: boolean;
  onToggle: () => void;
};

const Wrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const Button = styled.button`
  background-color: white;
  color: black;
  font-weight: bold;
  border: 3px solid black;
  border-radius: 8px;
  padding: 6px 12px;
  cursor: pointer;
`;
;;
const Dropdown = styled.ul`
  position: absolute;
  top: 100%;
  right: -8px;
  background: white;
  border: 2px solid black;
  border-radius: 6px;
  margin-top: 4px;
  list-style: none;
  padding: 6px;
  width: 100%;
  z-index: 100;
`;

const DropdownItem = styled.li`
  padding: 6px 12px;
  cursor: pointer;
  &:hover {
    background-color: #eee;
  }
`;

const ControlButton = ({ label, options, isOpen, onToggle  }: ControlButtonProps) => {
 return (
    <Wrapper>
      {/* 
      このボタンを押すとonClickイベントハンドラによりonToggleって関数が実行される
      
      🔹 onClick={onToggle}
      → 関数を「そのまま渡す」。このやり方が基本

      🔹 onClick={() => onToggle()}
      → 無名関数を通して呼び出す。引数を渡すときや遅延評価したいときに使う
      
      onToggleはPropsとして別のページで使われるときに渡されるが
      VIBEボタンつくるときには
      onToggle={() => toggleDropdown('vibe')}
      として渡されている

      */}

      {/* VIBEボタンの場合、、、
      クリックすると onClickによってonToggleが呼ばれる、そしてtoggleDropdown('vibe')を実行され
      MELODYを選んでる状態なら　prev = target がfalseになるのでopenDropdownにvibeが入る
      VIBEを選んでる状態なら　prev = targert がtrueになるのでnullでvibeのままに。
      結局openDropdownには絶対にvibeが入る
      
      ここで決まったopenDropdownの値はこの下のisOpenのところで効いてくる
      */}
      <Button onClick={onToggle}>{label}</Button>

      {/* isOpenが呼び出される、isOpenではopenDropdown === 'vibe' が聞かれる
      onClickのところの処理によりVIBEボタンを押すとは必ずtrueになるので実際にプルダウンメニューが表示される
      */}
      {isOpen && (
        <Dropdown>
          {options.map((opt) => (
            <DropdownItem key={opt}>{opt}</DropdownItem>
          ))}
        </Dropdown>
      )}
    </Wrapper>
 );
};

export default ControlButton;