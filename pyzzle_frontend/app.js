const enumImages = {
    1: "./assets/ninja/one.jpg",
    2: "./assets/ninja/two.jpg",
    3: "./assets/ninja/three.jpg",
    4: "./assets/ninja/four.jpg",
    5: "./assets/ninja/five.jpg",
    6: "./assets/ninja/six.jpg",
    7: "./assets/ninja/seven.jpg",
    8: "./assets/ninja/eight.jpg",
    0: 0,
};
let startBtn = document.querySelector("#startBtn");
let shuffleBtn = document.querySelector("#shuffleBtn");
let stopSimulationBtn = document.querySelector("#stopSimulationBtn");
document.addEventListener("keydown", (event) => {
    if (event.code === "Escape") {
        window.location.reload();
    }
});

class CreateGame {
    initialState = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 0],
    ];
    domFields = [];
    currentState = [];
    aiSteps = [];
    loading = false;
    simulationInterval = 1000;
    idInterval;
    isPlaying = false;
    simulationStarted = false;
    currentMove = 0;
    movesLeft;
    scoreBoard;
    constructor() {
        this.shuffleInitialState();
        this.overlay = document.getElementById("overlay");
        this.playStopButton = document.getElementById("playStopButton");
        this.scoreBoard = document.querySelector(".score");
        this.movesLeft = document.querySelector("#movesLeft");
        this.nodesExplored = document.querySelector("#nodesExplored");
    }

    async fetchSolution(algorithm, initial_state) {
        try {
            this.loading = true;
            const startBtn = document.getElementById("startBtn");
            startBtn.classList.add("loading");
            shuffleBtn.classList.add("loading");
            shuffleBtn.textContent = "Loading...";
            startBtn.textContent = "Loading...";

            const response = await fetch(
                `http://127.0.0.1:8000/game/start-game/${algorithm}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ initial_state }),
                }
            );

            if (!response.ok) {
                console.error("Failed to fetch solution", response.statusText);
                return;
            }

            const data = await response.json();
            if (data.steps == 0) {
                startBtn.classList.remove("loading");
                shuffleBtn.classList.remove("loading");
                shuffleBtn.textContent = "Izmesaj";
                startBtn.textContent = "Pokreni igru";
                return;
            }
            this.simulationStarted = true;
            this.isPlaying = false;
            this.toggleOverlay();

            this.scoreBoard.style.display = "flex";
            this.loading = false;
            this.aiSteps = data.steps;
            this.nodesExplored.innerHTML = data.nodes_explored;
            this.movesLeft.innerHTML = data.steps.length;
            this.currentMove = 0;
            clearInterval(this.idInterval);
            document.removeEventListener("keydown", this.controls);
            startBtn.innerHTML = "Simulacija u toku";
            startBtn.disabled = true;
            shuffleBtn.innerHTML = "Simulacija u toku";
            shuffleBtn.disabled = true;
            this.loading = false;
            document.addEventListener("keydown", this.controls);
        } catch (exception) {
            console.log(exception);
        }
    }
    controls = (event) => {
        if (!this.simulationStarted) return;

        if (event.code === "Space") {
            this.simulationInterval = 1000;
            this.isPlaying = !this.isPlaying;
            this.toggleOverlay();
            if (this.isPlaying) {
                this.startSimulation();
            } else {
                clearInterval(this.intervalId);
            }
        }

        if (event.code === "Enter") {
            this.isPlaying = !this.isPlaying;
            this.toggleOverlay();
            this.simulationInterval = 0;
            if (this.isPlaying) {
                this.startSimulation();
            } else {
                clearInterval(this.intervalId);
            }
        }
    };
    toggleOverlay(forceStop = true) {
        this.overlay.style.visibility =
            forceStop && this.simulationStarted && !this.isPlaying
                ? "visible"
                : "hidden";
    }
    startSimulation() {
        let moving = false;
        this.toggleOverlay();

        this.intervalId = setInterval(() => {
            if (this.currentMove >= this.aiSteps.length) {
                clearInterval(this.intervalId);
                this.isPlaying = false;
                this.simulationStarted = false;
                this.playStopButton.src = "./assets/images/play.png";
                return;
            }

            if (moving) return;

            moving = true;
            const indexToMove = this.aiSteps[this.currentMove];

            const x = Math.floor(indexToMove / 3);
            const y = indexToMove % 3;

            this.moveField(x, y);

            let movesLeft = document.querySelector("#movesLeft");
            movesLeft.innerText = this.aiSteps.length - this.currentMove - 1;
            this.currentMove++;
            moving = false;
        }, this.simulationInterval);
    }

    isSolvable(puzzle) {
        let inversions = 0;
        for (let i = 0; i < puzzle.length; i++) {
            for (let j = i + 1; j < puzzle.length; j++) {
                if (
                    puzzle[i] > puzzle[j] &&
                    puzzle[i] !== 0 &&
                    puzzle[j] !== 0
                ) {
                    inversions++;
                }
            }
        }
        return inversions % 2 === 0;
    }

    shuffleInitialState() {
        let flatArray = this.initialState.flat();
        let isShuffled = false;

        while (!isShuffled) {
            for (let i = flatArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [flatArray[i], flatArray[j]] = [flatArray[j], flatArray[i]];
            }
            isShuffled = this.isSolvable(flatArray);
        }
        this.currentState = [
            flatArray.slice(0, 3),
            flatArray.slice(3, 6),
            flatArray.slice(6, 9),
        ];
        clearInterval(this.idInterval);
        this.isPlaying = false;
        this.simulationStarted = false;
    }

    initializeEventListeners() {
        const fields = document.querySelectorAll(".field");
        fields.forEach((field) => {
            field.addEventListener("click", (e) => {
                if (!this.simulationStarted) {
                    const classList = Array.from(e.target.classList);
                    const posClass = classList.find((className) =>
                        className.startsWith("pos-")
                    );
                    if (posClass) {
                        const [x, y] = posClass.split("-").slice(1).map(Number);
                        this.moveField(x, y);
                    }
                }
            });
        });
    }

    moveField(x, y) {
        const directions = [
            [1, 0],
            [0, 1],
            [-1, 0],
            [0, -1],
        ];
        for (let [dx, dy] of directions) {
            const newX = x + dx;
            const newY = y + dy;
            if (
                newX >= 0 &&
                newX < this.currentState.length &&
                newY >= 0 &&
                newY < this.currentState[0].length &&
                this.currentState[newX][newY] === 0
            ) {
                this.updateField(x, y, newX, newY);
                return;
            }
        }
    }
    updateField(x, y, newX, newY) {
        [this.currentState[x][y], this.currentState[newX][newY]] = [
            this.currentState[newX][newY],
            this.currentState[x][y],
        ];

        const fieldChosen = document.querySelector(`.field.pos-${x}-${y}`);
        const fieldZero = document.querySelector(`.field.pos-${newX}-${newY}`);

        fieldChosen.classList.remove(`pos-${x}-${y}`);
        fieldChosen.classList.add(`pos-${newX}-${newY}`);
        fieldZero.classList.remove(`pos-${newX}-${newY}`);
        fieldZero.classList.add(`pos-${x}-${y}`);

        if (this.checkIfSolved()) {
            clearInterval(this.idInterval);
            document.removeEventListener("keydown", this.controls);

            this.toggleOverlay(false);
            this.isPlaying = false;
            this.simulationStarted = false;
            this.scoreBoard.style.display = "none";
            startBtn.innerHTML = "Pokreni igru";
            shuffleBtn.innerHTML = "Izmesaj";
            startBtn.classList.remove("loading");
            shuffleBtn.classList.remove("loading");
            startBtn.disabled = false;
            shuffleBtn.disabled = false;
            alert("Cestitamo !!");
        }
    }

    checkIfSolved() {
        return this.currentState.toString() === this.initialState.toString();
    }

    createStartTable() {
        this.domFields = Array.from(document.querySelectorAll(".field"));
        for (let i = 0; i < this.currentState.length; i++) {
            for (let j = 0; j < this.currentState[0].length; j++) {
                const index = i * this.currentState[0].length + j;
                const field = this.domFields[index];

                field.style.backgroundImage =
                    this.currentState[i][j] != 0
                        ? `url(${enumImages[this.currentState[i][j]]})`
                        : "none";

                field.classList.forEach((className) => {
                    if (className.startsWith("pos-")) {
                        field.classList.remove(className);
                    }
                });

                field.classList.add(`pos-${i}-${j}`);
            }
        }
        this.initializeEventListeners();
    }
    stopSimulation() {
        this.isPlaying = false;
        this.simulationStarted = startBtn;
        this.toggleOverlay(false);
        startBtn.classList.remove("loading");
        shuffleBtn.classList.remove("loading");
        shuffleBtn.textContent = "Izmesaj";
        startBtn.textContent = "Pokreni igru";
        startBtn.disabled = false;
        shuffleBtn.disabled = false;
        clearInterval(this.idInterval);
    }

    callBfs() {
        this.fetchSolution("bfs", this.currentState);
    }
    callBestFS() {
        this.fetchSolution("bestfs", this.currentState);
    }
    callAstarHamming() {
        this.fetchSolution("astar-hamming", this.currentState);
    }
    callAstarManhattan() {
        this.fetchSolution("astar-manhattan", this.currentState);
    }
}

const createGame = new CreateGame();
createGame.createStartTable();
stopSimulationBtn.addEventListener("click", () => {
    createGame.stopSimulation();
});
shuffleBtn.addEventListener("click", () => {
    createGame.shuffleInitialState();
    createGame.createStartTable();
});
startBtn.addEventListener("click", () => {
    let checkedBtn = document.querySelector("input:checked");
    switch (checkedBtn.value) {
        case "bfs":
            createGame.callBfs();
            break;
        case "bestfs":
            createGame.callBestFS();
            break;
        case "a-star-hamming":
            createGame.callAstarHamming();
            break;
        case "a-star-manhattan":
            createGame.callAstarManhattan();
            break;
    }
});
