export default function Divider({ orientation = 'horizontal' }: { orientation?: 'horizontal' | 'vertical' }) {
    return (
        <div 
            data-orientation={orientation}
        className="data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full w-[1px] h-[1px] bg-background-900 mix-blend-soft-light">
        </div>
    )
}