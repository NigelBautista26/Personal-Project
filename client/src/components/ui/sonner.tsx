"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-zinc-900/95 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-white group-[.toaster]:border group-[.toaster]:border-white/10 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl",
          description: "group-[.toast]:text-zinc-400",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-white group-[.toast]:rounded-xl group-[.toast]:font-medium",
          cancelButton:
            "group-[.toast]:bg-zinc-800 group-[.toast]:text-zinc-300 group-[.toast]:rounded-xl",
          error:
            "group-[.toaster]:bg-red-950/90 group-[.toaster]:border-red-500/30 group-[.toaster]:text-red-100",
          success:
            "group-[.toaster]:bg-green-950/90 group-[.toaster]:border-green-500/30 group-[.toaster]:text-green-100",
          warning:
            "group-[.toaster]:bg-orange-950/90 group-[.toaster]:border-orange-500/30 group-[.toaster]:text-orange-100",
          info:
            "group-[.toaster]:bg-blue-950/90 group-[.toaster]:border-blue-500/30 group-[.toaster]:text-blue-100",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
