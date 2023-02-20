import Heap from 'heap-js';

export class PuzzleState {
    constructor(board, zero_pos, n, m, moves, goal_dict, parent) {
        this.board = board;
        this.zero_pos = zero_pos;
        this.n = n;
        this.m = m;
        this.moves = moves;
        this.goal_dict = goal_dict;
        this.manhattan = this.manhattan_distance(goal_dict);
        this.parent = parent;
    }

    get_state() {
        // let state = "";
        // for (let i = 0; i < this.n; i++) {
        //   for (let j = 0; j < this.m; j++) {
        //     state += this.board[i][j].toString();
        //   }
        // }
        return this.board.flat().join(' ');
    }

    make_move_copy(x, y) {
        if (x >= 0 && y >= 0 && x < this.n && y < this.m) {
            let board_copy = this.board.map(row => row.slice());
            board_copy[this.zero_pos[0]][this.zero_pos[1]] = board_copy[x][y];
            board_copy[x][y] = 0;
            return new PuzzleState(board_copy, [x, y], this.n, this.m, this.moves + 1, this.goal_dict, this);
        }
        return null;
    }

    get_neighbors() {
        let neighbors = [];
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        let x = this.zero_pos[0];
        let y = this.zero_pos[1];
        for (let [dx, dy] of directions) {
            let xx = x + dx;
            let yy = y + dy;
            let new_neighbor = this.make_move_copy(xx, yy);
            if (new_neighbor) {
                neighbors.push(new_neighbor);
            }
        }
        return neighbors;
    }

    manhattan_distance(goal_dict) {
        if (goal_dict === null) {
            return 0;
        }
        let distance = 0;
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.m; j++) {
                if (this.board[i][j] !== 0) {
                    let [x, y] = goal_dict[this.board[i][j]];
                    distance += Math.abs(i - x) + Math.abs(j - y);
                }
            }
        }
        return distance;
    }

    less_than(other) {
        if (this.moves < other.moves) {
            return true;
        }
        return this.moves + this.manhattan < other.moves + other.manhattan;
    }

    toString() {
        return this.get_state();
    }
}

export class SlidingPuzzleGame {
    constructor(n, m) {
        this.n = n;
        this.m = m;
    }
    generateDefaultArr(n, m) {
        const arr = [...Array(n*m).keys()].map(i => i);
        const newArr = [];
        while(arr.length) newArr.push(arr.splice(0,m));
        return newArr;
    }

    solve(board) {
        const goal = this.generateDefaultArr(this.n, this.m);
        const goal_dict = {};
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.m; j++) {
                goal_dict[goal[i][j]] = [i, j];
            }
        }
        let x = 0;
        let y = 0;
        // define a goal state
        console.log(goal_dict);
        let goal_state = new PuzzleState(goal, [x, y], this.n, this.m, 0, goal_dict, null);
        goal_state = goal_state.get_state();
        // Find the position of x and y
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.m; j++) {
                if (board[i][j] === 0) {
                    x = i;
                    y = j;
                }
            }
        }
        const state = new PuzzleState(board, [x, y], this.n, this.m, 0, goal_dict, null);
        const customPriorityComparator = (a, b) => a.manhattan + a.moves - (b.manhattan + b.moves);
        const q = new Heap(customPriorityComparator);
        q.push(state);
        const visited = {};

        while (q.length > 0) {
            const node = q.pop();

            if (node.get_state() === goal_state) {
                return node;
            }
            const neighbors = node.get_neighbors();
            for (let i = 0; i < neighbors.length; i++) {
                if (neighbors[i].get_state() in visited) {
                    if (visited[neighbors[i].get_state()] > neighbors[i].moves) {
                        q.push(neighbors[i]);
                        visited[neighbors[i].get_state()] = neighbors[i].moves;
                    }
                } else {
                    q.push(neighbors[i]);
                    visited[neighbors[i].get_state()] = neighbors[i].moves;
                }
            }
        }
        return -1;
    }

    // Helper function to deep copy an array
    deepCopy(arr) {
        return arr.map(row => row.slice());
    }

}