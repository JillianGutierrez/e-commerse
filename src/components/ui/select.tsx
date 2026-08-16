import * as React from 'react'
import { cn } from '@/lib/utils'

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

interface SelectContextValue {
  value?: string
  onValueChange?: (value: string) => void
}

const SelectContext = React.createContext<SelectContextValue>({})

function Select({ value, onValueChange, children }: SelectProps) {
  return (
    <SelectContext.Provider value={{ value, onValueChange }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

function SelectTrigger({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { value, onValueChange } = React.useContext(SelectContext)
  const [open, setOpen] = React.useState(false)

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
      <span className="ml-2 h-4 w-4 shrink-0 opacity-50">▼</span>
    </button>
  )
}

function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = React.useContext(SelectContext)
  return <span>{value || placeholder}</span>
}

function SelectContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const [open, setOpen] = React.useState(false)
  
  React.useEffect(() => {
    const handleClickOutside = () => setOpen(false)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  if (!open) return null

  return (
    <div
      className={cn(
        'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white text-slate-950 shadow-md',
        className
      )}
    >
      <div className="max-h-96 overflow-auto p-1">{children}</div>
    </div>
  )
}

function SelectItem({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const { value: selectedValue, onValueChange } = React.useContext(SelectContext)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const handleClickOutside = () => setOpen(false)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <div
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-slate-100 focus:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        selectedValue === value && 'bg-slate-100',
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
