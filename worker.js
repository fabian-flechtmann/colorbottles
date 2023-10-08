import { Solver, TodoQueue, TodoStack, TodoHeap } from './engine.js'

var solver = null

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
				new TodoHeap(),
				(newSolution) => self.postMessage(JSON.stringify(newSolution)),
				() => {}
			)
			solver.solve()
		}
		else {
			console.log("Worker got unkown cmd", e)
		}
	},
	false
)
