function storeUsername(form) {
    localStorage["tetris.username"] = form.elements['username'].value;
}

const gameInstance = {
	width: 10,
	height: 24,
	curTetraminoId: null,
	nextTetraminoId: null,
    curMatrix: null,
    curX: null,
    curY: null,
	field: null,
	score: 0,
    isGameRunning: false,
};

const graphicsParameters = {
    xStart: 5,
    yStart: 5,
    borderWidth: 1,
    squareSize: 30,
}

function checkEndGame(){
    let endGameFlag = false;
    for (let i = 0; i < 4; i++){
        for (let j = 0; j < gameInstance.width; j++){
            if (gameInstance.field[i][j] != 0) {
                endGameFlag = true;
            }
        }
    }
    if (endGameFlag){
        gameInstance.isGameRunning = false;
        updateLeaderboard();
        window.location.href = "./leaderboard.html";
    }
}

function removeFullRows(){
    let fullRowsCount = -1;
    while(fullRowsCount != 0){
        fullRowsCount = 0;
        for (let i = gameInstance.height - 1; i > 0; i--){
            let fullRowFlag = true;
            for (let j  = 0; j < gameInstance.width; j++){
                if (gameInstance.field[i][j] == 0) {fullRowFlag = false; break;}
            }
            if (fullRowFlag){
                for (let j  = 0; j < gameInstance.width; j++){
                    gameInstance.field[i][j] = 0;
                }
                gameInstance.score += 100;
                document.getElementById("score").textContent = gameInstance.score;
                fullRowsCount++;
                for (let k = i; k > 0; k--){
                    for (let j = 0; j < gameInstance.width; j++){
                        if (gameInstance.field[k][j] != 0) {
                            gameInstance.field[k+1][j] = gameInstance.field[k][j];
                            gameInstance.field[k][j] = 0;
                        }
                    }
                }
            }       
        }
    }
}

function moveDown(){
    let flag = true;
    for (let i = 0; i < gameInstance.curMatrix.length; i++){
        for (let j = 0; j < gameInstance.curMatrix.length; j++){
            if (gameInstance.curMatrix[i][j] == 1 && gameInstance.curY+i+1 >= gameInstance.height) {flag = false; break;};
            if (gameInstance.curMatrix[i][j] == 1 && gameInstance.field[gameInstance.curY+i+1][gameInstance.curX+j] != 0) {flag = false; break;}
        }
    }
    if (flag){
        gameInstance.curY++;
    } else {
        for (let i = 0; i < gameInstance.curMatrix.length; i++){
            for (let j = 0; j < gameInstance.curMatrix.length; j++){
                if (gameInstance.curMatrix[i][j] == 1){
                    if (gameInstance.curY+i >= gameInstance.height || gameInstance.curX+j >= gameInstance.width || gameInstance.curX+j < 0) continue;
                    gameInstance.field[gameInstance.curY+i][gameInstance.curX+j] = gameInstance.curTetraminoId;
                }
            }
        }
        gameInstance.curX = 3;
        gameInstance.curY = 0;
        gameInstance.curTetraminoId = gameInstance.nextTetraminoId;
        gameInstance.nextTetraminoId = Math.floor(Math.random() * (tetramino.count)) + 1;
        gameInstance.curMatrix = Array(tetramino.matrix[gameInstance.curTetraminoId].length).fill().map(() => Array(tetramino.matrix[gameInstance.curTetraminoId].length).fill(0));
        for (let i = 0; i < gameInstance.curMatrix.length; i++){
            for (let j = 0; j < gameInstance.curMatrix.length; j++) gameInstance.curMatrix[i][j] = tetramino.matrix[gameInstance.curTetraminoId][i][j];
        }
        removeFullRows();
        checkEndGame();
    }
}

function moveLeft(){
    let flag = true;
    for (let i = 0; i < gameInstance.curMatrix.length; i++){
        for (let j = 0; j < gameInstance.curMatrix.length; j++){
            if (gameInstance.curMatrix[i][j] == 1 && gameInstance.curX+j-1 < 0) {flag = false; break;};
            if (gameInstance.curMatrix[i][j] == 1 && gameInstance.field[gameInstance.curY+i][gameInstance.curX+j-1] != 0) {flag = false; break;}
        }
    }
    if (flag) gameInstance.curX--;
}

function moveRight(){
    let flag = true;
    for (let i = 0; i < gameInstance.curMatrix.length; i++){
        for (let j = 0; j < gameInstance.curMatrix.length; j++){
            if (gameInstance.curMatrix[i][j] == 1 && gameInstance.curX+j+1 >= gameInstance.width) {flag = false; break;};
            if (gameInstance.curMatrix[i][j] == 1 && gameInstance.field[gameInstance.curY+i][gameInstance.curX+j+1] != 0) {flag = false; break;}
        }
    }
    if (flag) gameInstance.curX++;
}

function rotate(){
    let flag = true;
    rotatedMatrix = gameInstance.curMatrix[0].map((val, index) => gameInstance.curMatrix.map(row => row[index]).reverse());
    for (let i = 0; i < rotatedMatrix.length; i++){
        for (let j = 0; j < rotatedMatrix.length; j++){
            if (rotatedMatrix[i][j] == 1 && (gameInstance.curX+j >= gameInstance.width || gameInstance.curX + j < 0 || gameInstance.curY+i < 0 || gameInstance.curY + i >= gameInstance.height)) {flag = false; break;};
            if (rotatedMatrix[i][j] == 1 && gameInstance.field[gameInstance.curY+i][gameInstance.curX+j] != 0) {flag = false; break;}
        }
    }
    if (flag) gameInstance.curMatrix = rotatedMatrix;
}

