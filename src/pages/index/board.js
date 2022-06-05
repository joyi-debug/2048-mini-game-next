/* const regeneratorRuntime = require("../../lib/runtime");  */ // eslint-disable-line

const MOVE_DIRECTION = {
  //定义移动方向的常量
  LEFT: 0,
  TOP: 1,
  RIGHT: 2,
  BOTTOM: 3,
};

const MATRIX_SIZE = 4;
const PADDING = 8;

//每个数字方块对应的背景颜色和文字颜色
const COLOR_MAP = {
  0: { color: "#776e65", bgColor: "#EEE4DA40" },
  2: { color: "#776e65", bgColor: "#eee4da" },
  4: { color: "#776e65", bgColor: "#ede0c8" },
  8: { color: "#f9f6f2", bgColor: "#f2b179" },
  16: { color: "#f9f6f2", bgColor: "#f59563" },
  32: { color: "#f9f6f2", bgColor: "#f67c5f" },
  64: { color: "#f9f6f2", bgColor: "#f65e3b" },
  128: { color: "#f9f6f2", bgColor: "#edcf72" },
  256: { color: "#f9f6f2", bgColor: "#edcc61" },
  512: { color: "#f9f6f2", bgColor: "#edc850" },
  1024: { color: "#f9f6f2", bgColor: "#edc53f" },
  2048: { color: "#f9f6f2", bgColor: "#edc22e" },
};

//用于保存棋盘中一个节点的坐标
class Point {
  //保存单个节点数据的类
  constructor(rowIndex, columnIndex) {
    this.rowIndex = rowIndex; //行数
    this.columnIndex = columnIndex; //列数
  }
}

//保存每个方块的详细信息
class Cell {
  constructor(value) {
    this.value = value;
    //用于保存移动状态，以便绘制动画
    this.isNew = false; //是否为新产生的
    this.moveStep = 0; //滑动操作下移动了几步
  }
  newStatus(newStatus) {
    if (newStatus !== undefined) {
      this.isNew = newStatus;
      return this;
    }
    return this.isNew;
  }
}

