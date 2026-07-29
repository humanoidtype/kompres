import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '../../lib/utils'

const Button = forwardRef(({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
        variant === 'default' && 'bg-cyan-600 text-white hover:bg-cyan-700 shadow-sm',
        variant === 'outline' && 'border border-cyan-600 text-cyan-700 hover:bg-cyan-50',
        variant === 'ghost' && 'text-gray-700 hover:bg-gray-100',
        variant === 'destructive' && 'bg-red-600 text-white hover:bg-red-700',
        size === 'default' && 'h-10 px-5 text-sm',
        size === 'sm' && 'h-8 px-3 text-xs',
        size === 'lg' && 'h-12 px-8 text-base',
        className
      )}
      {...props}
    />
  )
})
Button.displayName = 'Button'

export { Button }
