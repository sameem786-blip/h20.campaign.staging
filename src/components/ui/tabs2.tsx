"use client"
import {
  Tab as AriaTab,
  TabList as AriaTabList,
  type TabListProps as AriaTabListProps,
  TabPanel as AriaTabPanel,
  type TabPanelProps as AriaTabPanelProps,
  type TabProps as AriaTabProps,
  Tabs as AriaTabs,
  type TabsProps as AriaTabsProps,
  composeRenderProps,
} from "react-aria-components"
import { cn } from "@/lib/utils"

function Tabs({ className, ...props }: AriaTabsProps) {
  return (
    <AriaTabs
      className={composeRenderProps(className, (className) =>
        cn(
          "group flex flex-col gap-0",
          /* Orientation */
          "data-[orientation=vertical]:flex-row",
          className,
        ),
      )}
      {...props}
    />
  )
}

const TabList = <T extends object>({ className, ...props }: AriaTabListProps<T>) => (
  <AriaTabList
    className={composeRenderProps(className, (className) =>
      cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        /* Orientation */
        "data-[orientation=vertical]:h-auto data-[orientation=vertical]:flex-col",
        className,
      ),
    )}
    {...props}
  />
)

const Tab = ({ className, ...props }: AriaTabProps) => (
  <AriaTab
    className={composeRenderProps(className, (className) =>
      cn(
        "text-sm font-medium [font-family:var(--font-gt-america)] outline-none ring-offset-background transition-all text-black",
        /* Focus Visible */
        "data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focus-visible]:ring-offset-2",
        /* Disabled */
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        /* Selected */
        "data-[selected]:bg-background data-[selected]:text-foreground data-[selected]:shadow-sm",
        /* Hover */
        "data-[hovered]:bg-muted/80",
        /* Orientation */
        "group-data-[orientation=vertical]:w-full",
        className,
      ),
    )}
    {...props}
  />
)

const TabPanel = ({ className, ...props }: AriaTabPanelProps) => (
  <AriaTabPanel
    className={composeRenderProps(className, (className) =>
      cn(
        "ring-offset-background",
        /* Focus Visible */
        "data-[focus-visible]:outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focus-visible]:ring-offset-2",
        className,
      ),
    )}
    {...props}
  />
)

export { Tabs, TabList, TabPanel, Tab }
