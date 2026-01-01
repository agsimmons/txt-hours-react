import { Temporal } from "temporal-polyfill"

export type FileAST = EntryAST[]

export type EntryAST = {
  date: Temporal.PlainDate
  entries: TimeEntryAST[]
}

export type TimeEntryAST = {
  start: Temporal.PlainTime
  end: Temporal.PlainTime
  task: string
}

export type TaskEntry = {
  task: string
  durations: Map<string, Temporal.Duration>
}

export type UIState = "input" | "help" | "error" | "result"
