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
