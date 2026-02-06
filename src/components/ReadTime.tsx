type ReadTimeProps = {
  minutes: number
  className?: string
}

export function ReadTime({ minutes, className = '' }: ReadTimeProps) {
  return (
    <span className={className}>
      {minutes} min read
    </span>
  )
}
