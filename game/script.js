/*

Have a table

Have a loop: Generate puzzle, generate solution, play solution

*/

var worker = null

const gameTable = document.getElementById("gameTable")

function generateNewPuzzle(height, width, empty) {
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
	return result
}

function draw(table, puzzle) {
	var width = puzzle.length
	var height = puzzle[0].length
	
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
			var color = puzzle[j][i]
			result += `<td class="box color` + color + `"></td>`
		}
		result += `</tr>`
	}
	console.log(result)
	table.innerHTML = result
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

window.onload = function() {
	console.log("its go time")
	while (true) {
		var puzzle = generateNewPuzzle(4, 8, 2)
		console.log(puzzle)
		draw(gameTable, puzzle) 
		var solution = solve(puzzle)
		if (solution === null) {
			showUnsolvable()
		} else {
			show(solution)
		}
		break
	}
}
