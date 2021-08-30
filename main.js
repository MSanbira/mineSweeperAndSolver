const boardSize = 20;
const minesNum = 80;
const cellsToBeClicked = boardSize * boardSize - minesNum;
const gameGrid = {};
const gridDom = document.querySelector(".gameGrid");
const gameStatusBtn = document.querySelector(".game-status");
let isGameOver = false;
let isWon = false;
let IsInitialClick = false;

gridDom.style = `--cols: ${boardSize}`;
gridDom.addEventListener("click", (e) => {
    if (!isGameOver && !e.target.classList.contains("clicked")) {
        const coordinates = e.target.getAttribute("data-coordinates");
        if (!IsInitialClick) {
            initialGame(coordinates);
            IsInitialClick = true;
        }
        if (coordinates) {
            const [i, j] = coordinates.split(",");
            const checkedZeroCords = [];
            handleClickedTile(i, j, checkedZeroCords);
            checkIsWon();
        }
    }
});
gridDom.addEventListener("contextmenu", (e) => {
    if (!isGameOver) {
        const coordinates = e.target.getAttribute("data-coordinates");
        if (coordinates) {
            e.preventDefault();
            const [i, j] = coordinates.split(",");
            toggleCellIsFlagged(i, j);
        }
    }
});

const resetGame = () => {
    for (const cords in gameGrid) delete gameGrid[cords];
    isGameOver = false;
    isWon = false;
    IsInitialClick = false;
    setMockGrid();
    gameStatusBtn.innerHTML = "RESET";
};

const setMockGrid = () => {
    let cellDoms = '';

    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            cellDoms += `<div data-coordinates="${i},${j}"></div>`;
        }
    }
    gridDom.innerHTML = cellDoms;
};

const initialGame = (cordsNotMine) => {
    const mineChance = minesNum / (boardSize * boardSize);
    let minesSoFar = 0;

    setMines(minesSoFar, mineChance, cordsNotMine);
    setNumbers();

};

const setMines = (minesSoFar, mineChance, cordsNotMine) => {
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            const isMine =
                Math.random() <= mineChance &&
                minesSoFar < minesNum &&
                `${i},${j}` !== cordsNotMine;
            const cellValue = getCellValue(i, j);
            if (isMine && cellValue !== "x") {
                minesSoFar++;
            }
            setCellValue(i, j, isMine ? "x" : cellValue || "o");
        }
    }
    if (minesSoFar < minesNum) {
        setMines(minesSoFar, mineChance, cordsNotMine);
    }
};

const setNumbers = () => {
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (getCellValue(i, j) !== "x") {
                setCellValue(i, j, countMineTouched(i, j));
            }
        }
    }
};

const countMineTouched = (i, j) => {
    return getTouchedKeys(i, j)
        .map((c) => gameGrid[c]?.value)
        .filter((x) => x === "x").length;
};

const getTouchedKeys = (i, j) => {
    i = parseInt(i);
    j = parseInt(j);
    return [
        `${i - 1},${j - 1}`,
        `${i - 1},${j}`,
        `${i - 1},${j + 1}`,
        `${i},${j - 1}`,
        `${i},${j + 1}`,
        `${i + 1},${j - 1}`,
        `${i + 1},${j}`,
        `${i + 1},${j + 1}`,
    ];
};

const handleClickedTile = (i, j, checkedZeroCords) => {
    const cellValue = getCellValue(i, j);
    if (cellValue === "x") {
        gameOver();
        return;
    }
    if (cellValue !== undefined) {
        setCellIsClicked(i, j, cellValue);
        const zeroCord = [];

        if (cellValue === 0) {
            const keys = getTouchedKeys(i, j);
            keys.forEach((cords) => zeroCord.push(checkShouldOpen(cords)));
        }
        zeroCord
            .filter((cords) => !!cords && !checkedZeroCords.includes(cords))
            .forEach((cords) => {
                checkedZeroCords.push(cords);
                handleClickedTile(
                    cords.split(",")[0],
                    cords.split(",")[1],
                    checkedZeroCords
                );
            });
    }
};

const checkShouldOpen = (cords) => {
    const [i, j] = cords.split(",");
    const cellValue = getCellValue(i, j);
    if (!getCellIsFlagged(i, j)) {
        const isZero = cellValue === 0;
        if (isZero) {
            return cords;
        }
        if (cellValue !== undefined && cellValue !== "x") {
            setCellIsClicked(i, j, cellValue);
        }
    }

    return;
};

const checkIsWon = () => {
    isWon =
        document.querySelectorAll(".gameGrid > div.clicked").length ===
        cellsToBeClicked;
    if (isWon) {
        gameStatusBtn.innerHTML = "YOU WON!";
    }
};

const gameOver = () => {
    isGameOver = true;
    Object.keys(gameGrid)
        .filter((c) => gameGrid[c].value === "x")
        .forEach((c) => {
            gameGrid[c].isClicked = true;
            const cellDom = document.querySelector(`[data-coordinates="${c}"`);
            cellDom.classList.add('boom');
            cellDom.innerText = '🧨';
        });

    gameStatusBtn.innerHTML = "GAME OVER";
};

const getCellValue = (i, j) => {
    return gameGrid[`${i},${j}`] && gameGrid[`${i},${j}`].value;
};

const setCellValue = (i, j, value) => {
    gameGrid[`${i},${j}`] = Object.assign({}, gameGrid[`${i},${j}`], { value });
};

const getCellIsClicked = (i, j) => {
    return !!gameGrid[`${i},${j}`] && gameGrid[`${i},${j}`].isClicked;
};

const setCellIsClicked = (i, j, cellValue) => {
    gameGrid[`${i},${j}`].isClicked = true;
    const cellDom = document.querySelector(`[data-coordinates="${i},${j}"`);
    cellDom.classList.add('clicked');
    cellDom.innerText = cellValue;
};

const getCellIsFlagged = (i, j) => {
    return !!gameGrid[`${i},${j}`] && gameGrid[`${i},${j}`].isFlagged;
};

const toggleCellIsFlagged = (i, j) => {
    gameGrid[`${i},${j}`].isFlagged = !gameGrid[`${i},${j}`].isFlagged;
    const cellDom = document.querySelector(`[data-coordinates="${i},${j}"`);
    cellDom.classList.toggle('flagged');
};

setMockGrid();
