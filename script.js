// battleship.js

let boardElement = document.getElementById('board');
let messageElement = document.getElementById('message');

let board = Array(10).fill().map(() => Array(10).fill('O'));  // 10x10 board
let shipSizes = [1, 2, 2, 3, 4, 5];
let ships = [];

shipSizes.forEach(placeShip);
renderBoard();

function placeShip(size) {
    let positions = getValidPositions(size);
    if (positions.length === 0) {
        throw new Error(`Unable to place ship of size ${size}`);
    }
    let {row, col, direction} = positions[Math.floor(Math.random() * positions.length)];
    for (let i = 0; i < size; i++) {
        if (direction === 'horizontal') {
            board[row][col + i] = 'S';
        } else {  // 'vertical'
            board[row + i][col] = 'S';
        }
    }
    ships.push({ row, col, size, direction, hits: 0 });
}

function getValidPositions(size) {
    let positions = [];
    for (let direction of ['horizontal', 'vertical']) {
        let maxRow = direction === 'horizontal' ? 10 : 10 - size;
        let maxCol = direction === 'horizontal' ? 10 - size : 10;
        for (let row = 0; row < maxRow; row++) {
            for (let col = 0; col < maxCol; col++) {
                let vacant = true;
                for (let i = 0; i < size; i++) {
                    if (direction === 'horizontal') {
                        if (!cellIsVacant(row, col + i)) {
                            vacant = false;
                            break;
                        }
                    } else {  // 'vertical'
                        if (!cellIsVacant(row + i, col)) {
                            vacant = false;
                            break;
                        }
                    }
                }
                if (vacant) {
                    positions.push({ row, col, direction });
                }
            }
        }
    }
    return positions;
}

// cellIsVacant function remains the same


function cellIsVacant(row, col) {
    for (let i = Math.max(0, row - 1); i <= Math.min(9, row + 1); i++) {
        for (let j = Math.max(0, col - 1); j <= Math.min(9, col + 1); j++) {
            if (board[i][j] !== 'O') {
                return false;
            }
        }
    }
    return true;
}


shipSizes.forEach(placeShip);


function renderBoard() {
    boardElement.innerHTML = '';  // Clear existing board
    for (let i = 0; i < 10; i++) {
        let rowElement = document.createElement('tr');
        for (let j = 0; j < 10; j++) {
            let cellElement = document.createElement('td');
            cellElement.textContent = board[i][j];
            cellElement.className = 'cell';
            cellElement.dataset.row = i;
            cellElement.dataset.col = j;
            if (board[i][j] === 'S') {
                cellElement.classList.add('ship');
            }
            cellElement.addEventListener('click', cellClick, false);
            rowElement.appendChild(cellElement);
        }
        boardElement.appendChild(rowElement);
    }
}

function cellClick(e) {
    let row = parseInt(e.target.dataset.row, 10);
    let col = parseInt(e.target.dataset.col, 10);
    if (board[row][col] === 'S') {
        // Hit! Check which ship is hit
        let ship = ships.find(ship => {
            if (ship.direction === 'horizontal') {
                return ship.row === row && ship.col <= col && ship.col + ship.size > col;
            } else {
                return ship.col === col && ship.row <= row && ship.row + ship.size > row;
            }
        });
        ship.hits++;
        e.target.classList.remove('ship');
        e.target.classList.add('hit');
        if (ship.hits === ship.size) {
            // The ship is sunk
            messageElement.textContent = 'You sank my battleship!';
            for (let i = 0; i < ship.size; i++) {
                let cellElement;
                if (ship.direction === 'horizontal') {
                    cellElement = boardElement.children[ship.row].children[ship.col + i];
                } else {
                    cellElement = boardElement.children[ship.row + i].children[ship.col];
                }
                cellElement.classList.remove('hit');
                cellElement.classList.add('sunk');
            }
        } else {
            // The ship is hit but not sunk
            messageElement.textContent = 'Hit!';
        }
    } else {
        // Miss
        e.target.classList.add('miss');
        messageElement.textContent = 'Miss!';
    }
    e.target.removeEventListener('click', cellClick, false);
}