function drop(){
    cur = gameInstance.curY;
    moveDown();
    while (gameInstance.curY > cur) moveDown();
}

function gameStart() {
    document.getElementById("startbutton").setAttribute("hidden", "");
    gameInstance.field = Array(gameInstance.height).fill().map(() => Array(gameInstance.width).fill(0));
    gameInstance.curX = 3;
    gameInstance.curY = 0;
    document.addEventListener('keydown', (event) => {
        if (event.key == "ArrowDown") moveDown();
        if (event.key == "ArrowLeft") moveLeft();
        if (event.key == "ArrowRight") moveRight();
        if (event.key == "ArrowUp") rotate();
        if (event.code == "Space") drop();
        draw();
    });

    gameInstance.curTetraminoId = Math.floor(Math.random() * (tetramino.count)) + 1;
    gameInstance.nextTetraminoId = Math.floor(Math.random() * (tetramino.count)) + 1;
    gameInstance.curMatrix = Array(tetramino.matrix[gameInstance.curTetraminoId].length).fill().map(() => Array(tetramino.matrix[gameInstance.curTetraminoId].length).fill(0));
    for (let i = 0; i < gameInstance.curMatrix.length; i++){
        for (let j = 0; j < gameInstance.curMatrix.length; j++) gameInstance.curMatrix[i][j] = tetramino.matrix[gameInstance.curTetraminoId][i][j];
    }
    gameInstance.isGameRunning = true;
    document.getElementById("score").textContent = gameInstance.score;
    (update = () => {
		if (gameInstance.isGameRunning) {
            draw();
            moveDown();
			setTimeout(update, 1000 / ((gameInstance.score+100)/100));
		}
	})();
}

function drawSquareCanvas(x, y, color) {
    if (x < 0 || x >= gameInstance.width || y < 0 || y >= gameInstance.height) return;
    let ctx = document.getElementById('canvasid').getContext('2d');
    ctx.fillStyle = "black";
    let xs = graphicsParameters.xStart, ys = graphicsParameters.yStart, sz = graphicsParameters.squareSize, bw = graphicsParameters.borderWidth;
    ctx.fillRect(xs+(x*sz), ys+((y-4)*sz), sz, sz);
    ctx.fillStyle = color;
    ctx.fillRect(xs+(x*sz)+bw, ys+((y-4)*sz)+bw, sz-(bw*2), sz-(bw*2));
}

function drawSquareNextFigureCanvas(x, y, color) {
    let ctx = document.getElementById('nextFigureCanvas').getContext('2d');
    ctx.fillStyle = "black";
    let sz = graphicsParameters.squareSize, bw = graphicsParameters.borderWidth;
    ctx.fillRect(5+(x*sz), 5+(y*sz), sz, sz);
    ctx.fillStyle = color;
    ctx.fillRect(5+(x*sz)+bw, 5+(y*sz)+bw, sz-(bw*2), sz-(bw*2));
}

function draw() {
    let canvas = document.getElementById('canvasid');
    let ctx = canvas.getContext('2d');
    if (canvas.getContext) {
        ctx.fillStyle = "pink";
        ctx.fillRect(0,0,310,610);
        ctx.fillStyle = "black";
        ctx.fillRect(5,5,300,600);
        if (gameInstance.field != null)
        for (let i = 4; i < gameInstance.height; i++){
            for (let j = 0; j < gameInstance.width; j++){
                if (gameInstance.field[i][j] != 0){
                   drawSquareCanvas(j, i, tetramino.colors[gameInstance.field[i][j]]);
                }
            }
        }
        if (gameInstance.curMatrix != null)
        for (let i = 0; i < gameInstance.curMatrix.length; i++){
            for (let j = 0; j < gameInstance.curMatrix.length; j++){
                if (gameInstance.curMatrix[i][j] == 1){
                    drawSquareCanvas(j+gameInstance.curX, i+gameInstance.curY, tetramino.colors[gameInstance.curTetraminoId]);
                }
            }
        }
        ctx.fillStyle = "pink";
        ctx.fillRect(0,0,310,5);
    }
    let nextFigureCanvas = document.getElementById('nextFigureCanvas');
    ctx = nextFigureCanvas.getContext('2d');
    if (canvas.getContext) {
        ctx.fillStyle = "pink";
        ctx.fillRect(0,0,130,130);
        ctx.fillStyle = "black";
        ctx.fillRect(5,5,120,120);
        if (gameInstance.nextTetraminoId != null)
        for (let i = 0; i < tetramino.matrix[gameInstance.nextTetraminoId].length; i++){
            for (let j = 0; j < tetramino.matrix[gameInstance.nextTetraminoId].length; j++){
                if (tetramino.matrix[gameInstance.nextTetraminoId][i][j] == 1){
                    drawSquareNextFigureCanvas(j, i, tetramino.colors[gameInstance.nextTetraminoId]);
                }
            }
        }
    }

}