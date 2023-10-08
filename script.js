var worker = null

document.getElementById("solveButton").onclick = function() {
	const task = JSON.parse(document.getElementById("task").value)

	if (worker !== null) {
		worker.terminate()
	}

	worker = new Worker("worker.js", { type: "module" })

	worker.addEventListener(
		"message",
		function(e) {
			document.getElementById("solution").textContent = e.data;
		},
		false
	)

	worker.postMessage({"cmd": "solve", "algorithm": "astar", "task": task})
}

document.getElementById("stopButton").onclick = function() {
	if (worker === null) {
		console.log("No worker to terminate")
	}
	else {
		console.log("Terminating worker, might take a second ...")
		worker.terminate()
		worker = null
	}
}
