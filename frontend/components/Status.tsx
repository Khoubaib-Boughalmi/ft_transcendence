export default function Status({size}: {size?: "sm" | "md" | "lg"}) {
	return (
		<div
            data-size={size}
            className="group flex items-center gap-1 rounded-3xl bg-green-600 px-1 text-[0.65rem] data-[size=sm]:text-[0.55rem]">
			<div className="aspect-square h-2 w-2 rounded-full bg-green-400"></div>
			<div className="group-data-[size=sm]:leading-4">Online</div>
		</div>
	)
}