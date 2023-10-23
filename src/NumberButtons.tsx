import { useEffect, useState, useRef } from 'react';
import { Erase } from './icon/Erase';

interface INumberButtons {
  onClick: Function;
}

export const NumberButtons = (props: INumberButtons) => {
  const {onClick} = props;
  const html = () => {
    const arr = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Backspace']
    let res = [];
    for (let i = 0; i < arr.length; i++) {
      res.push(<div key={arr[i]} style={{flexBasis: '11.1111%', fontSize: '48px', color: '#325aaf', cursor: 'pointer'}} onClick={(evt)=>{
        onClick(arr[i]);
      }}>{arr[i] === 'Backspace'? <Erase></Erase>:arr[i]}</div>);
    }
    return res;
  }
  return <div style={{display: 'flex', justifyContent: 'center'}}>
    <div style={{display: 'flex', width: '98vw',maxWidth: '423px', justifyContent: 'space-around'}}>{html()}</div>
  </div> 
}