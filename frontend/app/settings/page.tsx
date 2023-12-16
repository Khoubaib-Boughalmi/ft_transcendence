"use client";
import Card from "@/components/Card";
import Divider from "@/components/Divider";
import Input from "@/components/Input";
import UserHover from "@/components/UserHover";
import { useDisclosure } from "@nextui-org/react";
import { User } from "@/types/profile";
import { getFlag } from "@/lib/utils";
import { Button } from "@/components/Button";
import Link from "next/link";
import { user1 } from "@/mocks/profile";
import ModalSet from "@/components/ModalSet";
import { useRef } from "react";
import { Lock, Unlock } from "lucide-react";

function UploadButton({
	children,
	name,
	...props
}: React.ComponentProps<typeof Button> & {
	name: string;
}) {
	const ref = useRef<HTMLLabelElement>(null);

	return (
		<>
			<form className="hidden">
				<input type="file" name={name} id={name} className="hidden" />
				<label ref={ref} htmlFor={name}></label>
			</form>
			<Button
				{...props}
				onClick={() => {
					if (ref.current) ref.current.click();
				}}
			>
				{children}
			</Button>
		</>
	);
}

function DisableTwoFactorAuthentication({ user }: { user: User }) {
	const { isOpen, onOpenChange, onClose, onOpen } = useDisclosure();

	return (
		<ModalSet
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			onClose={onClose}
			size="2xl"
			footer={
				<div className="flex w-full justify-end">
					<Button variant="danger">Confirm</Button>
				</div>
			}
			trigger={
				<Button onClick={onOpen} variant="danger">
					Disable two-factor authentication
				</Button>
			}
			title="Are you sure you want to disable two-factor
					authentication?"
		>
			<div className="p-4">
				Two-factor authentication adds an additional layer of security
				to your account by requiring more than just a password to sign
				in. We highly recommend that you keep two-factor authentication
				enabled on your account. If you need to change your
				configuration, or generate new recovery codes, you can do that
				in the settings below.
			</div>
		</ModalSet>
	);
}

function EnableTwoFactorAuthentication({ user }: { user: User }) {
	const { isOpen, onOpenChange, onClose, onOpen } = useDisclosure();

	return (
		<ModalSet
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			onClose={onClose}
			size="4xl"
			footer={
				<div className="flex w-full justify-end">
					<Button variant="danger">Confirm</Button>
				</div>
			}
			trigger={
				<Button onClick={onOpen} variant="secondary">
					Enable two-factor authentication
				</Button>
			}
			title="Enable two-factor authentication (2FA)"
		>
			<div className="flex flex-col gap-2 p-4">
				<div className="text-xl font-medium text-white">
					Setup authenticator app
				</div>
				<div>
					Authenticator apps and browser extensions like 1Password,
					Authy, Microsoft Authenticator, etc. generate one-time
					passwords that are used as a second factor to verify your
					identity when prompted during sign-in.
				</div>
				<div className="mt-4 text-white">Scan the QR code</div>
				<div>
					Use an authenticator app or browser extension to scan.
				</div>
				<div className="mt-4 aspect-square w-1/4 rounded-xl bg-white p-4">
					<img src="qr.svg" className="h-full w-full object-cover" />
				</div>
				<div className="mt-4 text-white">Verify code from the app</div>
				<Input
					placeholder="Enter code"
					classNames={{
						container: "p-4",
					}}
				/>
			</div>
		</ModalSet>
	);
}

function TwoFactorAuthenticationToggle({ user }: { user: User }) {
	return (
		<>
			{user.two_factor == false ? (
				<EnableTwoFactorAuthentication user={user} />
			) : (
				<DisableTwoFactorAuthentication user={user} />
			)}
		</>
	);
}

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

	const session = user1;

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
				<div className="grid grid-cols-2 gap-8 p-4">
					<div className="flex w-full flex-col items-start gap-6">
						<SettingSection title="Username">
							<Input
								defaultValue={session.username}
								classNames={{ container: "p-4 h-auto" }}
								placeholder="Username"
							/>
						</SettingSection>
						<Divider />
						<SettingSection title="Country">
							<Input
								startContent={
									<span className="font-flag">
										{getFlag(session.country)}
									</span>
								}
								defaultValue={session.country}
								classNames={{ container: "p-4 h-auto" }}
								placeholder="Country"
								disabled
							/>
						</SettingSection>
						<Divider />
						<SettingSection title="Avatar">
							<div className="flex gap-2">
								<UploadButton name="avatar" variant="secondary">
									Upload Avatar
								</UploadButton>
								<Button variant="transparent">
									Delete Avatar
								</Button>
							</div>
						</SettingSection>
						<Divider />
						<SettingSection title="Banner">
							<div className="flex gap-2">
								<UploadButton name="banner" variant="secondary">
									Upload Banner
								</UploadButton>
								<Button variant="transparent">
									Delete Banner
								</Button>
							</div>
						</SettingSection>
					</div>
					<div className="flex items-center justify-center rounded-xl bg-black text-white ">
						<UserHover user={session} />
					</div>
				</div>
				<div className="flex flex-col gap-8 p-4">
					<Divider />
					<SettingSection title="Two-factor authentication">
						<div className="my-12 flex flex-col items-center justify-center gap-4">
							{session.two_factor == false ? <Unlock /> : <Lock />}
							<div className="text-xl font-medium text-white text-center">
								{session.two_factor == false
									? "Two-factor authentication is not enabled"
									: "Two-factor authentication is enabled"}
							</div>
							<div className="w-3/4 text-center">
								Two-factor authentication adds an additional
								layer of security to your account by requiring
								more than just a password to sign in.
							</div>
							<TwoFactorAuthenticationToggle user={session} />
							<Link
								className="text-sm text-[rgb(80,153,255)]"
								href="https://datatracker.ietf.org/doc/html/rfc6238"
							>
								Learn more
							</Link>
						</div>
					</SettingSection>
				</div>
			</Card>
		</main>
	);
}
