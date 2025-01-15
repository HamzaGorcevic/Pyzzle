class CreateGame {
    constructor() {
        this.domFields = [];
        this.currentState = [];
        this.aiSteps = [];
        this.loading = false;
        this.simulationInterval = 1000;
        this.intervalId;
        this.isPlaying = false;
        this.simulationStarted = false;
        this.currentMove = 0;
        this.dimension = 3;
        this.enumImages = {};
        this.defaultImagePath = "./assets/ninja/gameScreen.jpg";

        // Button spans
        this.startBtnSpan = document.querySelector("#startBtn span");
        this.shuffleBtnSpan = document.querySelector("#shuffleBtn span");
        this.endSimulationBtnSpan = document.querySelector(
            "#endSimulationBtn span"
        );

        // Other elements
        this.overlay = document.getElementById("overlay");
        this.playStopButton = document.getElementById("playStopButton");
        this.scoreBoard = document.querySelector(".score");
        this.movesLeft = document.querySelector("#movesLeft");
        this.nodesExplored = document.querySelector("#nodesExplored");
        this.gameTable = document.querySelector(".gameTable");
        this.selectDimension = document.getElementById("selectDimension");
        this.initializedEvenListeners = false;

        this.initializeGame();
    }

    async initializeGame() {
        await this.createPuzzlePieces(this.defaultImagePath);
        await this.initializeNewState(this.dimension);
        this.shuffleInitialState();
        this.createStartTable();
    }

    async initializeNewState(dimension) {
        this.initializedEvenListeners = false;

        this.dimension = dimension;
        this.initialState = [];
        this.currentState = [];
        this.gameTable.innerHTML =
            '<div id="overlay"><div class="loading-spinner"></div><p>Press space to continue</p><p>Press enter to finish</p><img id="playStopButton" src="./assets/images/play.png" alt="Play Button" /></div>';

        for (let i = 0; i < dimension; i++) {
            let row = [];
            for (let j = 1; j <= dimension; j++) {
                const field = document.createElement("div");
                field.classList.add("field");
                this.gameTable.appendChild(field);
                row.push(dimension * i + j);
            }
            this.initialState.push(row);
        }

        this.initialState[dimension - 1][dimension - 1] = 0;
        this.generateDynamicStyles();
        this.overlay = document.getElementById("overlay");
        this.playStopButton = document.getElementById("playStopButton");
    }

    createPuzzlePieces(imageSrc) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                // Create a temporary canvas for the full image
                const tempCanvas = document.createElement("canvas");
                const tempCtx = tempCanvas.getContext("2d");

                // Fixed size for the puzzle
                const size = 500; // Match the gameTable size
                tempCanvas.width = size;
                tempCanvas.height = size;

                // Draw the image stretched to fill the entire canvas
                tempCtx.drawImage(img, 0, 0, size, size);

                // Extract dominant colors
                const imageData = tempCtx.getImageData(0, 0, size, size).data;
                const colorCounts = {};

                // Sample every 10th pixel for performance
                for (let i = 0; i < imageData.length; i += 40) {
                    const r = imageData[i];
                    const g = imageData[i + 1];
                    const b = imageData[i + 2];
                    const rgb = `${r},${g},${b}`;
                    colorCounts[rgb] = (colorCounts[rgb] || 0) + 1;
                }

                // Get top 5 colors
                const dominantColors = Object.entries(colorCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([color]) => `rgb(${color})`);

                // Update CSS variables
                document.documentElement.style.setProperty(
                    "--primary-color",
                    dominantColors[0]
                );
                document.documentElement.style.setProperty(
                    "--secondary-color",
                    this.getContrastColor(dominantColors[0])
                );
                document.documentElement.style.setProperty(
                    "--text-color",
                    this.getContrastColor(dominantColors[0])
                );
                document.documentElement.style.setProperty(
                    "--border-color",
                    dominantColors[2] || dominantColors[0]
                );
                document.documentElement.style.setProperty(
                    "--hover-color",
                    dominantColors[3] || dominantColors[1] || dominantColors[0]
                );

                // Set gameTable background
                this.gameTable.style.backgroundImage = `url(${imageSrc})`;
                this.gameTable.style.backgroundSize = "cover";
                this.gameTable.style.backgroundPosition = "center";

                // Create canvas for individual pieces
                const pieceCanvas = document.createElement("canvas");
                const pieceCtx = pieceCanvas.getContext("2d");

                // Calculate piece dimensions
                const pieceSize = Math.floor(size / this.dimension);
                pieceCanvas.width = pieceSize;
                pieceCanvas.height = pieceSize;

                // Store pieces in enumImages
                this.enumImages = { 0: "none" };

                // Total number of pieces (dimension × dimension)
                const totalPieces = this.dimension * this.dimension;

                // Create all pieces
                for (let i = 0; i < totalPieces; i++) {
                    // Calculate x and y positions
                    const row = Math.floor(i / this.dimension);
                    const col = i % this.dimension;

                    // Clear the piece canvas
                    pieceCtx.clearRect(0, 0, pieceSize, pieceSize);

                    // Draw the piece
                    pieceCtx.drawImage(
                        tempCanvas,
                        col * pieceSize,
                        row * pieceSize,
                        pieceSize,
                        pieceSize,
                        0,
                        0,
                        pieceSize,
                        pieceSize
                    );

                    if (i < totalPieces - 1) {
                        // Skip the last piece (will be empty)
                        this.enumImages[i + 1] = pieceCanvas.toDataURL();
                    }
                }

                resolve();
            };

            img.onerror = () => {
                console.error("Error loading image");
                this.enumImages = { 0: "none" };
                resolve();
            };

            img.src = imageSrc;
        });
    }

    getContrastColor(bgColor) {
        const [r, g, b] = bgColor
            .substring(4, bgColor.length - 1)
            .split(",")
            .map(Number);

        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? "rgb(0,0,0)" : "rgb(255,255,255)";
    }

    generateDynamicStyles() {
        const existingStyle = document.getElementById("dynamic-puzzle-styles");
        if (existingStyle) {
            existingStyle.remove();
        }

        const styleSheet = document.createElement("style");
        styleSheet.id = "dynamic-puzzle-styles";
        const percentage = (100 / this.dimension).toFixed(2);

        let styles = `
            .field {
                width: calc(${percentage}% - 2px);
                height: calc(${percentage}% - 2px);
                background-position: center;
                background-size: cover;
                background-repeat: no-repeat;
                margin: 1px;
                border: 1px solid #2f4f2f;
                position: absolute;
                transition: left 0.3s ease, top 0.3s ease;
                top: 0;
                left: 0;
                box-sizing: border-box;
            }
        `;

        for (let i = 0; i < this.dimension; i++) {
            for (let j = 0; j < this.dimension; j++) {
                styles += `
                    .field.pos-${i}-${j} {
                        left: ${percentage * j}%;
                        top: ${percentage * i}%;
                    }
                `;
            }
        }

        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    setupImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                this.defaultImagePath = e.target.result;
                await this.createPuzzlePieces(e.target.result);
                this.createStartTable();
            };
            reader.readAsDataURL(file);
        }
    }

    shuffleInitialState() {
        this.currentState = JSON.parse(JSON.stringify(this.initialState));
        let flatArray = this.currentState.flat();

        do {
            for (let i = flatArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [flatArray[i], flatArray[j]] = [flatArray[j], flatArray[i]];
            }
        } while (!this.isSolvable(flatArray));

        for (let i = 0; i < this.dimension; i++) {
            this.currentState[i] = flatArray.slice(
                i * this.dimension,
                (i + 1) * this.dimension
            );
        }
    }

    isSolvable(puzzle) {
        let inversions = 0;
        const zeroPosition = puzzle.indexOf(0);
        const puzzleWithoutZero = puzzle.filter((num) => num !== 0);

        for (let i = 0; i < puzzleWithoutZero.length - 1; i++) {
            for (let j = i + 1; j < puzzleWithoutZero.length; j++) {
                if (puzzleWithoutZero[i] > puzzleWithoutZero[j]) {
                    inversions++;
                }
            }
        }

        if (this.dimension % 2 === 1) {
            return inversions % 2 === 0;
        } else {
            const zeroRow = Math.floor(zeroPosition / this.dimension);
            return (inversions + zeroRow) % 2 === 0;
        }
    }

    createStartTable() {
        this.domFields = Array.from(document.querySelectorAll(".field"));
        for (let i = 0; i < this.dimension; i++) {
            for (let j = 0; j < this.dimension; j++) {
                const index = i * this.dimension + j;
                const field = this.domFields[index];
                const value = this.currentState[i][j];

                field.style.backgroundImage =
                    value !== 0 ? `url(${this.enumImages[value]})` : "none";
                field.className = "field";
                field.classList.add(`pos-${i}-${j}`);
            }
        }

        if (!this.initializedEvenListeners) {
            this.initializeEventListeners();
            this.initializedEvenListeners = true;
        }
    }

    initializeEventListeners() {
        const fields = document.querySelectorAll(".field");
        fields.forEach((field) => {
            field.addEventListener("click", (e) => {
                if (!this.isPlaying) {
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
                newX < this.dimension &&
                newY >= 0 &&
                newY < this.dimension &&
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
            this.handleGameWin();
        }
    }

    checkIfSolved() {
        return (
            JSON.stringify(this.currentState) ===
            JSON.stringify(this.initialState)
        );
    }

    handleGameWin() {
        clearInterval(this.intervalId);
        document.removeEventListener("keydown", this.controls);
        this.toggleOverlay(false);
        this.isPlaying = false;
        this.simulationStarted = false;
        this.scoreBoard.style.display = "none";
        startBtn.disabled = false;
        shuffleBtn.disabled = false;
        this.selectDimension.disabled = false;
        startBtn.classList.remove("loading");
        shuffleBtn.classList.remove("loading");
        this.startBtnSpan.textContent = "Start Game";
        this.shuffleBtnSpan.textContent = "Shuffle Board";
        this.showSuccessMessage();
    }

    showSuccessMessage() {
        const modal = document.createElement("div");
        modal.classList.add("modal");
        const successMessage = document.createElement("p");
        successMessage.innerHTML = "Congratulations!<br>You solved the puzzle!";
        modal.appendChild(successMessage);

        const closeButton = document.createElement("button");
        const span = document.createElement("span");
        span.textContent = "Close";
        closeButton.appendChild(span);
        modal.appendChild(closeButton);

        const bgEffect = document.createElement("div");
        bgEffect.classList.add("bgEffect");

        document.body.appendChild(modal);
        document.body.appendChild(bgEffect);

        closeButton.onclick = () => {
            modal.remove();
            bgEffect.remove();
        };
    }

    async fetchSolution(algorithm) {
        if (this.loading) return;

        // const url = `http://127.0.0.1:8000/game/start-game/${algorithm}`;
        const url = `https://pyzzle-production.up.railway.app/game/start-game/${algorithm}`;

        try {
            this.loading = true;
            this.isPlaying = true;
            startBtn.classList.add("loading");
            endSimulationBtn.classList.add("loading");
            shuffleBtn.classList.add("loading");
            this.selectDimension.disabled = true;
            this.startBtnSpan.textContent = "Loading...";
            this.shuffleBtnSpan.textContent = "Loading...";
            this.endSimulationBtnSpan.textContent = "Loading...";

            this.overlay.style.visibility = "visible";
            this.overlay.classList.add("loading-overlay");

            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ initial_state: this.currentState }),
            });

            if (!response.ok) throw new Error("Failed to fetch solution");

            const data = await response.json();

            this.overlay.style.visibility = "hidden";
            this.overlay.classList.remove("loading-overlay");
            this.endSimulationBtnSpan.textContent = "Stop Simulation";
            endSimulationBtn.classList.remove("loading");

            if (!data.steps || data.steps.length === 0) {
                this.resetButtons();
                return;
            }

            this.setupSimulation(data);
        } catch (error) {
            console.error("Error:", error);
            this.resetButtons();
        }
    }

    setupSimulation(data) {
        this.simulationStarted = true;
        this.isPlaying = false;
        this.toggleOverlay();
        this.scoreBoard.style.display = "flex";
        this.loading = false;
        this.aiSteps = data.steps;
        this.nodesExplored.textContent = data.nodes_explored;
        this.movesLeft.textContent = data.steps.length;
        this.currentMove = 0;

        startBtn.disabled = true;
        shuffleBtn.disabled = true;
        this.selectDimension.disabled = true;
        this.startBtnSpan.textContent = "Simulation Running";
        this.shuffleBtnSpan.textContent = "Simulation Running";

        document.addEventListener("keydown", this.controls);
        this.gameTable.addEventListener("click", this.controls);
    }

    resetButtons() {
        startBtn.classList.remove("loading");
        endSimulationBtn.classList.remove("loading");
        shuffleBtn.classList.remove("loading");
        this.selectDimension.disabled = false;
        this.startBtnSpan.textContent = "Start Game";
        this.shuffleBtnSpan.textContent = "Shuffle Board";
        this.endSimulationBtnSpan.textContent = "Stop Simulation";
        this.loading = false;
        this.isPlaying = false;
    }

    controls = (event) => {
        if (!this.simulationStarted) return;

        if (event.code === "Space" || event.type === "click") {
            this.simulationInterval = 1000;
            this.toggleSimulation();
        } else if (event.code === "Enter") {
            this.simulationInterval = 0;
            this.toggleSimulation();
        }
    };

    toggleSimulation() {
        this.isPlaying = !this.isPlaying;
        this.toggleOverlay();

        if (this.isPlaying) {
            this.startSimulation();
        } else {
            clearInterval(this.intervalId);
        }
    }

    toggleOverlay(forceStop = true) {
        this.overlay.style.visibility =
            forceStop && this.simulationStarted && !this.isPlaying
                ? "visible"
                : "hidden";
    }

    startSimulation() {
        this.toggleOverlay();
        clearInterval(this.intervalId);

        this.intervalId = setInterval(() => {
            if (this.currentMove >= this.aiSteps.length) {
                this.endSimulation();
                return;
            }

            const indexToMove = this.aiSteps[this.currentMove];
            const x = Math.floor(indexToMove / this.dimension);
            const y = indexToMove % this.dimension;

            this.moveField(x, y);
            this.movesLeft.textContent =
                this.aiSteps.length - this.currentMove - 1;
            this.currentMove++;
        }, this.simulationInterval);
    }

    endSimulation() {
        clearInterval(this.intervalId);
        this.simulationStarted = false;
        this.isPlaying = false;
        this.toggleOverlay(false);
        startBtn.disabled = false;
        shuffleBtn.disabled = false;
        this.selectDimension.disabled = false;
        startBtn.classList.remove("loading");
        shuffleBtn.classList.remove("loading");
        this.startBtnSpan.textContent = "Start Game";
        this.shuffleBtnSpan.textContent = "Shuffle Board";
    }

    callAlgorithm(algorithm) {
        this.fetchSolution(algorithm);
    }
}

// Initialize game and event listeners
const game = new CreateGame();

// Event Listeners
document.getElementById("imageUpload").addEventListener("change", (event) => {
    game.setupImageUpload(event);
});

document
    .getElementById("selectDimension")
    .addEventListener("change", async (event) => {
        const newDimension = parseInt(event.target.value);
        await game.initializeNewState(newDimension);
        await game.createPuzzlePieces(game.defaultImagePath);
        game.shuffleInitialState();
        game.createStartTable();
    });

document.getElementById("shuffleBtn").addEventListener("click", () => {
    game.shuffleInitialState();
    game.createStartTable();
});

document.getElementById("startBtn").addEventListener("click", () => {
    const algorithm = document.querySelector(
        'input[name="algorithm"]:checked'
    ).value;
    game.callAlgorithm(algorithm);
});

document.getElementById("endSimulationBtn").addEventListener("click", () => {
    game.endSimulation();
});

document.addEventListener("keydown", (event) => {
    if (event.code === "Escape") {
        window.location.reload();
    }
});
