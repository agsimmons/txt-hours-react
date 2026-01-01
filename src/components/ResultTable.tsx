import Decimal from "decimal.js"
import { useMemo, createContext, use } from "react"

import type { TaskEntry } from "../types"

type ResultContextType = {
  dates: string[]
}

const ResultContext = createContext<ResultContextType>({
  dates: [],
})

type TaskProps = {
  task: TaskEntry
}

function Task({ task }: TaskProps) {
  const { dates } = use(ResultContext)

  return (
    <tr>
      <th scope="row">{task.task}</th>
      {dates.map((date) => (
        <td key={date}>{task.durations.get(date)?.total({ unit: "hours" }).toPrecision(2)}</td>
      ))}
    </tr>
  )
}
type ResultTableProps = {
  tasks: TaskEntry[]
  onReturnToInput: () => void
}

function ResultTable({ tasks, onReturnToInput }: ResultTableProps) {
  const dates = useMemo<string[]>(
    () =>
      Array.from(
        new Set(
          tasks.flatMap((task) => Array.from(task.durations.keys()).map((date) => date.toString())),
        ),
      ).sort(),
    [tasks],
  )

  const totals: Decimal[] = useMemo(() => {
    const _totals: Decimal[] = []

    for (const date of dates) {
      let totalDuration = new Decimal(0)

      for (const task of tasks) {
        const duration = task.durations.get(date)
        if (duration !== undefined) {
          totalDuration = totalDuration.plus(duration.total({ unit: "hours" }).toPrecision(2))
        }
      }

      _totals.push(totalDuration)
    }

    return _totals
  }, [tasks, dates])

  const contextValue = useMemo<ResultContextType>(() => ({ dates }), [dates])

  return (
    <>
      <button type="button" onClick={onReturnToInput}>
        Return to input
      </button>
      <ResultContext value={contextValue}>
        <table>
          <thead>
            <tr>
              <th scope="col"></th>
              {dates.map((date) => (
                <th key={date} scope="col">
                  {date}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <Task key={task.task} task={task} />
            ))}
            <tr>
              <th scope="row">TOTALS </th>
              {totals.map((total, index) => (
                // eslint-disable-next-line react-x/no-array-index-key
                <td key={index}>{total.toDecimalPlaces(2).toFixed(2)}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </ResultContext>
    </>
  )
}

export default ResultTable
