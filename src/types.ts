import { Temporal } from "temporal-polyfill";

export type FileAST = EntryAST[];

export type EntryAST = {
  date: Temporal.PlainDate;
  entries: TimeEntryAST[];
};

export type TimeEntryAST = {
  start: Temporal.PlainTime;
  end: Temporal.PlainTime;
  task: string;
};

export type DateIndexedTaskDurations = Map<Temporal.PlainDate, TaskDurationMap>;
export type TaskDurationMap = Map<string, Temporal.Duration>;

export type TaskIndexedTaskDurations = Map<string, DateDurationMap>;
type DateDurationMap = Map<Temporal.PlainDate, Temporal.Duration>;

export type ValidatedData = {
  dates: Temporal.PlainDate[];
  taskNames: string[];
  taskIndexedTaskDurations: TaskIndexedTaskDurations;
};

export type UIState = "input" | "help" | "error" | "result";
