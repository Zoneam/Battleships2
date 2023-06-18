let playerBoardElement = document.getElementById('player-board');
let computerBoardElement = document.getElementById('computer-board');
let messageElement = document.getElementById('message');

let playerBoard = Array(10).fill().map(() => Array(10).fill('O'));  // 10x10 board
let computerBoard = Array(10).fill().map(() => Array(10).fill('O'));  // 10x10 board
let shipSizes = [1, 2, 2, 3, 4, 5];
let playerShips = [];
let computerShips = [];

let cellClickHandlers = [];
window.onload = function() {
    shipSizes.forEach(size => placeShip(size, playerBoard, playerShips));
    shipSizes.forEach(size => placeShip(size, computerBoard, computerShips));
    renderBoard(playerBoard, playerBoardElement, null); 
    renderBoard(computerBoard, computerBoardElement, cellClick, cellClickHandlers);
}



function placeShip(size, board, ships) {
    let positions = getValidPositions(size, board);
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


function getValidPositions(size, board) {
    let positions = [];
    for (let direction of ['horizontal', 'vertical']) {
        let maxRow = direction === 'horizontal' ? 10 : 10 - size + 1;
        let maxCol = direction === 'horizontal' ? 10 - size + 1 : 10;
        for (let row = 0; row < maxRow; row++) {
            for (let col = 0; col < maxCol; col++) {
                let vacant = true;
                for (let i = 0; i < size; i++) {
                    if (direction === 'horizontal') {
                        if (col + i < 10 && !cellIsVacant(row, col + i, board)) {
                            vacant = false;
                            break;
                        }
                    } else {  // 'vertical'
                        if (row + i < 10 && !cellIsVacant(row + i, col, board)) { 
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


function cellIsVacant(row, col, board) {
    for (let i = Math.max(0, row - 1); i <= Math.min(9, row + 1); i++) {
        for (let j = Math.max(0, col - 1); j <= Math.min(9, col + 1); j++) {
            if (board[i][j] !== 'O') {
                return false;
            }
        }
    }
    return true;
}

function renderBoard(board, boardElement, clickHandler, handlers) {
    boardElement.innerHTML = ''; // Clear existing board
    for (let i = 0; i < 10; i++) {
        let rowElement = document.createElement('tr');
        for (let j = 0; j < 10; j++) {
            let cellElement = document.createElement('td');
            let cellContent = board[i][j];
            cellElement.textContent = cellContent;
            cellElement.className = 'cell';
            cellElement.dataset.row = i;
            cellElement.dataset.col = j;
            if (cellContent === 'S') {
                cellElement.style.backgroundColor = 'blue';
            } else if (cellContent === 'X') {
                cellElement.style.backgroundColor = 'red';
            } else if (cellContent === 'M') {
                cellElement.style.backgroundColor = 'lightblue';
            } else if (cellContent === 'D') {
                cellElement.style.backgroundColor = 'orange';
            } else if (cellContent === 'W') {
                cellElement.style.backgroundColor = 'red';
                cellElement.style.color = 'white';
            }
            if (clickHandler) {
                let wrapperHandler = function(e) {
                    clickHandler(e);
                };
                cellElement.addEventListener('click', wrapperHandler);
                cellElement.clickHandler = wrapperHandler; // Add clickHandler to cell object
                if (handlers) {
                    handlers.push({element: cellElement, handler: wrapperHandler});
                }
            }
            rowElement.appendChild(cellElement);
        }
        boardElement.appendChild(rowElement);
    }
}


  

  function processTurn(row, col, board, ships, target, clickHandler) {
    if (board[row][col] === 'S') {
        let ship = ships.find(ship => {
            if (ship.direction === 'horizontal') {
                return ship.row === row && ship.col <= col && ship.col + ship.size > col;
            } else {
                return ship.col === col && ship.row <= row && ship.row + ship.size > row;
            }
        });
        ship.hits++;
        board[row][col] = 'X';
        if (ship.hits === ship.size) {
            messageElement.textContent = `You sank ${target}'s battleship!`;
        } else {
            messageElement.textContent = `Hit on ${target}'s ship!`;
        }
    } else {
        board[row][col] = 'M';
        messageElement.textContent = `Miss on ${target}'s board!`;
    }
}


function cellClick(e) {
    let row = parseInt(e.target.dataset.row, 10);
    let col = parseInt(e.target.dataset.col, 10);
    processTurn(row, col, computerBoard, computerShips, 'computer', cellClick);
    // Only allow computer's turn if the game is not over
    if (!checkGameOver(computerShips, 'computer', cellClick)) {
        computerTurn();
    }
    renderBoard(playerBoard, playerBoardElement, null);
    renderBoard(computerBoard, computerBoardElement, cellClick, cellClickHandlers);
    // Disable click event for the clicked cell
    e.target.removeEventListener('click', e.target.clickHandler);
}



function checkGameOver(ships, playerName) {
    let allShipsSunk = ships.every(ship => ship.hits === ship.size);
    if (allShipsSunk) {
        messageElement.textContent = `${playerName} has lost. Game Over!`;
        // If game is over, remove click event listener from the computer's board
        cellClickHandlers.forEach(({element, handler}) => {
            element.removeEventListener('click', handler);
        });
        cellClickHandlers = []; // Clear out the handlers
    }
    return allShipsSunk;
}


function computerTurn() {
    while (true) {
        let row = Math.floor(Math.random() * 10);
        let col = Math.floor(Math.random() * 10);
        if (playerBoard[row][col] !== 'X' && playerBoard[row][col] !== 'M') {
            processTurn(row, col, playerBoard, playerShips, 'player', cellClick);
            break;
        }
    }
}