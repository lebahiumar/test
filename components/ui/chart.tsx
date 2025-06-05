"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Simplified chart implementation without recharts
export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
    color?: string
  }
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

type ResponsiveContainerProps = {
  children: React.ReactNode
}

// Simple responsive container
const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ children }) => {
  return <div className="w-full h-full">{children}</div>
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ReactNode
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs",
          className
        )}
        {...props}
      >
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

// Simplified tooltip type
type TooltipProps = {
  content?: React.ReactNode
  active?: boolean
  payload?: Array<{
    name?: string
    value?: any
    dataKey?: string
    payload?: any
    color?: string
    fill?: string
  }>
  label?: string
}

// Simple tooltip
const ChartTooltip: React.FC<TooltipProps> = (props) => {
  return null // Simplified implementation that renders nothing
}

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    active?: boolean
    payload?: Array<{
      name?: string
      value?: any
      dataKey?: string
      payload?: any
      color?: string
      fill?: string
    }>
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
    label?: string
    labelFormatter?: (value: any, payload: any) => React.ReactNode
    labelClassName?: string
    formatter?: (value: any, name: string, item: any, index: number, payload: any) => React.ReactNode
    color?: string
  }
>(({ className, active, payload, hideLabel = false }, ref) => {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      <div className="grid gap-1.5">
        {payload.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color || item.fill || "#ccc" }}
            />
            <span>{item.name}: {item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

// Simple legend
type LegendProps = {
  payload?: Array<{
    value?: string
    dataKey?: string
    color?: string
  }>
  verticalAlign?: "top" | "bottom"
}

const ChartLegend: React.FC<LegendProps> = () => {
  return null // Simplified implementation that renders nothing
}

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    hideIcon?: boolean
    nameKey?: string
    payload?: Array<{
      value?: string
      dataKey?: string
      color?: string
    }>
    verticalAlign?: "top" | "bottom"
  }
>(({ className, hideIcon = false, payload, verticalAlign = "bottom" }, ref) => {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {payload.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-1.5"
        >
          {!hideIcon && (
            <div
              className="h-2 w-2 shrink-0 rounded-[2px]"
              style={{ backgroundColor: item.color || "#ccc" }}
            />
          )}
          {item.value}
        </div>
      ))}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

// Style component for the chart
const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  return null // Simplified implementation that renders nothing
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}
