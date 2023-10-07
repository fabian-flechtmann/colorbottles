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

class Lookup extends Set {
	#toKey(gamestate) {
		var key = gamestate.map(JSON.stringify)
		key.sort()
		return JSON.stringify(key)
	}
	add(gamestate) {
		super.add(this.#toKey(gamestate))
	}
	has(gamestate) {
  		return super.has(this.#toKey(gamestate))
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
		if (gamestate[i][0] == 0) {
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

function solve(initialGamestate, todosProvider) {
	const todos = todosProvider()
	todos.push([], initialGamestate)
	const seen = new Lookup()
	var iterationCount = 0
	while (todos.size() !== 0) {
		iterationCount += 1
		var element = todos.pop()
		var path = element[0]
		var gamestate = element[1]
		
		if (iterationCount % 1000 == 0) {
			console.log(iterationCount, todos.size(), seen.size, path.length)
		}

		if (isSolved(gamestate)) {
			console.log("solved in", iterationCount, "iterations")
			return path
		}
		if (seen.has(gamestate)) {
			continue
		}
		seen.add(gamestate)
		var moves = getMoves(gamestate)
		for (var i = 0; i < moves.length; i++) {
			var newState = makeMove(moves[i], gamestate)
			var newPath = [...path]
			newPath.push(moves[i])
			todos.push(newPath, newState)
		}
	}
	return null
}

/*var gamestate = [
	[1, 2, 0],
	[2, 1, 0],
	[1, 2, 0],
	[0, 0, 0]
]
console.log(JSON.stringify(solve(gamestate, () => new TodoHeap())))*/

var gamestate_big = [
	[3, 2, 1, 1],
	[3, 5, 4, 2],
	[6, 8, 7, 6],
	[6, 6, 8, 1],
	[7, 5, 8, 2],
	[3, 4, 3, 5],
	
	[8, 7, 9, 5],
	[2, 4, 4, 9],
	[1, 7, 9, 9],
	
	[0, 0, 0, 0],
	[0, 0, 0, 0],
]
console.log(JSON.stringify(solve(gamestate_big, () => new TodoHeap())))
