import logo from './logo.svg';
import './App.css';
import * as React from 'react';
import {PuzzleState, SlidingPuzzleGame} from './PuzzleGame';
import Button from '@mui/material/Button';
import {TextField, Typography} from "@mui/material";
import {SnackbarProvider, useSnackbar} from "notistack";
import {useEffect, useState} from "react";

function range(size, startAt = 0) {
  return [...Array(size).keys()].map(i => i + startAt);
}

export default function App(props) {
  const [n, setN] = useState(3);
  const [m, setM] = useState(3);
  const [positions, setPositions] = useState([]);
  const [emptyIndex, setEmptyIndex] = useState([0, 0]);
  const [layout, setLayout] = useState([]);
  const [nError, setNError] = useState(false);
  const [mError, setMError] = useState(false);
  const [nText, setNText] = useState('');
  const [mText, setMText] = useState('');
  const [nField, setNField] = useState(n);
  const [mField, setMField] = useState(m);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    let [arr, emptyIndex, layout] = generateBasicVars(n, m);
    setPositions(arr);
    setEmptyIndex(emptyIndex);
    setLayout(layout);
  }, [n, m]);

  const findIndex = (board, item) => {
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[0].length; j++) {
        if (board[i][j] === item) {
          return ([i, j]);
        }
      }
    }
  }

  const generateDefaultArr = (n, m) => {
    const arr = range(n*m, 0);
    const newArr = [];
    while(arr.length) newArr.push(arr.splice(0,m));
    return newArr;
  }

  const generateBasicVars = (n, m) => {
    let arr = generateDefaultArr(n, m);
    let emptyIndex = findIndex(arr, 0);
    const layout = range(n*m, 0).map(k => {
      const row = Math.floor(k / m);
      const col = k % m;
      return [80 * col, 80 * row];
    });
    return [arr, emptyIndex, layout]
  }

  const updatePosition = (item) => {
    let targetIndex = findIndex(positions, item);
    let board = positions;
    let dx = Math.abs(targetIndex[1] - emptyIndex[1]);
    let dy = Math.abs(targetIndex[0] - emptyIndex[0]);
    if (dy + dx === 1) {
      board[targetIndex[0]][targetIndex[1]] = 0;
      board[emptyIndex[0]][emptyIndex[1]] = item;
      console.log(board);
      setEmptyIndex(targetIndex);
      setPositions(board);
    }
  }

  // Shuffle the puzzle by randomly swapping the empty tile with one of its neighbors
  const shuffle = (board) => {
    let n = board.length;
    let m = board[0].length;
    // Find the position of the empty tile
    let x, y;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        if (board[i][j] === 0) {
          x = i;
          y = j;
        }
      }
    }
    let goal_state = new PuzzleState(board, [x, y], n, m, 0, null, null);
    // Generate a list of neighboring tiles
    const neighborStates = goal_state.get_neighbors();
    const neighbors = [];
    for (let i = 0; i < neighborStates.length; i++) {
      neighbors.push(neighborStates[i].board);
    }

    // Randomly select a neighboring tile and swap it with the empty tile
    const randIndex = Math.floor(Math.random() * neighbors.length);
    return neighbors[randIndex];
  }

  const renderBlock = (key, cellClass, x, y) => {
    return <div  key={key}
                 className={cellClass}
                 onClick={() => updatePosition(key)}
                 style={{transform: 'translate3d('+x+'px,'+y+'px,0) scale(1.1)'}}>{key}</div>
  }

  const renderBlocks = () => {
    return positions.flat().map((i, key)=> {
      let cellClass = key ? 'cell':'empty cell';
      let [x,y] = layout[positions.flat().indexOf(key)];
      return renderBlock(key, cellClass, x, y)
    });
  }

  function* solvePuzzle() {
    let solver = new SlidingPuzzleGame(n, m);
    let node = solver.solve(positions);
    const path = [];
    while (node) {
      path.unshift(node.board);
      node = node.parent;
    }
    enqueueSnackbar(`Puzzle was successfully solved in ${path.length} steps!`, {
      variant: "success",
      autoHideDuration: 5000
      // anchorOrigin: { vertical: "top", horizontal: "right" }
    });
    console.log(path);
    let path_step = 0;
    const interval = setInterval(() => {
      if (path_step === path.length-1) clearInterval(interval);
      setPositions(path[path_step]);
      path_step++;
    }, 500);
  }

  function run(gen, mili){
    const iter = gen();
    const end = Date.now() + mili;
    do {
      const {value,done} = iter.next();
      if(done) return value;
      if(end < Date.now()){
        console.log("Halted function, took longer than " + mili + " miliseconds");
        enqueueSnackbar('Solution is too long!', {
          variant: "error",
          autoHideDuration: 5000
          // anchorOrigin: { vertical: "top", horizontal: "right" }
        });
        return null;
      }
    }while(true);
  }

  return (
      <div id="main" className="container">
        <div className="game" style={{width: m*77+'px', height: n*77+'px'}}>
          {renderBlocks()}
        </div>
        <div className="controls">
          <div className="row-container">
            <TextField id="outlined-basic" label="Size N" variant="outlined"
                       className="interaction-button"
                       error={nError}
                       helperText={nText}
                       onChange={(e) => {
                         const regex = /^[2-6\b]+$/;
                         if (e.target.value === "" || regex.test(e.target.value)) {
                           setNField(parseInt(e.target.value));
                           setNError(false);
                           setNText('');
                         } else {
                           setNError(false);
                           setNText('N must be a number between 2 and 6.');
                         }
                       }}
            />
            <TextField id="outlined-basic" label="Size M" variant="outlined"
                       className="interaction-button"
                       error={mError}
                       helperText={mText}
                       onChange={(e) => {
                         const regex = /^[2-6\b]+$/;
                         if (e.target.value === "" || regex.test(e.target.value)) {
                           setMField(parseInt(e.target.value));
                           setMError(false);
                           setMText('');
                         } else {
                           setMError(true);
                           setMText('M must be a number between 2 and 5.');
                         }
                       }}
            />
          </div>
          <div className="row-container">
            <Button variant="outlined"
                    className="interaction-button"
                    onClick={(e) => {
                      if (!(n===nField && m === mField) && nField > 0 && mField > 0) {
                        let [arr, emptyIndex, layout] = generateBasicVars(nField, mField);
                        setN(nField);
                        setM(mField);
                        setPositions(arr);
                        setEmptyIndex(emptyIndex);
                        setLayout(layout);
                      }
                    }}
            >Update Size</Button>
            <Button variant="outlined"
                    className="interaction-button"
                    onClick={(e) => {
                      let [arr, emptyIndex, layout] = generateBasicVars(n, m);
                      setPositions(arr);
                      setEmptyIndex(emptyIndex);
                      setLayout(layout);
                    }}
            >Reset</Button>
            <Button variant="outlined"
                    className="interaction-button"
                    onClick={(e) => {
                      let board = positions;
                      for (let i = 0; i < 10; i++) {
                        board = shuffle(board);
                      }
                      setPositions(board);
                    }}
            >Shuffle</Button>
            <Button variant="outlined"
                    className="interaction-button"
                    onClick={(e) => {
                      if (n*m <= 20) {
                        const res1 = run(solvePuzzle, 5000);
                        console.log("run(A,1000) = " + res1); //halted
                      } else {
                        enqueueSnackbar('The maximum size of sliding puzzle that is solvable is 4x5!', {
                          variant: "error",
                          autoHideDuration: 5000
                          // anchorOrigin: { vertical: "top", horizontal: "right" }
                        });
                      }

                    }}
            >Solve</Button>
          </div>
        </div>
      </div>)
}

