import './App.css'
import { SudoKu } from '@liuqinh2s/sudoku-js';
import { GridBoard } from './GridBoard';
import { useEffect, useState, useRef } from 'react';

const initData = SudoKu.getEasySudoKu();

export default function App() {
  console.log('renderApp');
  const logo = 'SudoKu';
  const answer = 'AI Answer';
  const [data, setData] = useState(initData);
  const gridBoardRef = useRef(null);
  return <>
    <div style={{display: 'flex', justifyContent: 'space-around', width: '100vw', height: '40px'}}>
      <div style={{ color: '#344861', fontSize: '22px', fontWeight: '600', height: '40px', lineHeight: '40px'}}>{logo}</div>
      <div style={{ color: '#fe9ad4', fontSize: '18px', fontWeight: '600', height: '40px', lineHeight: '40px'}} onClick={()=>{
    if(gridBoardRef.current){
      (gridBoardRef.current as any).setData(SudoKu.solve(data));
    }
      }}>{answer}</div>
      <div style={{ color: '#325aaf', fontSize: '16px', fontWeight: '600', height: '40px', lineHeight: '40px'}} onClick={()=>{
      setData(SudoKu.getEasySudoKu());
      }}>{'New Game'}</div>
    </div>
    <GridBoard key={JSON.stringify(data)} ref={gridBoardRef} data={data}></GridBoard>
  </> 
}