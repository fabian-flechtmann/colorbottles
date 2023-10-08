import { Solver, TodoQueue, TodoStack, TodoHeap } from './engine.js'

var solver = null

function getTodo(algorithm) {
	if (algorithm === "astar") {
		return new TodoHeap()
	}
	else if (algorithm === "bfs") {
		return new TodoQueue()
	}
	else if (algorithm === "dfs") {
		return new TodoStack()
	}
	else {
		throw new Error("Unknown algorithm", algorithm)
	}
}

self.addEventListener(
	'message',
	function(e) {
		const cmd = e.data.cmd
		if (cmd === "solve") {
			console.log("Worker got 'solve' cmd")
			if (solver !== null) {
				solver.stop()
			}
			solver = new Solver(
				e.data.task,
				getTodo(e.data.algorithm),
				(newSolution) => self.postMessage(newSolution),
				() => console.log("Solving finished")
			)
			solver.solve()
		}
		else {
			console.log("Worker got unkown cmd", e)
		}
	},
	false
)
