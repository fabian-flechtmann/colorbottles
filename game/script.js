/*

Have a table

Have a loop: Generate puzzle, generate solution, play solution

*/

import { makeMove } from './engine.js'

var worker = null

var puzzle = null
var solution = null
var nextMove = 0

const gameTable = document.getElementById("gameTable")
const statusLine = document.getElementById("statusLine")
const newPuzzleButton = document.getElementById("newPuzzleButton")
const nextStepButton = document.getElementById("nextStepButton")
const prevStepButton = document.getElementById("prevStepButton")

function generateNewPuzzle(height, width, empty) {
	newPuzzleButton.disabled = true

	puzzle = null
	solution = null
	nextMove = 0

	var buffer = []
	for (var i = 0; i < height; i++) {
		for (var j = 0; j < width; j++) {
			buffer.push(j+1)
		}
	}
	shuffle(buffer)
	for (var i = 0; i < height * empty; i++) {
		buffer.push(0)
	}
	var result = []
	var offset = 0;
	for (var i = 0; i < width + empty; i++) {
		var col = [];
		for (var j = 0; j < height; j++) {
			col.push(buffer[offset])
			offset++
		}
		result.push(col)
	}
	puzzle = result
}

function draw() {
	if (solution === null) {		
		nextStepButton.disabled = true
		prevStepButton.disabled = true
	} else {
		statusLine.innerHTML = "Solution found, at step " + nextMove + " of " + solution.length
		nextStepButton.disabled = nextMove === solution.length
		prevStepButton.disabled = nextMove === 0
	}

	var state = puzzle
	for (var i = 0; i < nextMove; i++) {
		state = makeMove(solution[i], state)
	}

	var width = state.length
	var height = state[0].length
	
	var result = ``
	for (var i = 0; i < height; i++) {
		if (i == 0) {
			result += `<tr class="first">`
		} else if (i == height - 1) {
			result += `<tr class="last">`
		} else {
			result += `<tr>`
		}
		for (var j = 0; j < width; j++) {
			var color = state[j][height-i-1]
			result += `<td class="box color` + color + `"></td>`
		}
		result += `</tr>`
	}
	gameTable.innerHTML = result
}

function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}

function solve() {
	statusLine.innerHTML = "Solving ..."

	if (worker !== null) {
		console.log("Terminating previous worker ...")
		worker.terminate()
	}

	worker = new Worker("worker.js", { type: "module" })

	worker.addEventListener(
		"message",
		function(e) {
			if (e.data.event == "solution") {
				solution = e.data.data
			}
			else if (e.data.event == "finished") {
				newPuzzleButton.disabled = false
				if (solution === null) {
					statusLine.innerHTML = "Puzzle could not be solved"
				} else {
					draw()
				}
			}
		},
		false
	)

	worker.postMessage({"cmd": "solve", "algorithm": "bfs", "task": puzzle})
}

newPuzzleButton.onclick = function() {
	generateNewPuzzle(4, 8, 2)
	draw()
	solve()
}

nextStepButton.onclick = function() {
	nextMove += 1
	draw()
}

prevStepButton.onclick = function() {
	nextMove -= 1
	draw()
}

window.onload = function() {
	newPuzzleButton.onclick()
}
