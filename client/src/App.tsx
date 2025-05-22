//import///////////////////////////////////////////////////

//Componet
import { AppContent } from "./components/AppContent";

//組み込みHooks 
import { useState } from "react";

//Context (グローバル変数)
import { TempoContext } from "./context/TempoContext";

//types (型の宣言)
import type { Mode } from './types/app';

//export///////////////////////////////////////////////////

export const App = () => {

 const [mode, setMode] = useState<Mode>('rhythm'); //importした型指定 {Mode}を使用
 const [tempo, setTempo] = useState(120);//importしたContext {TempoContext} はすでにexport時に型指定しているのでこちらでは型指定の記述なし

 return (
  <TempoContext.Provider value={{ tempo, setTempo }}> {/* TempoContextを適用させるために.Providerコンポーネントで囲む */}
    <AppContent mode={mode} setMode={setMode} />
  </TempoContext.Provider>
);
};






