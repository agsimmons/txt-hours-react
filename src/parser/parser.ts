/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Temporal } from "temporal-polyfill";
import grammar from "./grammar/txt-hours.ohm-bundle";
import type { EntryAST, FileAST, TimeEntryAST } from "../types";

type TimeRangeAST = { start: Temporal.PlainTime; end: Temporal.PlainTime };

const semantics = grammar
  .createSemantics()
  .addOperation<
    | FileAST
    | EntryAST
    | Temporal.PlainDate
    | Temporal.PlainTime
    | TimeRangeAST
    | number
    | string
  >("ast", {
    File(entries): FileAST {
      return entries.children.map((e) => e.ast() as EntryAST);
    },

    Entry(date, _nl1, timeEntries, _nl2): EntryAST {
      return {
        date: date.ast(),
        entries: timeEntries.children.map((te) => te.ast() as TimeEntryAST),
      };
    },

    Date(year, _d1, month, _d2, day) {
      return new Temporal.PlainDate(
        year.ast() as number,
        month.ast() as number,
        day.ast() as number
      );
    },

    Year(d1, d2, d3, d4) {
      return parseInt(
        d1.sourceString + d2.sourceString + d3.sourceString + d4.sourceString
      );
    },

    Month(d1, d2) {
      return parseInt(d1.sourceString + d2.sourceString);
    },

    Day(d1, d2) {
      return parseInt(d1.sourceString + d2.sourceString);
    },

    TimeEntry(timeRange, _colon, taskName, _nl): TimeEntryAST {
      const { start, end } = timeRange.ast() as {
        start: Temporal.PlainTime;
        end: Temporal.PlainTime;
      };
      return {
        start,
        end,
        task: taskName.ast() as string,
      };
    },

    TimeRange(start, _dash, end): TimeRangeAST {
      const startTime = start.ast() as Temporal.PlainTime;
      let endTime = end.ast() as Temporal.PlainTime;

      if (Temporal.PlainTime.compare(endTime, startTime) < 0) {
        endTime = endTime.add({ hours: 12 });
      }

      return {
        start: startTime,
        end: endTime,
      };
    },

    Time(hour, _colon, minute) {
      return new Temporal.PlainTime(
        hour.ast() as number,
        minute.ast() as number
      );
    },

    Hour(d1, d2) {
      return parseInt(d1.sourceString + d2.sourceString);
    },

    Minute(d1, d2) {
      return parseInt(d1.sourceString + d2.sourceString);
    },

    TaskName(chars) {
      return chars.sourceString.trim();
    },
  });

export function evaluate(input: string): FileAST {
  const matchResult = grammar.match(input.trim());

  if (matchResult.succeeded()) {
    return semantics(matchResult).ast() as FileAST;
  } else {
    throw new Error(`Parse error: ${matchResult.message}`);
  }
}
