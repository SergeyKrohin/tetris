// board size 10x20

function Game(board) {
	
    this.score = 0;
	this.board = board;
    this.currentShape;
    
    const ZShape = [
        {x: 4, y: 0}, 
        {x: 3, y: 1}, 
        {x: 4, y: 1}, 
        {x: 5, y: 0}
    ];
    
    const LShape = [
        {x: 3, y: 0}, 
        {x: 3, y: 1}, 
        {x: 4, y: 1}, 
        {x: 5, y: 1}
    ];
    
    const TShape = [
        {x: 4, y: 0}, 
        {x: 3, y: 1}, 
        {x: 4, y: 1}, 
        {x: 5, y: 1}
    ];
    
    const OShape = [
        {x: 5, y: 0}, 
        {x: 4, y: 0}, 
        {x: 4, y: 1}, 
        {x: 5, y: 1}
    ];
    
    const IShape = [
        {x: 3, y: 0}, 
        {x: 4, y: 0}, 
        {x: 5, y: 0}, 
        {x: 6, y: 0}
    ];
    
	this.shapes = [
        ZShape,
        LShape,
        TShape,
        OShape,
        IShape
	];	
    
	this.init = () => {
		this.board.renderGameBoard();
		this.nextShape();
        let gameOverCount = 0;
        const interval = setInterval(() => {
            if(this.moveShape(this.currentShape, 'down') === 'occupied') {
                gameOverCount ++;
            } else {
                gameOverCount = 0;
            }
            if(gameOverCount > 1) {
                clearInterval(interval);
                alert('gameOver');
            }
        }, 250);
	}
    
    this.nextShape = () => {
        this.currentShape = new Shape(this.shapes[Math.floor(Math.random() * 5)], 'gray', board);
        this.board.drawShape(this.currentShape.points, 'add'); 
    }
    
    this.increaseScore = (linesCount) => {
        if(linesCount) {
         this.board.drawScore(this.score += linesCount * 100);   
        }
    }
    
    this.moveShape = (shape, direction) => {
        const movedPoints = shape.move(direction);
        if(movedPoints === 'bottom' || movedPoints === 'occupied') {
            this.board.markShapeAsStatic(shape.points);
            this.increaseScore(this.board.checkFilledLines(shape));
            this.nextShape();
        }else if(Array.isArray(movedPoints)) {
            this.board.drawShape(shape.points, 'remove');
            this.board.drawShape(movedPoints, 'add');
            shape.points = movedPoints;
        }
        return movedPoints;
    }
    
    this.turnShape = (shape) => {
        const turnedPoints = shape.turn();
        if(turnedPoints === 'left') {
            this.moveShape(shape, 'right');
            this.turnShape(shape);
        } else if(turnedPoints === 'right') {
            this.moveShape(shape, 'left');
            this.turnShape(shape);
        } else if(turnedPoints === 'bottom') {
            this.moveShape(shape, 'up');
            this.turnShape(shape);
        }else if(Array.isArray(turnedPoints)) {
            this.board.drawShape(shape.points, 'remove'); 
            shape.points = turnedPoints;
            this.board.drawShape(shape.points, 'add');
        } 
    }
    
    document.onkeydown = (e) => {

		e = e || window.event;
        
        const shape = this.currentShape;

		if (e.keyCode == '38') {
			this.turnShape(shape);
		} else if(e.keyCode == '40') {
            this.moveShape(shape, 'down');
        } else if (e.keyCode == '37') {
		   this.moveShape(shape, 'left');
		} else if (e.keyCode == '39') {
		   this.moveShape(shape, 'right');
		}

	}
	
}

