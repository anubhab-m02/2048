class Game2048 {
    constructor() {
        this.gridSize = 4;
        this.grid = [];
        this.score = 0;
        this.tileContainer = document.getElementById('tile-container');
        this.scoreDisplay = document.getElementById('score');
        this.undoButton = document.getElementById('undo-button');
        this.tiles = new Map();
        this.previousState = null;
        this.previousScore = 0;
        this.initializeGrid();
        this.addEventListeners();
        this.spawnTile();
        this.spawnTile();
    }

    initializeGrid() {
        this.grid = Array.from({ length: this.gridSize }, () => 
            Array(this.gridSize).fill(0)
        );
    }

    createTile(value, row, col) {
        const tile = document.createElement('div');
        tile.classList.add('tile', `tile-${value}`);
        tile.textContent = value;
        this.setTilePosition(tile, row, col);
        this.tileContainer.appendChild(tile);
        return tile;
    }

    setTilePosition(tile, row, col) {
        const tileSize = `calc((100% - 45px) / 4)`;  // Size of one tile
        const gap = 15;  // Gap between tiles
        
        // Calculate position including gaps
        const top = `calc(${row} * (${tileSize} + ${gap}px))`;
        const left = `calc(${col} * (${tileSize} + ${gap}px))`;
        
        tile.style.top = top;
        tile.style.left = left;
    }

    spawnTile() {
        const emptyCells = [];
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                if (this.grid[r][c] === 0) {
                    emptyCells.push({ r, c });
                }
            }
        }

        if (emptyCells.length > 0) {
            const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const value = Math.random() < 0.9 ? 2 : 4;
            this.grid[r][c] = value;
            const tile = this.createTile(value, r, c);
            this.tiles.set(`${r}-${c}`, tile);
        }
    }

    move(direction) {
        let moved = false;
        
        // Save current state before move
        this.previousState = {
            grid: JSON.parse(JSON.stringify(this.grid)),
            score: this.score
        };
        
        switch (direction) {
            case 'ArrowLeft':
                moved = this.moveLeft();
                break;
            case 'ArrowRight':
                moved = this.moveRight();
                break;
            case 'ArrowUp':
                moved = this.moveUp();
                break;
            case 'ArrowDown':
                moved = this.moveDown();
                break;
        }

        if (moved) {
            this.updateTiles();
            this.scoreDisplay.textContent = this.score;
            setTimeout(() => this.spawnTile(), 150);

            if (this.isGameOver()) {
                setTimeout(() => alert('Game Over!'), 200);
            } else if (this.hasWon()) {
                setTimeout(() => alert('Congratulations! You won!'), 200);
            }
        }
    }

    updateTiles() {
        this.tileContainer.innerHTML = '';
        this.tiles.clear();
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                if (this.grid[r][c] !== 0) {
                    const tile = this.createTile(this.grid[r][c], r, c);
                    this.tiles.set(`${r}-${c}`, tile);
                }
            }
        }
    }

    undo() {
        if (this.previousState) {
            this.grid = JSON.parse(JSON.stringify(this.previousState.grid));
            this.score = this.previousState.score;
            this.scoreDisplay.textContent = this.score;
            this.updateTiles();
            this.previousState = null;
        }
    }

    moveLeft() {
        let moved = false;
        for (let r = 0; r < this.gridSize; r++) {
            const row = this.grid[r].filter(cell => cell !== 0);
            const newRow = [];
            
            for (let i = 0; i < row.length; i++) {
                if (i + 1 < row.length && row[i] === row[i + 1]) {
                    newRow.push(row[i] * 2);
                    this.score += row[i] * 2;
                    i++;
                    moved = true;
                } else {
                    newRow.push(row[i]);
                }
            }
            
            while (newRow.length < this.gridSize) {
                newRow.push(0);
            }
            
            if (JSON.stringify(this.grid[r]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            this.grid[r] = newRow;
        }
        return moved;
    }

    moveRight() {
        let moved = false;
        for (let r = 0; r < this.gridSize; r++) {
            const row = this.grid[r].filter(cell => cell !== 0);
            const newRow = Array(this.gridSize).fill(0);
            let position = this.gridSize - 1;
            
            for (let i = row.length - 1; i >= 0; i--) {
                if (i - 1 >= 0 && row[i] === row[i - 1]) {
                    newRow[position] = row[i] * 2;
                    this.score += row[i] * 2;
                    i--;
                    moved = true;
                } else {
                    newRow[position] = row[i];
                }
                position--;
            }
            
            if (JSON.stringify(this.grid[r]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            this.grid[r] = newRow;
        }
        return moved;
    }

    moveUp() {
        let moved = false;
        for (let c = 0; c < this.gridSize; c++) {
            const column = [];
            for (let r = 0; r < this.gridSize; r++) {
                if (this.grid[r][c] !== 0) {
                    column.push(this.grid[r][c]);
                }
            }
            
            const newColumn = [];
            for (let i = 0; i < column.length; i++) {
                if (i + 1 < column.length && column[i] === column[i + 1]) {
                    newColumn.push(column[i] * 2);
                    this.score += column[i] * 2;
                    i++;
                    moved = true;
                } else {
                    newColumn.push(column[i]);
                }
            }
            
            while (newColumn.length < this.gridSize) {
                newColumn.push(0);
            }
            
            for (let r = 0; r < this.gridSize; r++) {
                if (this.grid[r][c] !== newColumn[r]) {
                    moved = true;
                }
                this.grid[r][c] = newColumn[r];
            }
        }
        return moved;
    }

    moveDown() {
        let moved = false;
        for (let c = 0; c < this.gridSize; c++) {
            const column = [];
            for (let r = 0; r < this.gridSize; r++) {
                if (this.grid[r][c] !== 0) {
                    column.push(this.grid[r][c]);
                }
            }
            
            const newColumn = Array(this.gridSize).fill(0);
            let position = this.gridSize - 1;
            
            for (let i = column.length - 1; i >= 0; i--) {
                if (i - 1 >= 0 && column[i] === column[i - 1]) {
                    newColumn[position] = column[i] * 2;
                    this.score += column[i] * 2;
                    i--;
                    moved = true;
                } else {
                    newColumn[position] = column[i];
                }
                position--;
            }
            
            for (let r = 0; r < this.gridSize; r++) {
                if (this.grid[r][c] !== newColumn[r]) {
                    moved = true;
                }
                this.grid[r][c] = newColumn[r];
            }
        }
        return moved;
    }

    isGameOver() {
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                if (this.grid[r][c] === 0) return false;
                
                if (c < this.gridSize - 1 && this.grid[r][c] === this.grid[r][c + 1]) return false;
                if (r < this.gridSize - 1 && this.grid[r][c] === this.grid[r + 1][c]) return false;
            }
        }
        return true;
    }

    hasWon() {
        return this.grid.some(row => row.includes(2048));
    }

    addEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                this.move(e.key);
            }
        });

        this.undoButton.addEventListener('click', () => {
            this.undo();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new Game2048();
});
