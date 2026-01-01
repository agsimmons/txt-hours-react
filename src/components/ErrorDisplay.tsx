type ErrorDisplayProps = {
  message: string
}

function ErrorDisplay({ message }: ErrorDisplayProps) {
  return <p>{message}</p>
}

export default ErrorDisplay
