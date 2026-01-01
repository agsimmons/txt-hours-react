import { type SetStateAction, type Dispatch } from "react"
import { Temporal } from "temporal-polyfill"

import { evaluate } from "../syntax/parser"
import type { FileAST, TaskEntry, UIState } from "../types"

const ANCHOR_DATE = new Temporal.PlainDate(2000, 1, 1)

type TaskDurations = Map<string, Temporal.Duration>
type TaskNameToDuration = Map<string, TaskDurations>

type DataEntryProps = {
  setUIState: Dispatch<SetStateAction<UIState>>
  inputText: string
  setInputText: Dispatch<SetStateAction<string>>
  setTasks: Dispatch<SetStateAction<TaskEntry[] | null>>
}

function DataEntry({
  setUIState,
  inputText,
  setInputText,
  setTasks: setValidatedData,
}: DataEntryProps) {
  const processData = () => {
    setValidatedData(null)

    let file: FileAST
    try {
      file = evaluate(inputText)
    } catch (error) {
      alert(error)
      return
    }

    const taskNamesToDuration: TaskNameToDuration = new Map()

    for (const entry of file) {
      for (const timeEntry of entry.entries) {
        if (!taskNamesToDuration.has(timeEntry.task)) {
          taskNamesToDuration.set(timeEntry.task, new Map())
        }

        const _taskDurations = taskNamesToDuration.get(timeEntry.task)!

        const duration = ANCHOR_DATE.toPlainDateTime(timeEntry.end).since(
          ANCHOR_DATE.toPlainDateTime(timeEntry.start),
        )

        _taskDurations.set(entry.date.toString(), duration)
      }
    }

    const tasks: TaskEntry[] = []

    for (const [taskName, durations] of taskNamesToDuration.entries()) {
      tasks.push({
        task: taskName,
        durations: durations,
      })
    }

    // TODO: Sort tasks by name

    setValidatedData(tasks)
    setUIState("result")
  }

  return (
    <>
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        style={{ width: "100%", height: "75vh" }}
      />
      <button type="button" onClick={processData}>
        Submit
      </button>
    </>
  )
}

export default DataEntry
