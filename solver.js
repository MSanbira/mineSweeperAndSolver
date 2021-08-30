const grid = {};
const gridSize = Math.sqrt(document.querySelectorAll(".gameGrid > div").length);

const solverStart = () => {
    for (const cords in grid) delete grid[cords];
    populateGrid();
    middlePoint = parseInt(gridSize / 2);
    clickCell(`${middlePoint},${middlePoint}`);
    populateGrid();

    findNextToClick();
};

const findNextToClick = () => {
    let isFoundCellToClick = false;
    const optional = {};
    for (let i = 0; i < gridSize; i++) {
        if (isFoundCellToClick) {
            break;
        }
        for (let j = 0; j < gridSize; j++) {
            const cellValue = grid[`${i},${j}`];
            if (![null, "x", 0].includes(cellValue)) {
                const [nullCells, mineCells, neighbors] = getSusCells(i, j);
                if (nullCells.length) {
                    if (mineCells.length === cellValue) {
                        nullCells.forEach((c) => clickCell(c));
                        isFoundCellToClick = true;
                        break;
                    } else if (
                        mineCells.length + nullCells.length ===
                        cellValue
                    ) {
                        nullCells.forEach((c) => (grid[c] = "x"));
                    } else if (
                        Object.keys(optional).some((c) => neighbors.includes(c))
                    ) {
                        const toCheck = Object.keys(optional).filter((c) =>
                            neighbors.includes(c)
                        );

                        for (const c of toCheck) {
                            const nullCellsTemp = [...nullCells];
                            let isMatch = true;
                            for (const nc of optional[c].nullCells) {
                                const idx = nullCellsTemp.findIndex(
                                    (cell) => cell === nc
                                );
                                if (idx >= 0) {
                                    nullCellsTemp.splice(idx, 1);
                                } else {
                                    isMatch = false;
                                    break;
                                }
                            }
                            if (
                                isMatch &&
                                nullCellsTemp.length &&
                                mineCells.length + optional[c].asMines ===
                                    cellValue
                            ) {
                                nullCellsTemp.forEach((x) => clickCell(x));
                                break;
                            }
                        }
                    } else {
                        optional[`${i},${j}`] = {
                            ratio: nullCells.length / cellValue,
                            nullCells: nullCells,
                            asMines: cellValue - mineCells.length,
                        };
                    }
                }
            }
        }
    }

    if (!isFoundCellToClick) {
        key = Object.keys(optional).sort(
            (a, b) => optional[b].ratio - optional[a].ratio
        )[0];
        clickCell(
            key
                ? optional[key].nullCells[0]
                : Object.keys(grid).find((k) => grid[k] === null)
        );
    }

    if (!isGameOver && !isWon) {
        setTimeout(() => {
            populateGrid();
            findNextToClick();
        }, 20);
    }
};

const populateGrid = () => {
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const cellText = document.querySelector(
                `[data-coordinates="${i},${j}"]`
            ).innerText;
            if (cellText) {
                grid[`${i},${j}`] = cellText === "x" ? "x" : parseInt(cellText);
            } else if (grid[`${i},${j}`] === undefined) {
                grid[`${i},${j}`] = null;
            }
        }
    }
};

const clickCell = (cords) => {
    document.querySelector(`[data-coordinates="${cords}"]`)?.click();
};

const getSusCells = (i, j) => {
    const touchedKeys = getTouchedKeysS(i, j);
    const nullCells = [];
    const mineCells = [];
    touchedKeys.forEach((key) => {
        if (grid[key] === null) {
            nullCells.push(key);
        } else if (grid[key] === "x") {
            mineCells.push(key);
        }
    });

    return [nullCells, mineCells, touchedKeys.filter((x) => !!x)];
};

const getTouchedKeysS = (i, j) => {
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
