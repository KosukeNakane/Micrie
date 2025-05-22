//TEMPO VIBEボタンのまとめ
import TempoControlButton from './TempoControlButton';
import ControlButton from './ControlButton';

import { useState } from 'react';

export const ControlPanel = () => {

  //Stateを定義 openDropdownには'tempo'か'vibe'が入ることを宣言
  const [openDropdown, setOpenDropdown] = useState<'tempo' | 'vibe' | null>(null);
  

  //以下のコードはonToggleについて
  //onToggleが下の階層の方で呼ばれるとopenDropdownを押したボタンの方に固定できる
  //これによってisOpenでの処理でvibeを選んでたらvibeの方しかisOpenがtrueにならないので
  //tempoの方は表示が消えて、vibeの方のみ表示される
  //どっちかしかプルダウンを表示させなくするという意味でonToggleという変数名にしている

  //openDropdownの中身をnullかtargetかで切り替える関数
  //target(vibeかtempo)がはいってたらOpenDropdownがnullになるので
  //引数としてはtempoとvibeのみが許可されており、aaaとかの変な引数にならないようにしてる
  //toggleDropdownという関数が実行されると、setpenDropdownという関数によってopenDropdownがnullかtargetかでトグルされる
  const toggleDropdown = (target: 'tempo' | 'vibe') => {
      setOpenDropdown((prev) => (prev === target ? null : target));
    };
  
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
      <TempoControlButton
        onToggle={() => toggleDropdown('tempo')}
        isOpen={openDropdown === 'tempo'}
      />
      <ControlButton
        label="VIBE"
        options={['Happy', 'Dark', 'Chill']}


        //onToggleが呼ばれたらtoggleDropdown('vibe')を実行する
        onToggle={() => toggleDropdown('vibe')}

        //isOpenが呼ばれたら、openDropdownがvibeならisOpenがtrueとなりControlButton.tsxでの処理によりプルダウンメニューが表示される
        isOpen={openDropdown === 'vibe'}
      />
    </div>
  );
};