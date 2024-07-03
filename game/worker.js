import { Solver, TodoQueue } from './engine.js'

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
				new TodoQueue(),
				(newSolution) => self.postMessage({"event": "solution", "data": newSolution}),
				() => self.postMessage({"event": "finished"})
			)
			solver.solve()
		}
		else {
			console.log("Worker got unkown cmd", e)
		}
	},
	false
)
