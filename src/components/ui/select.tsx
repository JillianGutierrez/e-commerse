import * as React from 'react'
import { cn } from '@/lib/utils'

interface SelectContextValue {
  value?: string
  onValueChange?: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextValue>({
  open: false,
  setOpen: () => {},
})

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

function Select({ value, onValueChange, children }: SelectProps) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  // Close when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative" ref={ref}>
        {children}
      </div>
    </SelectContext.Provider>
  )
}

function SelectTrigger({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen } = React.useContext(SelectContext)

  return (
    <button
      type="button"
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
      <span
        className={cn(
          'ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform duration-200',
          open && 'rotate-180'
        )}
      >
        ▼
      </span>
    </button>
  )
}

function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = React.useContext(SelectContext)
  return <span className={cn(!value && 'text-slate-400')}>{value || placeholder}</span>
}

function SelectContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const { open } = React.useContext(SelectContext)

  if (!open) return null

  return (
    <div
      className={cn(
        'absolute z-50 mt-1 min-w-full overflow-hidden rounded-md border border-slate-200 bg-white text-slate-950 shadow-md',
        className
      )}
    >
      <div className="max-h-60 overflow-auto p-1">{children}</div>
    </div>
  )
}

function SelectItem({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const { value: selectedValue, onValueChange, setOpen } = React.useContext(SelectContext)

  return (
    <div
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-3 pr-2 text-sm outline-none hover:bg-slate-100 focus:bg-slate-100',
        selectedValue === value && 'bg-slate-100 font-medium',
        className
      )}
      onClick={() => {
        onValueChange?.(value)
        setOpen(false)
      }}
    >
      {children}
    </div>
  )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
