import { Dropdown, DropdownItem, extendVariants } from "@nextui-org/react";

export function SuperDropdown({ children, ...props }: any) {
    return (
        <Dropdown classNames={{
            content: "bg-card-400",
        }} {...props}>
            {children}
        </Dropdown>
    )
}

export const SuperDropdownItem = extendVariants(DropdownItem, {
    slots: {
        base: "dark:bg-black",
    }
})