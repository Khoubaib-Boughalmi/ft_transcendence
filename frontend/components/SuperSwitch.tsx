import { Switch } from "@nextui-org/react";

export default function SuperSwitch({...props}: React.ComponentProps<typeof Switch>)
{
    return (
        <Switch classNames={{
            wrapper: "bg-card-400"
        }}  {...props} />
    )
}