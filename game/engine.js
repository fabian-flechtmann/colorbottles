/*
Gamestate:
There are n bottles. Each bottle has a number of layers.
Layers at the bottom can be colors, layers at the top can be empty.
We represent these as n arrays of integers. 0 is empty space, other integers are colors.
The start of the array is the bottom of the bottle.
Example gamestate: [[1, 2, 0], [2, 1, 0], [1, 2, 0], [0, 0, 0]]

Move:
A move specifies two bottle indices, from and to. It always transfers as many layers as possible.
*/

import { Heap } from './heap.js'

class Lookup {
	constructor() {
		this.data = {}
	}
	#toKey(gamestate) {
		var key = gamestate.map(JSON.stringify)
		key.sort()
		return JSON.stringify(key)
	}
	alreadySeen(gamestate, length) {
		let key = this.#toKey(gamestate)
		if (this.data.hasOwnProperty(key)) {
			let seenLength = this.data[key]
			if (length < seenLength) {
				this.data[key] = length
				return false
			}
			return true
		}
		else {
			this.data[key] = length
			return false
		}
	}
	size() {
		return Object.keys(this.data).length
	}
}

class TodoQueue {
	constructor() {
		this.queue = []
	}
	push(path, gamestate) {
		this.queue.push([path, gamestate])
	}
	pop() {
		return this.queue.shift()
	}
	size() {
		return this.queue.length
	}
}

class TodoStack {
	constructor() {
		this.queue = []
	}
	push(path, gamestate) {
		this.queue.push([path, gamestate])
	}
	pop() {
		return this.queue.pop()
	}
	size() {
		return this.queue.length
	}
}

function calcScore(gamestate) {
	var score = 0
	for (var i = 0; i < gamestate.length; i++) {
		var firstColor = gamestate[i][0];
		for (var j = 1; gamestate[i].length; j++) {
			if (gamestate[i][j] === firstColor) {
				score++
			}
			else {
				break
			}
		}
	}
	return score
}

class TodoHeap {
	constructor() {
		this.heap = new Heap((a, b) => calcScore(b[1]) - calcScore(a[1]))
	}
	push(path, gamestate) {
		this.heap.push([path, gamestate])
	}
	pop() {
		return this.heap.pop()
	}
	size() {
		return this.heap.size()
	}
}

function getTopColor(bottle) {
	var color = 0
	var length = 0
	for (var i = 0; i < bottle.length; i++) {
		if (bottle[i] === 0) {
			return [color, length]
		}
		else if (color === bottle[i]) {
			length += 1
		}
		else {
			color = bottle[i]
			length = 1
		}
	}
	return [color, length]
}

function isBottleDone(bottle) {
	var color = bottle[0]
	if (color === 0) {
		return false
	}
	for (var i = 1; i < bottle.length; i++) {
		if (bottle[i] !== color) {
			return false
		}
	}
	return true
}

function isBottleEmpty(bottle) {
	for (var i = 0; i < bottle.length; i++) {
		if (bottle[i] !== 0) {
			return false
		}
	}
	return true
}

function isSolved(gamestate) {
	for (var i = 0; i < gamestate.length; i++) {
		var bottle = gamestate[i]
		if (!(isBottleEmpty(bottle) || isBottleDone(bottle))) {
			return false
		}
	}
	return true
}

function getMoves(gamestate) {
	const result = []
	for (var i = 0; i < gamestate.length; i++) {
		if (gamestate[i][0] === 0) {
			// from-bottle is empty
			continue
		}
		else if (isBottleDone(gamestate[i])) {
			// from-bottle is full and has only one color
			continue
		}
		for (var j = 0; j < gamestate.length; j++) {
			if (i === j) {
				// to-bottle has to be different
				continue
			}
			var fromBottle = gamestate[i]
			var toBottle = gamestate[j]
			if (toBottle[toBottle.length-1] != 0) {
				// to-bottle needs some empty space
				continue
			}
			if (toBottle[0] === 0) {
				// we can always move into an empty bottle
				result.push([i, j])
				continue
			}
			var fromColor = getTopColor(fromBottle)
			var toColor = getTopColor(toBottle)
			if (fromColor[0] !== toColor[0]) {
				// can't move to different color
				continue
			}
			var hasSpace = true
			for (var k = 0; k < fromColor[1]; k++) {
				if (toBottle[toBottle.length - k - 1] !== 0) {
					hasSpace = false
					break
				}
			}
			if (!hasSpace) {
				continue
			}
			result.push([i, j])
		}
	}
	return result
}

function makeMove(move, gamestate) {
	var fromBottleIdx = move[0]
	var toBottleIdx = move[1]
	var topColor, topColorLength
	[topColor, topColorLength] = getTopColor(gamestate[fromBottleIdx])

	var newFromBottle = [...gamestate[fromBottleIdx]]
	for (var i = newFromBottle.length - 1; -1 < i; i--) {
		if (newFromBottle[i] == 0) {
			continue
		}
		else if (newFromBottle[i] == topColor) {
			newFromBottle[i] = 0
		}
		else {
			break
		}
	}

	var newToBottle = [...gamestate[toBottleIdx]]
	var toFillCount = topColorLength
	for (var i = 0; i < newToBottle.length; i++) {
		if (toFillCount <= 0) {
			break
		}
		if (newToBottle[i] == 0) {
			newToBottle[i] = topColor
			toFillCount -= 1
		}
	}

	var result = []
	for (var i = 0; i < gamestate.length; i++) {
		if (i == fromBottleIdx) {
			result.push(newFromBottle)
		}
		else if (i == toBottleIdx) {
			result.push(newToBottle)
		}
		else {
			result.push([...gamestate[i]])
		}
	}
	return result
}

class Solver {
	constructor(initialGamestate, todos, onNewSolutionFound, onFinished) {
		this.initialGamestate = initialGamestate
		this.todos = todos
		this.onNewSolutionFound = onNewSolutionFound
		this.onFinished = onFinished

		this.bestSolution = null
		this.seen = new Lookup()
	}
	solve() {
		this.todos.push([], this.initialGamestate)
		var iterationCount = 0
		while (this.todos.size() !== 0) {
			var element = this.todos.pop()
			var path = element[0]
			var gamestate = element[1]

			if (this.bestSolution !== null && this.bestSolution.length <= path.length) {
				continue
			}
			
			if (iterationCount % 100000 === 0) {
				console.log("Worker status:", iterationCount, this.todos.size(), this.seen.size(), path.length)
			}
			iterationCount += 1

			if (isSolved(gamestate)) {
				if (this.bestSolution === null || path.length < this.bestSolution.length) {
					this.bestSolution = path
					this.onNewSolutionFound(path)
					console.log("Found", path.length, "step solution after", iterationCount, "iterations")
					continue
				}
			}

			if (this.seen.alreadySeen(gamestate, path.length)) {
				continue
			}
			
			var moves = getMoves(gamestate)
			for (var i = 0; i < moves.length; i++) {
				var newState = makeMove(moves[i], gamestate)
				var newPath = [...path]
				newPath.push(moves[i])
				this.todos.push(newPath, newState)
			}
		}
		console.log("Worker finished after", iterationCount, "iterations")
		this.onFinished()
		return iterationCount
	}
}

export { Solver, TodoQueue, TodoStack, TodoHeap, makeMove }
