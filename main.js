// board size 10x20

function Game(board) {
	
	this.board = board;
    
    const verticalLine = [
        {x: 2, y: 2}, 
        {x: 2, y: 3}, 
        {x: 2, y: 4}, 
        {x: 2, y: 5},
        {x: 2, y: 6},
        {x: 3, y: 4}
    ];    
    
    const ZShape = [
        {x: 4, y: 2}, 
        {x: 3, y: 3}, 
        {x: 4, y: 3}, 
        {x: 5, y: 2}
    ];
    
    const LShape = [
        {x: 3, y: 2}, 
        {x: 3, y: 3}, 
        {x: 4, y: 3}, 
        {x: 5, y: 3}
    ];
    
    const TShape = [
        {x: 4, y: 2}, 
        {x: 3, y: 3}, 
        {x: 4, y: 3}, 
        {x: 5, y: 3}
    ];
    
    const OShape = [
        {x: 5, y: 2}, 
        {x: 4, y: 2}, 
        {x: 4, y: 3}, 
        {x: 5, y: 3}
    ];
    
    const IShape = [
        {x: 3, y: 2}, 
        {x: 4, y: 2}, 
        {x: 5, y: 2}, 
        {x: 6, y: 2}
    ];
    
	this.shapes = [
		new Shape(IShape, 'gray', board)
	];	
    
	this.init = () => {
		this.board.renderGameBoard();
		this.board.drawShape(this.shapes[0], 'add'); 
        this.board.drawCenter(this.shapes[0].center);
	}
    
    this.moveShape = (shape, direction) => {
        this.board.drawShape(shape, 'remove');
        shape.move(direction);
        this.board.drawShape(shape, 'add');
        this.board.removeCenter(shape.center); 
        this.board.drawCenter(shape.center); 
    }
    
    this.turnShape = (shape) => {
        this.board.drawShape(shape, 'remove');    
        shape.turn();
        this.board.drawShape(shape, 'add');
    }
    
    document.onkeydown = (e) => {

		e = e || window.event;
        
        const shape = this.shapes[0];

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
					this.matrix[i][j] = 0;
				}
                boardElement.style.position = 'relative';
				boardElement.appendChild(row);
			}
			row.style.borderBottom = '1px solid black';
	}
	
	this.drawShape = (shape, action) => {
		for(let i = 0; i < shape.points.length; i++) {
			this.drawSquare(shape.points[i], action);
		}	
	}
    
    this.getSquareId = (point) => {
        return 'square_' + parseInt(point.y) + '_' + parseInt(point.x);
    }
    
	this.drawSquare = (point, action) => {
		this.matrix[point.y][point.x] = action === 'remove' ? 0 : 1;
		var square = document.getElementById(this.getSquareId(point));
		square.style.background = action === 'remove' ? 'white' : 'gray';		
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
	
	this.movePoint = (direction, point, steps = 1) => {
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
	}
    
    this.getCoordinates = (points) => {
        
        var xLeft = points[0].x,
            xRight = points[0].x,
            yUp = points[0].y,
            yDown = points[0].y;
        
        for(var i = 1; i < points.length; i++) {
            if(points[i].x < xLeft) {
                xLeft = points[i].x;
            }
            if(points[i].x > xRight) {
                xRight = points[i].x;
            }
            if(points[i].y < yUp) {
                yUp = points[i].y;
            }
            if(points[i].y > yDown) {
                yDown = points[i].y;
            }
        }
        
        return {xLeft: xLeft, xRight: xRight, yUp: yUp, yDown: yDown};
    }
    
    this.getMaxLength = (point) => {
        return Math.max(point.x, point.y);
    }

    this.getCenter = (coords) => {
        
        const length = this.getLength(coords),
              maxLength = this.getMaxLength(length);
        
        let x = maxLength / 2 + coords.xLeft,
            y = maxLength / 2 + coords.yUp;
        
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
            y: coords.yDown - coords.yUp
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
         for(var i = 0; i < this.points.length; i++) {
            this.movePoint(direction, this.points[i]);
        }   
        this.movePoint(direction, this.center);
    }
    
    this.turn = () => {
        
        let maxLength = this.getMaxLength(this.getLength(this.getCoordinates(this.points))) + 1,
            stepsPerAngle = maxLength % 2 === 0 ? 0 : 1,
            currentPoint = {...this.center};
        
        const cyclesCount = parseInt(maxLength/2),
              newPoints = [];
        
        for(var cycleNum = 1; cycleNum <= cyclesCount; cycleNum ++) {
            
            stepsPerAngle += 2;
            currentPoint = getInitialPosition(this.center, stepsPerAngle);
            
            cycle(0, 4 * (stepsPerAngle-1), stepsPerAngle -1, currentPoint, (direction, currentStep, currentPoint) => {
                
                const pointIndexToMove = this.findPoint(currentPoint);

                if(pointIndexToMove !== -1) {
                    
                    const newPoint = {...this.points[pointIndexToMove]};
                    
                    cycle(currentStep, stepsPerAngle -1, stepsPerAngle -1, currentPoint, (direction, currentStep, currentPoint) => {
                        this.movePoint(direction, newPoint);
                    });
                    newPoints.push(newPoint);
                } 
                
            });
            
        }
        
        this.points = newPoints;
        
        function cycle(currentStep, stepsCount, stepsPerAngle, currentPoint, callback) {

            const clockWiseSequence = ['right', 'down', 'left', 'up'],
                  next = {...currentPoint};

            for(var step = 0; step < stepsCount; step ++) {  

                    const angle = parseInt(currentStep/stepsPerAngle);
                    let axis = angle % 2 === 0 ? 'x' : 'y';

                    callback(clockWiseSequence[angle], currentStep, next);

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