//用于保存棋盘的数据以及用户操作
class Board {
  //记录游戏数据类
  constructor(canvas, context, canvasSize) {
    //构造函数
    this.matrix = [];
    this.currentScore = 0;
    this.fillEmptyMatrix();
    this.canvas = canvas; //保存canvas
    this.context = context; //保存canvas的上下文
    this.canvasSize = canvasSize; //保存画布大小
    //MATRIX_SIZE
    this.CELL_SIZE = (canvasSize - 5 * PADDING) / MATRIX_SIZE;
  }
  fillEmptyMatrix() {
    //初始化空棋盘
    for (let i = 0; i < MATRIX_SIZE; i++) {
      const row = [];
      for (let j = 0; j < MATRIX_SIZE; j++) {
        row.push(new Cell(0));
      }
      this.matrix.push(row);
    }
  }
  randomIndex() {
    //随机获取棋盘坐标
    return Math.floor(Math.random() * MATRIX_SIZE);
  }
  startGame() {
    //初始化两个cell
    for (let i = 0; i < 2; i++) {
      //4：1的概率将方块初始化为数字2或4
      const rowIndex = this.randomIndex();
      const colIndex = this.randomIndex();
      this.matrix[rowIndex][colIndex].value = Math.random() < 0.8 ? 2 : 4;
      this.matrix[rowIndex][colIndex].newStatus(true);
    }
    /* this.drawBoard(); */
    this.drawWithAnimation(MOVE_DIRECTION.LEFT);
  }
  move(direction) {
    if (!this.canMove(direction)) {
      //判断是否可滑动，如不可滑动直接返回
      console.log("该方向不可用");
      return;
    }
    //将矩阵转至向左
    const rotatedMatrix = this.transformMatrixToDirectionLeft(
      this.matrix,
      direction
    );
    //将矩阵向左滑动，非空方块向左移动
    const leftMovedMatrix = this.moveValidNumToLeft(rotatedMatrix);
    //相同数字合并
    for (let i = 0; i < MATRIX_SIZE; i++) {
      for (let j = 0; j < MATRIX_SIZE - 1; j++) {
        //判断是否需要合并
        if (
          leftMovedMatrix[i][j].value > 0 &&
          leftMovedMatrix[i][j].value === leftMovedMatrix[i][j + 1].value
        ) {
          leftMovedMatrix[i][j].value *= 2;
          //分数增加
          this.currentScore += leftMovedMatrix[i][j].value;
          leftMovedMatrix[i][j + 1] = new Cell(0); //合并后，右侧方块清空
        }
      }
    }
    //再次将方块向左移动，去除新出现的空白方块
    const againMoveMatrix = this.moveValidNumToLeft(leftMovedMatrix);
    //将矩阵旋转至原来的方向
    this.matrix = this.reverseTransformMatrixFormDirectionLeft(
      againMoveMatrix,
      direction
    );
    //增加一个新数字
    const emptyPoints = this.getEmptyCells();
    if (emptyPoints.length !== 0) {
      const emptyPoint =
        emptyPoints[Math.floor(Math.random() * emptyPoints.length)];
      this.matrix[emptyPoint.rowIndex][emptyPoint.columnIndex].value =
        Math.random() < 0.8 ? 2 : 4;
      this.matrix[emptyPoint.rowIndex][emptyPoint.columnIndex].newStatus(true);
    }
    //绘制方块
    /* this.drawBoard(); */
    this.drawWithAnimation(direction);
  }
  canMove(direction) {
    //判断当前方向是否可滑动
    //获取旋转到向左的矩阵
    const rotatedMatrix = this.transformMatrixToDirectionLeft(
      this.matrix,
      direction
    );
    //根据direction,改为向左判断
    for (let i = 0; i < MATRIX_SIZE; i++) {
      for (let j = 0; j < MATRIX_SIZE - 1; j++) {
        //如果有两个连着相等的数字方块，可以滑动
        if (
          rotatedMatrix[i][j].value > 0 &&
          rotatedMatrix[i][j].value === rotatedMatrix[i][j + 1].value
        ) {
          return true;
        }
        //如果数字左边有0，可以滑动
        if (
          rotatedMatrix[i][j].value === 0 &&
          rotatedMatrix[i][j + 1].value > 0
        ) {
          return true;
        }
      }
    }
    return false;
  }
  //将非空方块移至最左侧
  moveValidNumToLeft(matrix) {
    const movedMatrix = [];
    for (let i = 0; i < MATRIX_SIZE; i++) {
      const row = [];
      for (let j = 0; j < MATRIX_SIZE; j++) {
        //判断方块是否为空
        if (matrix[i][j].value !== 0) {
          row.push(matrix[i][j]);
          matrix[i][j].moveStep += j - row.length;
        }
      }
      while (row.length < MATRIX_SIZE) {
        row.push(new Cell(0)); //补齐空余部分
      }
      movedMatrix.push(row);
    }
    return movedMatrix; //返回移动后的矩阵
  }
  getEmptyCells() {
    const emptyCells = [];
    for (let i = 0; i < MATRIX_SIZE; i++) {
      for (let j = 0; j < MATRIX_SIZE; j++) {
        if (this.matrix[i][j].value === 0) {
          emptyCells.push(new Point(i, j));
        }
      }
    }
    return emptyCells;
  }
  rotateMatrix(matrix) {
    //旋转棋盘矩阵
    const rotateMatrix = []; //旋转过后的矩阵
    for (let i = 0; i < MATRIX_SIZE; i++) {
      const row = [];
      for (let j = MATRIX_SIZE - 1; j >= 0; j--) {
        row.push(matrix[j][i]);
      }
      rotateMatrix.push(row);
    }
    return rotateMatrix;
  }
  rotateMultipleTimes(matrix, rotateNum) {
    let newMatrix = matrix;
    while (rotateNum > 0) {
      //根据rotateNum进行多次旋转
      newMatrix = this.rotateMatrix(newMatrix);
      rotateNum--;
    }
    return newMatrix;
  }
  transformMatrixToDirectionLeft(matrix, direction) {
    //将不同方向矩阵转至向左
    switch (direction) {
      case MOVE_DIRECTION.LEFT:
        return matrix;
      case MOVE_DIRECTION.TOP:
        return this.rotateMultipleTimes(matrix, 3);
      case MOVE_DIRECTION.RIGHT:
        return this.rotateMultipleTimes(matrix, 2);
      case MOVE_DIRECTION.BOTTOM:
        return this.rotateMatrix(matrix);
      default:
        return matrix;
    }
  }
  //将向左矩阵恢复原向
  reverseTransformMatrixFormDirectionLeft(matrix, direction) {
    switch (direction) {
      case MOVE_DIRECTION.LEFT:
        return matrix;
      case MOVE_DIRECTION.TOP:
        return this.rotateMultipleTimes(matrix, 1);
      case MOVE_DIRECTION.RIGHT:
        return this.rotateMultipleTimes(matrix, 2);
      case MOVE_DIRECTION.BOTTOM:
        return this.rotateMultipleTimes(matrix, 3);
      default:
        return matrix;
    }
  }
  //判断游戏是否结束
  isGameOver() {
    //通过判断是否4个方向都已无法滑动
    return (
      !this.canMove(MOVE_DIRECTION.LEFT) &&
      !this.canMove(MOVE_DIRECTION.TOP) &&
      !this.canMove(MOVE_DIRECTION.RIGHT) &&
      !this.canMove(MOVE_DIRECTION.BOTTOM)
    );
  }
  //判断游戏是否已经胜利
  isWinning() {
    let max = 0;
    const winNum = 2048;
    for (let row of this.matrix) {
      //遍历棋盘，判断是否有方块数字为2048
      for (let cell of row) {
        max = Math.max(cell.value, max);
      }
      if (max > winNum) {
        return false;
      }
    }
    return max === winNum;
  }
  //绘制棋盘非0方块
  drawCell(x, y, cell) {
    //获取方块的数字
    const text = cell.value;
    //如果数字为0，不进行绘制
    if (text === 0) return;
    //获取canvas的上下文
    const context = this.context;
    //设置画笔颜色
    context.fillStyle = COLOR_MAP[text].bgColor;
    //绘制矩形方块
    /*   */
    //绘制圆角矩形
    this.drawRoundSquare(x, y, this.CELL_SIZE);
    context.fill();
    //切换画笔颜色为文字颜色
    context.fillStyle = COLOR_MAP[text].color;
    //设置字体大小
    context.font = "40px Clear Sans";
    //设置字体居中
    context.textAlign = "center";
    //设置文字baseline
    context.textBaseline = "middle";
    context.fillText(text, x + this.CELL_SIZE / 2, y + this.CELL_SIZE / 2);
  }
  //绘制完整棋盘
  drawBoard(process, direction) {
    //获取上下文
    const context = this.context;
    //获取画布大小
    const canvasSize = this.canvasSize;
    //获取棋盘矩阵数据
    const matrix = this.matrix;
    const CELL_SIZE = this.CELL_SIZE;
    context.clearRect(0, 0, canvasSize, canvasSize); //清空画布
    //绘制背景方块
    this.drawBgCells();
    //遍历棋盘，绘制所有方块
    for (let rowIndex = 0; rowIndex < MATRIX_SIZE; rowIndex++) {
      for (let colIndex = 0; colIndex < MATRIX_SIZE; colIndex++) {
        //画出当前的矩形
        const moveStep = matrix[rowIndex][colIndex].moveStep;
        const startPoint = {
          x: PADDING + colIndex * (CELL_SIZE + PADDING),
          y: PADDING + rowIndex * (CELL_SIZE + PADDING),
        };
        switch (direction) {
          case MOVE_DIRECTION.LEFT:
            startPoint.x += moveStep * (CELL_SIZE + PADDING) * (1 - process);
            break;
          case MOVE_DIRECTION.RIGHT:
            startPoint.x -= moveStep * (CELL_SIZE + PADDING) * (1 - process);
            break;
          case MOVE_DIRECTION.TOP:
            startPoint.y += moveStep * (CELL_SIZE + PADDING) * (1 - process);
            break;
          case MOVE_DIRECTION.BOTTOM:
            startPoint.y -= moveStep * (CELL_SIZE + PADDING) * (1 - process);
        }
        //绘制方块
        this.drawCell(
          startPoint.x,
          startPoint.y,
          matrix[rowIndex][colIndex],
          process
        );
      }
    }
  }
  //绘制圆角正方形
  drawRoundSquare(startX, startY, size) {
    const point1 = {
      x: startX,
      y: startY,
    };
    const points = {
      point1,
      point2: {
        x: point1.x + size,
        y: point1.y,
      },
      point3: {
        x: point1.x + size,
        y: point1.y + size,
      },
      point4: {
        x: point1.x,
        y: point1.y + size,
      },
    };
    const context = this.context;
    context.beginPath();
    context.moveTo(
      (points.point1.x + points.point2.x) / 2,
      (points.point1.y + points.point2.y) / 2
    );
    context.arcTo(
      points.point2.x,
      points.point2.y,
      points.point3.x,
      points.point3.y,
      12
    );
    context.arcTo(
      points.point3.x,
      points.point3.y,
      points.point4.x,
      points.point4.y,
      12
    );
    context.arcTo(
      points.point4.x,
      points.point4.y,
      points.point1.x,
      points.point1.y,
      12
    );
    context.arcTo(
      points.point1.x,
      points.point1.y,
      points.point2.x,
      points.point2.y,
      12
    );
    context.closePath();
  }
  //绘制方块背景
  drawBgCells() {
    const context = this.context;
    context.globalAlpha = 1;
    context.clearRect(0, 0, this.canvasSize, this.canvasSize);
    //遍历所有方块
    for (let rowIndex = 0; rowIndex < MATRIX_SIZE; rowIndex++) {
      for (let colIndex = 0; colIndex < MATRIX_SIZE; colIndex++) {
        //设置画笔颜色
        context.fillStyle = "rgba(238,228,218,0.35)";
        //绘制圆角矩形背景
        this.drawRoundSquare(
          PADDING + colIndex * (this.CELL_SIZE + PADDING),
          PADDING + rowIndex * (this.CELL_SIZE + PADDING),
          this.CELL_SIZE
        );
        context.fill();
      }
    }
  }
  //动态绘制棋盘的动画
  drawWithAnimation(direction) {
    let process = 0; //初始进度为0
    const draw = () => {
      //定义循环执行的绘制函数
      this.drawBoard(process / 100, direction);
      if (process < 100) {
        process += 10;
        //递归调用绘制函数，在下一次UI渲染时进行绘制
        this.canvas.requestAnimationFrame(draw);
      } else {
        //当进度为100（动画结束）时，将cell中的动画字段置空
        //将cell数据复位
        for (let row of this.matrix) {
          for (let cell of row) {
            cell.newStatus(false);
            cell.moveStep = 0;
          }
        }
      }
    };
    draw();
  }
}

module.exports.MOVE_DIRECTION = MOVE_DIRECTION;
module.exports.Board = Board;
