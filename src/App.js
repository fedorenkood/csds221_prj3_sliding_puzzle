import logo from './logo.svg';
import './App.css';
import * as React from 'react';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }
function range(size, startAt = 0) {
  return [...Array(size).keys()].map(i => i + startAt);
}


class App extends React.Component {
  constructor(props) {
    super(props);
    const n = 3;
    const m = 3;
    const arr = range(n*m, 0);
    const newArr = [];
    while(arr.length) newArr.push(arr.splice(0,3));
    const emptyIndex = this.findIndex(newArr, 0);
    const layout = range(n*m, 0).map(k => {
      const row = Math.floor(k / n);
      const col = k % m;
      return [80 * col, 80 * row];
    });
    this.state = {
      n: n,
      m: m,
      positions: newArr,
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

  updatePosition(item) {
    let {positions, emptyIndex} = this.state;
    let targetIndex = this.findIndex(positions, item);
    const dif = Math.abs(targetIndex - emptyIndex);
    let dx = Math.abs(targetIndex[1] - emptyIndex[1]);
    let dy = Math.abs(targetIndex[0] - emptyIndex[0]);
    if (dy + dx == 1) {
      positions[targetIndex[0]][targetIndex[1]] = 0;
      positions[emptyIndex[0]][emptyIndex[1]] = item;
      emptyIndex = targetIndex;
      console.log(positions);

      this.setState({positions, emptyIndex});
    }
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
        </div>)
  }
}

export default App;
