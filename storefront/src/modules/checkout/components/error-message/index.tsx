const ErrorMessage = ({ error, 'data-testid': dataTestid }: { error?: string | null, 'data-testid'?: string }) => {
  if (!error) {
    return null
  }

  return (
    <div
      className="pt-2 text-xs font-normal leading-5 text-ui-fg-error"
      data-testid={dataTestid}
    >
      <span>{error}</span>
    </div>
  )
}

export default ErrorMessage
