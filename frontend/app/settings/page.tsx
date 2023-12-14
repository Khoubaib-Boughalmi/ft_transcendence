"use client";

import Card from "@/components/Card";
import Divider from "@/components/Divider";
import Input from "@/components/Input";
import UserHover from "@/components/UserHover";
import { Select, SelectItem, extendVariants } from "@nextui-org/react";
import { Rank, User, Match, Achievement, Status } from "@/types/profile";
import { RANKS, getFlag } from "@/lib/utils";
import { Button } from "@/components/Button";

// const NewSelect = extendVariants(Select, {
// 	variants: {
// 		color: {
// 			primary: {

// 			}
// 		}
// 	}
// });

const user1: User = {
	id: 1,
	username: "mcharrad",
	profile_picture: "/pfp.png",
	banner: "/background2.png",
	country: "Morocco",
	level: 1,
	level_percentage: 0,
	wins: 0,
	losses: 0,
	matches: 0,
	achievements_percentage: 0,
	rank: RANKS[0],
	division: "I",
	status: "Online",

	history: [] as Match[],
	achievements: [] as Achievement[],
	activity: Array.from({ length: 12 }).map((_, i) => 0) as number[],
};

export default function Settings() {
	const SettingSection = ({
		title,
		children,
	}: {
		title: string;
		children: React.ReactNode;
	}) => {
		return (
			<div className="flex w-full flex-col gap-2">
				<div className="text-sm">{title}</div>
				{children}
			</div>
		);
	};

	return (
		<main className="mb-12 flex w-[1000px] max-w-full flex-col justify-center gap-4">
			<Card
				header={<div className="text-xl">Settings</div>}
				footer={
					<div className="flex w-full justify-end">
						<Button>Save Changes</Button>
					</div>
				}
			>
				<div className="grid grid-cols-2 gap-8 p-6">
					<div className="flex w-full flex-col items-start gap-6">
						<SettingSection title="Username">
							<Input
								defaultValue={user1.username}
								classNames={{ container: "p-4 h-auto" }}
								placeholder="Username"
							/>
						</SettingSection>
						<Divider />
						<SettingSection title="Country">
							<Input
								defaultValue={
									getFlag(user1.country) + "  " + user1.country
								}
								classNames={{ container: "p-4 h-auto" }}
								placeholder="Country"
								disabled	
							/>
						</SettingSection>
						<Divider />
						<SettingSection title="Profile Picture">
							<div className="flex gap-2">
								<Button variant="secondary">
									Upload Profile Picture
								</Button>
								<Button variant="transparent">
									Delete Profile Picture
								</Button>
							</div>
						</SettingSection>
						<SettingSection title="Banner">
							<div className="flex gap-2">
								<Button variant="secondary">
									Upload Banner
								</Button>
								<Button variant="transparent">
									Delete Banner
								</Button>
							</div>
						</SettingSection>
						<Divider />
					</div>
					<div className="flex items-center justify-center rounded-xl bg-black text-white ">
						<UserHover user={user1} />
					</div>
				</div>

				{/* <div className="p-4 flex flex-col items-start gap-4">
					<div className="w-full">
						<div className="bg-white w-full h-96	 rounded-xl overflow-hidden">
							<img src="background2.png" className="h-full w-full object-cover"/>
						</div>
						<div className="w-full mr-auto h-16 relative">
							<div className="h-[200%] aspect-square -translate-y-1/2 rounded-full overflow-hidden">
								<img src="pfp.png" className="h-full w-full aspect-square object-cover" />
							</div>
						</div>
					</div>
					<Divider />	
				</div> */}
			</Card>
		</main>
	);
}
