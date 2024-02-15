import { Dropdown, DropdownMenu } from "@nextui-org/react";

export function SuperDropdown({
	children,
	...props
}: React.ComponentProps<typeof Dropdown>) {
	return (
		<Dropdown
			classNames={{
				content: "bg-card-300",
			}}
			{...props}
		>
			{children}
		</Dropdown>
	);
}

export function SuperDropdownMenu({
	children,
	...props
}: React.ComponentProps<typeof DropdownMenu>) {
	return (
		<DropdownMenu
			itemClasses={{
				base: "[&:not([data-exclude])]:data-[hover=true]:bg-card-400 data-[hover=true]:text-white text-foreground-600 p-2",
			}}
			disabledKeys={["info"]}
			{...props}
		>
			{children}
		</DropdownMenu>
	);
}
