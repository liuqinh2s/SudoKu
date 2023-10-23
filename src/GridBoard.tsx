import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Point } from './interface';
import { NumberButtons } from './NumberButtons';
import { SudoKu } from '@liuqinh2s/sudoku-js';

interface IGridBoard {
  data: Array<Array<number>>;
}

const _GridBoard = (props: IGridBoard, ref)=> {
  const { data } = props;
  const [isAIAnswer, setIsAIAnswer] = useState(false);
  const [_data, setData] = useState(data);
  const [originData, setOriginData] = useState(JSON.parse(JSON.stringify(_data)));
  const [init, setInit] = useState(false);
  const [canvas, setCanvas] = useState({} as HTMLCanvasElement);
  const [context, setContext] = useState({} as any);
  const [width, setWidth] = useState(500);
  const [height, setHeight] = useState(500);
  // 待输入的单元格位置
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useImperativeHandle(ref, () => {
    // 需要将暴露的接口返回出去
    return {
      setData: (data) => {
        setData(data);
        setIsAIAnswer(true);
      },
    };
  });

  // 判断是否游戏结束
  useEffect(()=>{
    console.log('判断是否游戏结束')
    if(isAIAnswer){
      return;
    }
    if(SudoKu.verify(_data)){
      setTimeout(()=>{
        alert('游戏结束');
      }, 100)
    }
  }, [_data]);

  useEffect(() => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement
    setCanvas(canvas as any);
    setContext(canvas.getContext('2d') as any);
    setInit(true)
  }, []);

  useEffect(() => {
    if (!init) {
      return;
    }
    console.log(position, _data[position.y][position.x]);
    clearAllGridColor();
    // 九宫格，同行，同列高亮
    const positions = getPositions(position);
    for (let i = 0; i < positions.length; i++) {
      const p = positions[i];
      context.fillStyle = '#e2ebf3';
      context.fillRect(p.x * (width / 9), p.y * (height / 9), width / 9, height / 9);
    }
    context.fillStyle = '#bbdefb';
    context.fillRect(position.x * (width / 9), position.y * (height / 9), width / 9, height / 9);
    const conflict = wrongTips(position, _data[position.y][position.x]);
    drawBackGround();
    drawNumber();
    if (conflict) {
      drawRedNumber(position, _data[position.y][position.x]);
    }
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keyup', handleKeyUp);
    }
  }, [init, position.x, position.y, _data])

  useEffect(() => {
    if (!init) {
      return;
    }
    drawBackGround();
    drawNumber();
    // 点击事件
    canvas.addEventListener('click', getMousePos);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      canvas.removeEventListener('click', getMousePos);
      window.removeEventListener('keyup', handleKeyUp);
    }
  }, [init]);

  function inputHandler(key: string){
    console.log(key)
    if(originData[position.y][position.x] !== 0){
      return;
    }
    if (key === 'Backspace') {
      _data[position.y][position.x] = 0;
      setData([..._data]);
      setIsAIAnswer(false);
    } else if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(key)) {
      console.log('ddd')
      _data[position.y][position.x] = +key;
      setData([..._data]);
      setIsAIAnswer(false);
    }
  }

  // 按键输入
  function handleKeyUp(event: KeyboardEvent) {
    inputHandler(event.key)
  }

  function showMatrix() {
    for (let i = 0; i < _data.length; i++) {
      console.log(_data[i]);
    }
  }

  function wrongTips(position: Point, num: number) {
    console.log(num)
    if (num == 0) {
      return;
    }
    let conflict = false;
    // 同行是否冲突
    for (let i = 0; i < _data[position.y].length; i++) {
      if (i !== position.x && _data[position.y][i] === num) {
        drawRedBackground({ x: i, y: position.y }, '#f7cfd6');
        conflict = true;
      }
    }
    // 同列是否冲突
    for (let i = 0; i < _data.length; i++) {
      if (i !== position.y && _data[i][position.x] === num) {
        drawRedBackground({ x: position.x, y: i }, '#f7cfd6');
        conflict = true;
      }
    }
    // 同九宫格是否冲突
    const baseX = Math.floor(position.x / 3);
    const baseY = Math.floor(position.y / 3);
    for (let i = baseX * 3; i < baseX * 3 + 3; i++) {
      for (let j = baseY * 3; j < baseY * 3 + 3; j++) {
        if ((i !== position.x || j !== position.y) && _data[j][i] === num) {
          drawRedBackground({ x: i, y: j }, '#f7cfd6');
          conflict = true;
        }
      }
    }
    return conflict;
  }

  function drawRedBackground(position: Point, color: string) {
    context.fillStyle = color;
    context.fillRect(position.x * (width / 9), position.y * (height / 9), width / 9, height / 9);
  }

  // 返回高亮的格子的坐标
  function getPositions(position: Point) {
    const positions = [];
    // 同行
    for (let i = 0; i < 9; i++) {
      positions.push({ x: position.x, y: i });
    }
    // 同列
    for (let i = 0; i < 9; i++) {
      positions.push({ x: i, y: position.y });
    }
    // 同九宫格
    const baseX = Math.floor(position.x / 3);
    const baseY = Math.floor(position.y / 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        positions.push({ x: baseX * 3 + i, y: baseY * 3 + j });
      }
    }
    return positions;
  }

  // 清空格子颜色
  function clearAllGridColor() {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        context.fillStyle = 'white';
        context.fillRect(i * (width / 9), j * (height / 9), width / 9, height / 9);
      }
    }
  }

  // 获取鼠标点击的格点坐标
  function getMousePos(event: MouseEvent) {
    const canvas: HTMLCanvasElement = event.currentTarget as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    // 判断当前坐标所在单元格
    const positionX = Math.floor(x / (canvas.width / 9));
    const positionY = Math.floor(y / (canvas.height / 9));
    setPosition(() => {
      return { x: positionX, y: positionY };
    });
  }

  // 绘制背景
  function drawBackGround() {
    drawThinLine();
    drawThickLine();
    drawRect();

    function drawRect() {
      // 绘制矩形边框
      context.strokeStyle = '#344861';
      context.lineWidth = 4;
      context.strokeRect(0, 0, width, height);
    }

    function drawThinLine() {
      // 准备工作
      const column = new Path2D();
      column.moveTo(0.5, 0);
      column.lineTo(0.5, height);
      const row = new Path2D();
      row.moveTo(0, 0.5);
      row.lineTo(width, 0.5);
      const m1 = new DOMMatrix();
      const m2 = new DOMMatrix();
      const path = new Path2D();
      // 细线
      for (let i = 1; i < 9; i++) {
        if (i % 3 == 0) {
          continue;
        }
        m1.e = Math.floor(i * width / 9);
        m2.f = Math.floor(i * height / 9);
        path.addPath(column, m1);
        path.addPath(row, m2);
      }
      context.strokeStyle = '#d1d9e4';
      context.lineWidth = 1;
      context.stroke(path);
    }

    function drawThickLine() {
      // 准备工作
      const column = new Path2D();
      column.moveTo(0, 0);
      column.lineTo(0, height);
      const row = new Path2D();
      row.moveTo(0, 0);
      row.lineTo(width, 0);
      const m1 = new DOMMatrix();
      const m2 = new DOMMatrix();
      const path = new Path2D();
      // 粗线
      for (let i = 1; i < 3; i++) {
        m1.e = Math.floor(i * width / 3);
        m2.f = Math.floor(i * height / 3);
        path.addPath(column, m1);
        path.addPath(row, m2);
      }
      context.strokeStyle = '#344861';
      context.lineWidth = 2;
      context.stroke(path);
    }
  }

  function drawRedNumber(position: Point, num: number) {
    context.font = '36px Source Sans Pro,sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#e55c6c';
    context.fillText(num, Math.floor((position.x + 0.5) * width / 9), Math.floor((position.y + 0.6) * height / 9));
  }

  // 绘制数字
  function drawNumber() {
    for (let i = 0; i < _data.length; i++) {
      for (let j = 0; j < _data[i].length; j++) {
        if (_data[i][j] <= 0) {
          continue;
        }
        context.font = '36px Source Sans Pro,sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        let fillStyle = '#344861';
        if(originData[i][j] <= 0){
          fillStyle = '#b2bac9';
        }
        context.fillStyle = fillStyle;
        context.fillText(_data[i][j], Math.floor((j + 0.5) * height / 9), Math.floor((i + 0.6) * width / 9));
      }
    }
  }

  function numberButtonClickHandler(num: string) {
    inputHandler(num);
  }

  return (
    <>
      <main>
        <canvas id="canvas" width={width} height={height} style={{width: '98vw', height: '98vw', maxWidth: '423px', maxHeight: '423px'}}>你的浏览器不支持canvas!</canvas>
      </main>
      <NumberButtons onClick={numberButtonClickHandler}></NumberButtons>
    </>
  )
}

export const GridBoard = forwardRef(_GridBoard);