import { twMerge } from "tailwind-merge"

export default function Divider({ orientation = 'horizontal', className }: { orientation?: 'horizontal' | 'vertical', className?: string }) {
    return (
        <div 
            data-orientation={orientation}
        className={twMerge("data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full w-[1px] h-[1px] bg-background-900 mix-blend-soft-light", className)}>
        </div>
    )
}