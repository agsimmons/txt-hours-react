import type { ValidatedData } from "../types"

type ResultTableProps = {
  validatedData: ValidatedData
  onReturnToInput: () => void
}

export function ResultTable({ validatedData, onReturnToInput }: ResultTableProps) {
  return (
    <>
      <button type="button" onClick={onReturnToInput}>
        Return to input
      </button>
      <table>
        <thead>
          <tr>
            <th scope="col"></th>
            {validatedData.dates.map((date) => (
              <th key={date.toString()} scope="col">
                {date.toString()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {validatedData.taskNames.map((taskName) => (
            <tr key={taskName}>
              <th scope="row">{taskName}</th>
              {validatedData.dates.map((date) => (
                <td key={date.toString()}>
                  {validatedData.taskIndexedTaskDurations.get(taskName)?.get(date) !== undefined
                    ? Number(
                        validatedData.taskIndexedTaskDurations
                          .get(taskName)
                          ?.get(date)
                          ?.total({ unit: "hours" }),
                      ).toFixed(2)
                    : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
