"use client";
import { Button } from "@/components/Button";
import Card from "@/components/Card";
import DeleteButton from "@/components/DeleteButton";
import Divider from "@/components/Divider";
import Input from "@/components/Input";
import MemberControls from "@/components/MemberControls";
import ModalSet from "@/components/ModalSet";
import SettingSection from "@/components/SettingSection";
import SuperImage from "@/components/SuperImage";
import UploadButton from "@/components/UploadButton";
import UserHover from "@/components/UserHover";
import PublicContext from "@/contexts/PublicContext";
import {
	fetcher,
	getFlag,
	makeForm,
	AbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing,
} from "@/lib/utils";
import { User } from "@/types/profile";
import { useDisclosure } from "@nextui-org/react";
import { HeartHandshakeIcon, Lock, Unlock } from "lucide-react";
import Link from "next/link";
import { useContext, useEffect, useRef, useState } from "react";
import useSWR from "swr";

function DisableTwoFactorAuthentication({ user }: { user: User }) {
	const { isOpen, onOpenChange, onClose, onOpen } = useDisclosure();
	const [loading, setLoading] = useState(false);
	const { session, sessionMutate } = useContext(PublicContext) as any;

	const handleDisable = async () => {
		AbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
			`/auth/2fa/disable`,
			null,
			setLoading,
			`Successfully disabled two-factor authentication (rip bozo)`,
			`Failed to disable two-factor authentication`,
			sessionMutate,
		);
	};

	return (
		<ModalSet
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			onClose={onClose}
			size="2xl"
			footer={
				<div className="flex w-full justify-end">
					<Button
						onClick={handleDisable}
						loading={loading}
						variant="danger"
					>
						Confirm
					</Button>
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

function TwoFactorAuthenticationSetup({
	user,
	disabled,
}: {
	user: User;
	disabled: boolean;
}) {
	const { data, isLoading } = useSWR("/auth/2fa/generate", fetcher) as any;

	return (
		<>
			<div className="text-xl font-medium text-white">
				Setup authenticator app
			</div>
			<div>
				Authenticator apps and browser extensions like 1Password, Authy,
				Microsoft Authenticator, etc. generate one-time passwords that
				are used as a second factor to verify your identity when
				prompted during sign-in.
			</div>
			<div className="mt-4 text-white">Scan the QR code</div>
			<div>Use an authenticator app or browser extension to scan.</div>
			<div className="relative mt-4 aspect-square w-1/4 overflow-hidden rounded-xl bg-white">
				{data && (
					<SuperImage
						alt="QR code"
						width={256}
						height={256}
						src={data}
						className="h-full w-full object-cover"
					/>
				)}
			</div>
			<div className="mt-4 text-white">Verify code from the app</div>
			<Input
				disabled={disabled}
				name="otp"
				placeholder="Enter code"
				classNames={{
					container: "p-4",
				}}
			/>
		</>
	);
}

function EnableTwoFactorAuthentication({ user }: { user: User }) {
	const { session, sessionMutate } = useContext(PublicContext) as any;
	const { isOpen, onOpenChange, onClose, onOpen } = useDisclosure();
	const [loading, setLoading] = useState(false);
	const submitRef = useRef<HTMLButtonElement>(null);

	const submitOTP = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const otp = formData.get("otp");
		if (otp) {
			AbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
				`/auth/2fa/enable`,
				makeForm({ otp }),
				setLoading,
				`Successfully enabled two-factor authentication`,
				`Invalid code`,
				sessionMutate,
			);
		}
	};

	return (
		<ModalSet
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			onClose={onClose}
			size="4xl"
			footer={
				<div className="flex w-full justify-end">
					<Button
						onClick={() => submitRef?.current?.click()}
						loading={loading}
						variant="danger"
					>
						Confirm
					</Button>
				</div>
			}
			trigger={
				<Button onClick={onOpen} variant="secondary">
					Enable two-factor authentication
				</Button>
			}
			title="Enable two-factor authentication (2FA)"
		>
			<form
				autoComplete="off"
				onSubmit={submitOTP}
				className="flex flex-col gap-2 p-4"
			>
				<TwoFactorAuthenticationSetup user={user} disabled={loading} />
				<button
					ref={submitRef}
					type="submit"
					id="submit-otp"
					className="hidden"
				></button>
			</form>
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

function UnlockUser({ user }: { user: User }) {
	const [loading, setLoading] = useState(false);
	const { sessionMutate } = useContext(PublicContext) as any;

	const handlerevokeadmin = (user: User) => {
		AbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
			"/user/unblockUser",
			makeForm({
				id: user.id,
			}),
			setLoading,
			`Successfully unblocked ${user.username}`,
			`Failed to unblock ${user.username}`,
			sessionMutate,
		);
	};

	return (
		<div className="flex items-center justify-center">
			<Button
				onClick={() => handlerevokeadmin(user)}
				className="pl-3"
				startContent={<HeartHandshakeIcon/>}
				variant="danger"
				loading={loading}
			>
				Unblock
			</Button>
		</div>
	);
}

export default function Settings() {
	const { session, sessionMutate } = useContext(PublicContext) as {
		session: User;
		sessionMutate: any;
	};
	const [username, setUsername] = useState(session.username);
	const [loading, setLoading] = useState(false);
	
	useEffect(() => {
		document.title = `Settings`
	}, []);


	const handleSave = async () => {
		AbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
			`/user/settings/update`,
			makeForm({
				username,
			}),
			setLoading,
			`Successfully updated settings`,
			`Failed to update settings`,
			sessionMutate,
		);
	};

	return (
		<main className="mb-12 flex w-[1000px] max-w-full flex-col justify-center gap-4">
			<Card
				header={<div className="text-xl">Settings</div>}
				classNames={{
					innerContainer: "p-0",
				}}
				footer={
					<div className="flex w-full justify-end">
						<Button
							loading={loading}
							onClick={handleSave}
							disabled={username == session.username}
						>
							Save Changes
						</Button>
					</div>
				}
			>
				<div className="grid grid-cols-2 gap-8 p-6">
					<div className="flex w-full flex-col items-start gap-6">
						<SettingSection title="Username">
							<Input
								autoComplete="off"
								name="username"
								placeholder={session.username}
								onChange={(e) => setUsername(e.target.value)}
								classNames={{ container: "p-4 h-auto" }}
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
								<UploadButton
									endpoint="/user/settings/upload-avatar"
									name="avatar"
									variant="secondary"
								>
									Upload Avatar
								</UploadButton>
								<DeleteButton
									endpoint="/user/settings/delete-avatar"
									type="avatar"
								>
									{/* Delete Avatar */}
								</DeleteButton>
							</div>
						</SettingSection>
						<Divider />
						<SettingSection title="Banner">
							<div className="flex gap-2">
								<UploadButton
									endpoint="/user/settings/upload-banner"
									name="banner"
									variant="secondary"
								>
									Upload Banner
								</UploadButton>
								<DeleteButton
									endpoint="/user/settings/delete-banner"
									type="banner"
								>
									{/* Delete Banner */}
								</DeleteButton>
							</div>
						</SettingSection>
					</div>
					<div className="flex items-center justify-center rounded-xl bg-black text-white ">
						<div className="rounded-2xl bg-card-200 p-2">
							<UserHover user={session} />
						</div>
					</div>
				</div>

				<div className="flex flex-col gap-8 p-6">
					<Divider />
					<SettingSection title="Two-factor authentication">
						<div className="my-12 flex flex-col items-center justify-center gap-4">
							{session.two_factor == false ? (
								<Unlock />
							) : (
								<Lock />
							)}
							<div className="text-center text-xl font-medium text-white">
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
				<Divider />
				<div className="bg-card-200 p-6 py-8 pb-10">
					<SettingSection title="Blocks">
						<div className="flex w-full flex-col gap-4 ">
							<div className="flex items-end justify-between text-lg leading-[1.125rem] text-foreground-800">
								Blocked Users
							</div>
							<MemberControls list={session.blocked_users} controls={UnlockUser} />
						</div>
					</SettingSection>
				</div>
			</Card>
		</main>
	);
}