function Board(size) {
	
	let boardElement = document.getElementById('board');
	
	this.size = size || 20;
	
	this.matrix;
	
	this.renderGameBoard = () => {
		
		this.matrix = [];
		
		boardElement.innerHTML = '';
		let borderProp = '1px solid black',
			drawRow = (element) => {
				let rowWidth = this.size / 2 * 31;
				element.style.borderLeft = borderProp;
				element.style.borderTop = borderProp;
				element.style.width = rowWidth+'px';
				element.style.height = '30px';
			},
			drawCol = (element, point) => {
				element.style.width = '30px';
				element.style.borderRight = borderProp;
				element.style.display = 'inline-block';
				element.style.height = '30px';
				element.setAttribute('id', 'square_' + (point.x + '_' + point.y));
			},
			row;
			for(let i = 0; i < this.size; i++) {
				row = document.createElement('div');
				drawRow(row);
				this.matrix[i] = [];
				for(let j = 0; j < this.size / 2; j++) {
					let col = document.createElement('div');
					drawCol(col, {x: i, y: j});
					row.appendChild(col);
                    this.markSquare({y: i, x: j}, 'empty');
				}
                boardElement.style.position = 'relative';
				boardElement.appendChild(row);
			}
			row.style.borderBottom = '1px solid black';
	}
	
	this.drawShape = (points, action) => {
		for(let i = 0; i < points.length; i++) {
            if(action === 'add') {
                this.addSquare(points[i], 'moving');
            } else {
                this.removeSquare(points[i]);
            }
		}	
	}
    
    this.drawScore = (score) => {
        const scoreSection = document.getElementById('score');
        scoreSection.innerHTML = score;
    }
    
    this.checkFilledLines = (shape) => {
        const coords = shape.getCoordinates(shape.points);
        let linesCount = 0;
            
        for(var i = coords.yTop; i <= coords.yBottom; i++) {
            let lineFilled = true;
            for(var j = 0; j < this.matrix[i].length; j++) {
                if(this.matrix[i][j] !== 2) {
                    lineFilled = false;
                    break;
                }
            }
            if(lineFilled) {
                this.removeLine(i, this.matrix[i].length);
                this.shiftEmptyLine(i);
                linesCount ++;
            }
        }
        return linesCount;
    }
    
    this.shiftEmptyLine = (lineInd) => {
        
        for(let i = lineInd; i > 0; i--) {
            for(let j = 0; j < this.matrix[lineInd].length; j++) {
                if(this.matrix[i-1][j] === 2) {
                    this.removeSquare({x: j, y: i-1});
                    this.addSquare({x: j, y: i}, 'static');
                }
            }
        }
        
    }
    
    this.removeLine = (index, length) => {
        for(let i = 0; i < length; i++) {
            this.removeSquare({x: i, y: index});
        }
    }
    
    this.getSquareId = (point) => {
        return 'square_' + parseInt(point.y) + '_' + parseInt(point.x);
    }
    
    this.markShapeAsStatic = (points) => {
        points.forEach(point => this.markSquare(point, 'static'));
    }
    
    this.addSquare = (point, status) => {
        this.markSquare(point, status);
        this.drawSquare(point, 'occupied');
    }
    
    this.removeSquare = (point) => {
        this.markSquare(point, 'empty');
        this.drawSquare(point, 'empty');
    }
    
	this.markSquare = (point, status) => {
        switch(status) {
            case 'empty':
                this.matrix[point.y][point.x] = 0;
            break;
            case 'moving':
                this.matrix[point.y][point.x] = 1;
            break;
            case 'static':
                this.matrix[point.y][point.x] = 2;
            break;
        }
	}
        
    this.drawSquare = (point, action) => {
        var square = document.getElementById(this.getSquareId(point));
        square.style.backgroundColor = action === 'occupied' ? 'gray' : 'white';		
    }
    
    this.drawCenter = (point) => {
        var centerSquare = document.createElement('div');
        boardElement.appendChild(centerSquare);
        centerSquare.style.width = '30px';
        centerSquare.style.height = '30px';
        centerSquare.style.position = 'absolute';
        centerSquare.style.top = (31 * point.y + 1) + 'px';
        centerSquare.style.left = (31 * point.x + 1) + 'px';
        centerSquare.setAttribute('id', 'center-square');   
        centerSquare.style.background = 'red';	
    }
    
    this.removeCenter = () => {
        let centerElement = document.getElementById('center-square');
        centerElement.parentNode.removeChild(centerElement)
    }
	
}

