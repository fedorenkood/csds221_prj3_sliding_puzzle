import logo from './logo.svg';
import './App.css';
import * as React from 'react';
import {PuzzleState, SlidingPuzzleGame} from './PuzzleGame';
import Button from '@mui/material/Button';
import {TextField, Typography} from "@mui/material";
import {SnackbarProvider, useSnackbar} from "notistack";

function range(size, startAt = 0) {
  return [...Array(size).keys()].map(i => i + startAt);
}

class App extends React.Component {
  constructor(props) {
    super(props);
    const n = 3;
    const m = 3;
    let [arr, emptyIndex, layout] = this.generateBasicVars(n, m);
    this.state = {
      n: n,
      m: m,
      nError: false,
      mError: false,
      nText: '',
      mText: '',
      nField: n,
      mField: m,
      positions: arr,
      emptyIndex: emptyIndex,
      layout: layout,
    }
  }

  findIndex(board, item) {
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[0].length; j++) {
        if (board[i][j] === item) {
          return ([i, j]);
        }
      }
    }
  }

  generateDefaultArr(n, m) {
    const arr = range(n*m, 0);
    const newArr = [];
    while(arr.length) newArr.push(arr.splice(0,m));
    return newArr;
  }

  generateBasicVars(n, m) {
    let arr = this.generateDefaultArr(n, m);
    let emptyIndex = this.findIndex(arr, 0);
    const layout = range(n*m, 0).map(k => {
      const row = Math.floor(k / m);
      const col = k % m;
      return [80 * col, 80 * row];
    });
    return [arr, emptyIndex, layout]
  }

  updatePosition(item) {
    let {positions, emptyIndex} = this.state;
    let targetIndex = this.findIndex(positions, item);
    let dx = Math.abs(targetIndex[1] - emptyIndex[1]);
    let dy = Math.abs(targetIndex[0] - emptyIndex[0]);
    if (dy + dx === 1) {
      positions[targetIndex[0]][targetIndex[1]] = 0;
      positions[emptyIndex[0]][emptyIndex[1]] = item;
      emptyIndex = targetIndex;
      console.log(positions);

      this.setState({positions, emptyIndex});
    }
  }

  // Shuffle the puzzle by randomly swapping the empty tile with one of its neighbors
  shuffle(board) {
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

  renderBlock(key, cellClass, x, y) {
    return <div  key={key}
                 className={cellClass}
                 onClick={() => this.updatePosition(key)}
                 style={{transform: 'translate3d('+x+'px,'+y+'px,0) scale(1.1)'}}>{key}</div>
  }

  renderBlocks() {
    return this.state.positions.flat().map((i, key)=> {
      let cellClass = key ? 'cell':'empty cell';
      let [x,y] = this.state.layout[this.state.positions.flat().indexOf(key)];
      return this.renderBlock(key, cellClass, x, y)
    });
  }

  render() {
    return (
        <div id="main" className="container">
          <div className="game" style={{width: this.state.m*77+'px', height: this.state.n*77+'px'}}>
            {this.renderBlocks()}
          </div>
          <div className="controls">
            <TextField id="outlined-basic" label="Size N" variant="outlined"
                       error={this.state.nError}
                       helperText={this.state.nText}
                       onChange={(e) => {
                         const regex = /^[2-6\b]+$/;
                         if (e.target.value === "" || regex.test(e.target.value)) {
                           this.setState({nField: e.target.value, nError: false, nText: ''});
                         } else {
                           this.setState({nError: true, nText: 'N must be a number between 2 and 6.'});
                         }
                       }}
            />
            <TextField id="outlined-basic" label="Size M" variant="outlined"
                       error={this.state.mError}
                       helperText={this.state.mText}
                       onChange={(e) => {
                         const regex = /^[2-6\b]+$/;
                         if (e.target.value === "" || regex.test(e.target.value)) {
                           this.setState({mField: e.target.value, mError: false, mText: ''});
                         } else {
                           this.setState({mError: true, mText: 'M must be a number between 2 and 5.'});
                         }
                       }}
            />
            <Button variant="outlined"
                    onClick={(e) => {
                      let n = this.state.nField;
                      let m = this.state.mField;
                      if (!(n===this.state.n && m === this.state.m) && this.state.n > 0 && this.state.m > 0) {
                        let [arr, emptyIndex, layout] = this.generateBasicVars(n, m);
                        this.setState({n: n, m: m, positions: arr, emptyIndex: emptyIndex, layout: layout})
                      }
                    }}
            >Update Size</Button>
            <Button variant="outlined"
                    onClick={(e) => {
                      let positions = this.state.positions;
                      for (let i = 0; i < 100; i++) {
                        positions = this.shuffle(positions);
                      }
                      this.setState({positions});
                    }}
            >Shuffle</Button>
            <Button variant="outlined"
                    onClick={(e) => {
                      let {n, m, positions} = this.state;
                      if (n *m <= 20) {
                        let solver = new SlidingPuzzleGame(n, m);
                        let node = solver.solve(positions);
                        const path = [];
                        while (node) {
                          path.unshift(node.board);
                          node = node.parent;
                        }
                        console.log(path);
                        let path_step = 0;
                        const interval = setInterval(() => {
                          if (path_step === path.length-1) clearInterval(interval);
                          this.setState({positions: path[path_step]});
                          path_step++;
                        }, 500);
                      } else {

                      }

                    }}
            >Solve</Button>
            <Typography variant="p" component="div" >
              FRAMEWORKS
            </Typography>
          </div>
        </div>)
  }
}

export default App;
