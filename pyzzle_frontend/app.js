const enumImages = {
    1: "./assets/images/one.jpg",
    2: "./assets/images/two.jpg",
    3: "./assets/images/three.jpg",
    4: "./assets/images/four.jpg",
    5: "./assets/images/five.jpg",
    6: "./assets/images/six.jpg",
    7: "./assets/images/seven.jpg",
    8: "./assets/images/eight.jpg",
    0: 0,
};
let startBtn = document.querySelector("#startBtn");

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
    currentMove = 0;
    constructor() {
        this.shuffleInitialState();
        // this.initializeEventListeners();
    }

    async getBfsSolution(initial_state) {
        try {
            this.loading = true;
            startBtn = document.getElementById("startBtn");
            startBtn.classList.add("loading");
            startBtn.textContent = "Loading...";
            const response = await fetch(
                "http://127.0.0.1:8000/game/start-game/",
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
            this.loading = false;
            this.aiSteps = data.steps;
            this.currentMove = 0;
        } catch (exception) {
            console.log(exception);
        } finally {
            startBtn.classList.remove("loading");
            startBtn.textContent = "Pokreni igru";
            this.loading = false;
        }

        document.addEventListener("keydown", (event) => {
            console.log(event.code);
            if (event.code === "Space") {
                this.simulationInterval = 1000;
                if (this.isPlaying) {
                    clearInterval(this.intervalId);
                    this.isPlaying = false;
                } else {
                    this.startSimulation();
                }
            }
            if (event.code === "Enter") {
                this.simulationInterval = 0;
                this.startSimulation();
            }
        });
    }

    startSimulation() {
        this.isPlaying = true;
        let moving = false;
        this.intervalId = setInterval(() => {
            if (this.currentMove >= this.aiSteps.length) {
                clearInterval(this.intervalId);
                this.isPlaying = false;
                return;
            }

            if (moving) return;

            moving = true;
            const indexToMove = this.aiSteps[this.currentMove];

            const zeroField = this.domFields.findIndex(
                (field) => field.getAttribute("data-value") == 0
            );
            [
                this.currentState[Math.floor(indexToMove / 3)][indexToMove % 3],
                this.currentState[Math.floor(zeroField / 3)][zeroField % 3],
            ] = [
                this.currentState[Math.floor(zeroField / 3)][zeroField % 3],
                this.currentState[Math.floor(indexToMove / 3)][indexToMove % 3],
            ];
            console.log(this.currentState);
            this.updateField(Math.floor(indexToMove / 3), indexToMove % 3);
            this.updateField(Math.floor(zeroField / 3), zeroField % 3);

            let movesLeft = document.querySelector("#movesLeft");
            console.log(movesLeft, movesLeft);
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
    }

    // initializeEventListeners() {
    //     const fields = document.querySelectorAll(".field");
    //     fields.forEach((field, index) => {
    //         const row = Math.floor(index / 3);
    //         const col = index % 3;
    //         field.addEventListener("click", () => this.moveField(row, col));
    //     });
    // }

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
                [this.currentState[x][y], this.currentState[newX][newY]] = [
                    this.currentState[newX][newY],
                    this.currentState[x][y],
                ];

                this.updateField(x, y);
                this.updateField(newX, newY);
                return;
            }
        }
    }

    updateField(x, y) {
        const index = x * 3 + y;
        const fields = document.querySelectorAll(".field");
        const field = fields[index];
        const state = this.currentState[x][y];
        field.setAttribute("data-value", state);
        field.style.backgroundImage = state
            ? `url(${enumImages[state]})`
            : "none";

        //  comparint it to zero so it doesnt show alert twice
        if (
            state != 0 &&
            this.currentState.toString() == this.initialState.toString()
        ) {
            alert("Cestitamo !!");
        }
    }

    createStartTable() {
        this.domFields = Array.from(document.querySelectorAll(".field"));
        for (let i = 0; i < this.currentState.length; i++) {
            for (let j = 0; j < this.currentState[0].length; j++) {
                const index = i * this.currentState[0].length + j;
                const field = this.domFields[index];
                const state = this.currentState[i][j];
                field.style.backgroundImage = state
                    ? `url(${enumImages[state]})`
                    : "none";
                field.setAttribute("data-value", state);
            }
        }
    }

    callBfs() {
        this.getBfsSolution(this.currentState);
    }
}

const createGame = new CreateGame();
createGame.createStartTable();

startBtn.addEventListener("click", () => {
    let checkedBtn = document.querySelector("input:checked");
    switch (checkedBtn.value) {
        case "bfs":
            createGame.callBfs();
            break;
        case "a*":
            // Call A* method if implemented
            break;
    }
});
