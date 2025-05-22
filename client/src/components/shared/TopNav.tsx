import styled from '@emotion/styled';

//divタグで画面全体の大枠のスタイルを定義
const NavWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 10px 0;
`;

//buttonタグでTopNavの4つのボタンのスタイルを定義
//真偽値で今どの画面がアクティブかを記録
const NavButton = styled.button<{ active?: boolean }>`
  background-color: ${({ active }) => (active ? '#ffaa33' : 'white')};
  color: black;
  font-weight: bold;
  border: 3px solid black;
  border-radius: 8px;
  padding: 5px 15px;
  cursor: pointer;
`;

export const TopNav = () => {
  return (
    <NavWrapper>
      <NavButton active>CREATE</NavButton>
      <NavButton>RHYTHM</NavButton>
      <NavButton>MELODY</NavButton>
      <NavButton>PLAY</NavButton>
    </NavWrapper>
  );
};

// export default TopNav;