function Shape(points, color, board) {
	//collection of points this shape is occupaing
    this.center;
	this.points;
	this.color;
    this.board = board;
	
	this.movePoint = (direction, point, isCenter, steps = 1) => {

		switch(direction) {
            case 'up':
                point.y -= steps;
			break;
			case 'down':
                point.y += steps;
			break;
			case 'left':
                point.x -= steps;
			break;
			case 'right':
                point.x += steps;
			break;
		}
        
        return isCenter ? 'clear' : this.checkCollision(point, direction);
        
	}
    
    this.checkCollision = (point, direction) => {
        if(point.x > this.board.matrix[0].length-1) {
            return 'right';
        } else if(point.x < 0) {
            return 'left';
        }else if(point.y > this.board.matrix.length-1) {
            return 'bottom';  
        }else if(this.board.matrix[point.y][point.x] === 2) {
            return 'occupied';
        } else {
            return 'clear';
        }
    }
    
    this.getCoordinates = (points) => {
        
        var xLeft = points[0].x,
            xRight = points[0].x,
            yTop = points[0].y,
            yBottom = points[0].y;
        
        for(var i = 1; i < points.length; i++) {
            if(points[i].x < xLeft) {
                xLeft = points[i].x;
            }
            if(points[i].x > xRight) {
                xRight = points[i].x;
            }
            if(points[i].y < yTop) {
                yTop = points[i].y;
            }
            if(points[i].y > yBottom) {
                yBottom = points[i].y;
            }
        }
        
        return {xLeft: xLeft, xRight: xRight, yTop: yTop, yBottom: yBottom};
    }
    
    this.getMaxLength = (point) => {
        return Math.max(point.x, point.y);
    }

    this.getCenter = (coords) => {
        
        const length = this.getLength(coords),
              maxLength = this.getMaxLength(length);
        
        let x = maxLength / 2 + coords.xLeft,
            y = maxLength / 2 + coords.yTop;
        
        if(y % 1 !== 0 && length.x > length.y) {
            y = y -= 1;
        }
        //if(x % 1 !== 0 && length.y > length.x) {
            //x = x -= 1;
        //}
        
        return {
            x: x, 
            y: y
        };
    }
    
    
    this.getLength = (coords) => {
        return {
            x: coords.xRight - coords.xLeft, 
            y: coords.yBottom - coords.yTop
        };
    }
    
    this.getStartingPoint = (centerPoint, stepsPerAngle) => {
        let steps = parseInt(stepsPerAngle/2);
        return {x: centerPoint.x - steps, y: centerPoint.x - steps};
    }
    
    this.findPoint = (point) => {
        return this.points.findIndex(p => point.x === p.x && point.y === p.y);
    }
    
    this.move = (direction) => {
        const newPoints = [];
        for(var i = 0; i < this.points.length; i++) {
            const newPoint = {...this.points[i]};
            let status = this.movePoint(direction, newPoint);
            if(status !== 'clear') {
                if(direction !== 'down') {
                    status = direction;
                }
                return status;
            } 
            newPoints.push(newPoint);
        }   
        //this.board.removeCenter(this.center);
        this.movePoint(direction, this.center, true); 
        //this.board.drawCenter(this.center); 
        return newPoints;   
    }
    
    this.turn = () => {
        
        let maxLength = this.getMaxLength(this.getLength(this.getCoordinates(this.points))) + 1,
            stepsPerAngle,
            currentPoint = {...this.center};
        
        const cyclesCount = parseInt(maxLength/2);
        let newPoints = [];
        
        if(maxLength % 2 === 0) {
            stepsPerAngle = 0;
        } else {
            stepsPerAngle = 1;
            newPoints.push(currentPoint); //center point
        }
        
        for(var cycleNum = 1; cycleNum <= cyclesCount; cycleNum ++) {
            
            stepsPerAngle += 2;
            currentPoint = getInitialPosition(this.center, stepsPerAngle); //closest top-left position in relation to center point
            
            if(cycle(0, 4 * (stepsPerAngle-1), stepsPerAngle -1, currentPoint, (direction, currentStep, currentPoint) => {
                
                const pointIndexToMove = this.findPoint(currentPoint);

                if(pointIndexToMove !== -1) {
                    
                    let newPoint = {...this.points[pointIndexToMove]};
                    
                    if(cycle(currentStep, stepsPerAngle -1, stepsPerAngle -1, currentPoint, (direction, currentStep, currentPoint) => {
                        const status = this.movePoint(direction, newPoint);
                        

                        
                        
                        if(status !== 'clear'){
                            if(status === 'occupied') {
                               if(direction === 'left' || direction === 'up') {
                                   newPoints = 'left';
                               } else {
                                   newPoints = 'right';
                               }
                            } else {
                                newPoints = status;
                            }
                           
                            return true;
                        }
                    })) return true;
                    newPoints.push(newPoint);
                } 
                
            })) break;
            
        }
        
        return newPoints;
        
        function cycle(currentStep, stepsCount, stepsPerAngle, currentPoint, callback) {

            const clockWiseSequence = ['right', 'down', 'left', 'up'],
                  next = {...currentPoint};

            for(var step = 0; step < stepsCount; step ++) {  

                    const angle = parseInt(currentStep/stepsPerAngle);
                    let axis = angle % 2 === 0 ? 'x' : 'y';

                    if(callback(clockWiseSequence[angle], currentStep, next)) {
                        return true;
                    }

                    if(angle < 2) {
                        next[axis] ++;   
                    } else {
                        next[axis] --;
                    }

                currentStep ++;
                if(currentStep === 4 * stepsPerAngle) {
                    currentStep = 0;
                }

            }

        }
        
        function getInitialPosition(center, stepsPerAngle) {
            return {
                x: Math.ceil(center.x + (-parseInt(stepsPerAngle/2))),
                y: Math.ceil(center.y + (-parseInt(stepsPerAngle/2)))
            };
        }
        
    }

	this.constructor = () => {
    	this.center = this.getCenter(this.getCoordinates(points));
    	this.points = points;
    	this.color = color;
    }
    this.constructor();
}

const game = new Game(new Board());
game.init();