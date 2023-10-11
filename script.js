var worker = null

const solveButton = document.getElementById("solveButton")
const stopButton = document.getElementById("stopButton")
const taskArea = document.getElementById("task")
const solutionArea = document.getElementById("solution")
const puzzleSelect = document.getElementById("puzzle")
const algorithmSelect = document.getElementById("algorithm")
const spinnerImg = document.getElementById("spinner")

const puzzle1 = `[
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
	[0, 0, 0, 0]
]`

const puzzle2 = `[
	[4, 3, 2, 1],
	[7, 6, 5, 3],
	[10, 9, 6, 8],
	[11, 2, 12, 10],
	[6, 1, 8, 3],
	[2, 9, 2, 3],
	[12, 12, 8, 7],
	[12, 7, 0, 8],
	[10, 6, 11, 7],
	[11, 4, 4, 10],
	[1, 9, 5, 4],
	[1, 5, 9, 11],
	[0, 0, 0, 0],
	[0, 0, 0, 0]
]`

const puzzle3 = `[
	[4, 3, 2, 1],
	[5, 7, 6, 5],
	[4, 7, 6, 4],
	[7, 1, 2, 4],
	[8, 7, 2, 1],
	[5, 1, 8, 9],
	[2, 9, 9, 10],
	[10, 5, 9, 3],
	[8, 3, 10, 10],
	[6, 3, 6, 8],
	[0, 0, 0, 0],
	[0, 0, 0, 0]
]`

puzzleSelect.onchange = function() {
	if (this.value === "puzzle1") {
		taskArea.textContent = puzzle1
	}
	else if (this.value === "puzzle2") {
		taskArea.textContent = puzzle2
	}
	else if (this.value === "puzzle3") {
		taskArea.textContent = puzzle3
	}
	else {
		console.log("unknown value", this.value)
	}
}

var timestamp = null

solveButton.onclick = function() {
	timestamp = Date.now()
	const task = JSON.parse(taskArea.value)
	const algorithm = algorithmSelect.value

	if (worker !== null) {
		console.log("Terminating previous worker ...")
		worker.terminate()
		spinnerImg.style.display = "none"
	}

	solutionArea.textContent = "Solving task with " + algorithm + " ..."

	worker = new Worker("worker.js", { type: "module" })

	worker.addEventListener(
		"message",
		function(e) {
			const msPassed = Date.now() - timestamp
			if (e.data.event == "solution") {
				solutionArea.textContent += "\n\nFound new solution with " + e.data.data.length + " steps after " + msPassed + " ms"
				solutionArea.textContent += "\n\n" + JSON.stringify(e.data.data)
			}
			else if (e.data.event == "finished") {

				solutionArea.textContent += "\n\nWorker finished after " + msPassed + " ms"
				spinnerImg.style.display = "none"
			}
		},
		false
	)

	worker.postMessage({"cmd": "solve", "algorithm": algorithm, "task": task})

	spinnerImg.style.display = "block"
}

stopButton.onclick = function() {
	if (worker === null) {
		console.log("No worker to terminate")
	}
	else {
		console.log("Terminating worker, might take a second ...")
		worker.terminate()
		worker = null
		solutionArea.textContent += "\n\nWorker manually stopped after " + msPassed + " ms"
	}
	spinnerImg.style.display = "none"
}

window.onload = function() {
	puzzleSelect.onchange()
}
