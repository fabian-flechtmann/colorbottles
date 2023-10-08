var worker = null

const solveButton = document.getElementById("solveButton")
const stopButton = document.getElementById("stopButton")
const taskArea = document.getElementById("task")
const solutionArea = document.getElementById("solution")
const algorithmSelect = document.getElementById("algorithm")

solveButton.onclick = function() {
	const timestamp = Date.now()
	const task = JSON.parse(taskArea.value)
	const algorithm = algorithmSelect.value

	if (worker !== null) {
		console.log("Terminating previous worker ...")
		worker.terminate()
	}

	solutionArea.textContent = "Solving task with " + algorithm + " ..."

	worker = new Worker("worker.js", { type: "module" })

	worker.addEventListener(
		"message",
		function(e) {
			solutionArea.textContent += "\n\nFound new solution with " + e.data.length + " steps after " + (Date.now() - timestamp) + " ms"
			solutionArea.textContent += "\n\n" + JSON.stringify(e.data)
		},
		false
	)

	worker.postMessage({"cmd": "solve", "algorithm": algorithm, "task": task})
}

stopButton.onclick = function() {
	if (worker === null) {
		console.log("No worker to terminate")
	}
	else {
		console.log("Terminating worker, might take a second ...")
		worker.terminate()
		worker = null
	}
}
