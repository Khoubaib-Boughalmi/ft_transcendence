"use client";
import Card from "@/components/Card";
import UserList from "@/components/UserList";
import { User } from "@/types/profile";

export default function MemberControls({
	list, controls,
}: {
	list: User[];
	controls: ({ user }: { user: User; }) => any;
}) {
	return (
		<Card className="relative h-64 overflow-hidden">
			<div className="absolute inset-0 overflow-y-scroll py-2">
				<UserList
					showHover={false}
					Controls={controls}
					type="list"
					users={list}
					classNames={{
						list: "gap-0",
						entryContainer: "bg-transparent py-2",
					}} />
			</div>
		</Card>
	);
}
