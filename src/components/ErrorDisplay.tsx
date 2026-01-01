type ErrorDisplayProps = {
  message: string
}

export function ErrorDisplay({ message }: ErrorDisplayProps) {
  return <p>{message}</p>
}
