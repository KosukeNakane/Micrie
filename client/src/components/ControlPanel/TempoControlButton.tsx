//TEMPOボタン　スライダーと数値入力
import { useState, useEffect,useContext} from 'react';
import styled from '@emotion/styled';


import { TempoContext } from '../../context/TempoContext';

type Props = {
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

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 2px solid black;
  border-radius: 6px;
  margin-top: 4px;
  padding: 12px;
  width: 200px;
  z-index: 100;
`;

const Label = styled.label`
  font-size: 14px;
  margin-bottom: 4px;
  display: block;
`;

const Slider = styled.input`
  width: 100%;
  margin: 8px 0;
`;

const NumberInput = styled.input`
  width: 50%;
  padding: 4px;
  font-size: 16px;
  border: 2px solid black;
  border-radius: 4px;
  text-align: center;
`;

const TempoControlButton = ({ isOpen, onToggle }: Props) => {
  const tempoContext = useContext(TempoContext);
  if (!tempoContext) return null;
  const { tempo, setTempo } = tempoContext;
  const [tempoInput, setTempoInput] = useState(String(tempo));
  // スライダーでテンポ変更（数値直接）

  //React.ChangeEvent ここから読解
  //React.ChangeEvent<HTMLInputElement>はHTMLでいうinputタグに入った値の変化を読み取り、そのときにイベントを起こすという型
  //inputの変化以外はeには入れられない
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        //e.target.valueはe(inputの値の変化を読み取ってイベントを起こす)の要素(target)を見て、その値(value)を渡す
        const numeric = Number(e.target.value);
        
        setTempo(numeric);
        setTempoInput(String(numeric));
      };
  
  // 入力欄でテンポ変更（文字列 → 条件付きで数値化）
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
        setTempoInput(value);

        //入力欄でいれた数字をsetTempoにもいれることでウインドウ上部のところの値と同期させる
        const numeric = Number(value);
        if (numeric >= 40 && numeric <= 240) {
          setTempo(numeric);
        }
    }
  };

  // useEffect() は React に「特定の変化があったときに、何か処理をしてね」と伝えるためのフック
  // useEffect(() => { ... }, [依存する値]);
  // 今回はtempoに変化があったときにtempoInputにtempoの値を文字列として入れる
  useEffect(() => {
    setTempoInput(String(tempo));
  }, [tempo]);

  return (
    <Wrapper>
      <Button onClick={onToggle}>TEMPO</Button>
      {isOpen && (
        <Dropdown>
          <Label>TEMPO: {tempo} BPM</Label>
          {/* onChangeがフォームの中の値が変化したら{}の処理を実行するイベントハンドラ */}
          <Slider
            type="range"
            min="40"
            max="240"
            value={tempo}
            onChange={handleSliderChange}
          />
          <NumberInput
            type="text"
            min="40"
            max="240"
            value={tempoInput}
            onChange={handleInputChange}
          />
        </Dropdown>
      )}
    </Wrapper>
  );
};

export default TempoControlButton;