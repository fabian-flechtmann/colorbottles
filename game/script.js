import { getMoves, makeMove } from './engine.js'

var worker = null

var puzzle = null
var pastMoves = null
var solution = null

var highlightedColumn = null

const gameTable = document.getElementById("gameTable")
const statusLine = document.getElementById("statusLine")
const newPuzzleButton = document.getElementById("newPuzzleButton")
const undoButton = document.getElementById("undoButton")
const hintButton = document.getElementById("hintButton")

function generateNewPuzzle(height, width, empty) {
	newPuzzleButton.disabled = true
	undoButton.disabled = true
	hintButton.disabled = true

	pastMoves = []
	solution = null

	highlightedColumn = null

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
	console.log("Puzzle: " + JSON.stringify(puzzle))
}

function draw() {
	if (solution !== null) {
		if (solution.length === 0) {
			statusLine.innerHTML = "Puzzle is solved"
		} else if (solution.length === 1) {
			statusLine.innerHTML = "Puzzle can be solved in 1 move"
		} else {
			statusLine.innerHTML = "Puzzle can be solved in " + solution.length + " moves"
		}
	}
	undoButton.disabled = pastMoves === null || pastMoves.length === 0
	hintButton.disabled = solution === null || solution.length === 0

	var state = getCurrentState()

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
			var maybeHighlight = ""
			if (highlightedColumn === j && color !== 0) {
				maybeHighlight = ` highlight`
			}
			result += `<td class="box color` + color + maybeHighlight + `"></td>`
		}
		result += `</tr>`
	}
	gameTable.innerHTML = result

	addColumnHighlighting()
}

function getCurrentState() {
	var state = puzzle
	for (var i = 0; i < pastMoves.length; i++) {
		state = makeMove(pastMoves[i], state)
	}
	return state
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
					statusLine.innerHTML = "Puzzle can not be solved"
				} else {
					hintButton.disabled = false
					draw()
				}
			}
		},
		false
	)

	var state = getCurrentState()
	worker.postMessage({"cmd": "solve", "algorithm": "bfs", "task": state})
}

newPuzzleButton.onclick = function() {
	generateNewPuzzle(6, 8, 2)
	solve()
	draw()
}

hintButton.onclick = function() {
	if (solution !== null && solution.length != 0) {
		var move = solution.shift()
		pastMoves.push(move)
		draw()
	}
}

undoButton.onclick = function() {
	if (pastMoves.length !== 0) {
		var move = pastMoves.pop()
		if (solution === null) {
			solve()
		} else {
			solution.unshift(move)
		}
		draw()
	}
}

window.addEventListener("keydown", function (event) {
	if (event.defaultPrevented) {
	return; // Do nothing if the event was already processed
	}
	switch (event.key) {
		case "Enter":
			newPuzzleButton.onclick()
			break;
		case "ArrowLeft":
			undoButton.onclick()
			break;
		case "ArrowRight":
			hintButton.onclick()
			break;
		default:
			return;
  }

  // Cancel the default action to avoid it being handled twice
  event.preventDefault();
}, true);

function onCellClick(td, columnIndex) {
	return function() {
		if (highlightedColumn === null) {
			highlightedColumn = columnIndex
		} else if (highlightedColumn === columnIndex) {
			highlightedColumn = null
		} else {
			var state = getCurrentState()
			var possibleMoves = getMoves(state)
			var move = [highlightedColumn, columnIndex]
			if (possibleMoves.find(x => x[0] === move[0] && x[1] === move[1]) !== undefined) {
				highlightedColumn = null
				pastMoves.push(move)
				if (solution !==null && solution[0] === move) {
					solution.unshift()
				} else {
					solution = null
					solve()
				}
			}
		}
		draw()
	}
}

function addColumnHighlighting() {
	var trs = document.querySelectorAll("tr")
	for (var i = 0; i < trs.length; i++) {
		var tr = trs[i]
		for (var j = 0; j < tr.children.length; j++) {
			var td = tr.children[j]
			td.onclick = onCellClick(td, j)
		}
	}
}

window.onload = function() {
	newPuzzleButton.onclick()
}
