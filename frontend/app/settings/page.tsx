"use client";
import Card from "@/components/Card";
import Divider from "@/components/Divider";
import Input from "@/components/Input";
import UserHover from "@/components/UserHover";
import { Spinner, useDisclosure } from "@nextui-org/react";
import { User } from "@/types/profile";
import {
	fetcher,
	getFlag,
	makeForm,
	useAbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing,
} from "@/lib/utils";
import { Button } from "@/components/Button";
import Link from "next/link";
import { user1 } from "@/mocks/profile";
import ModalSet from "@/components/ModalSet";
import { useContext, useEffect, useRef, useState } from "react";
import { Lock, Trash, Trash2, Unlock } from "lucide-react";
import SuperImage from "@/components/SuperImage";
import axios from "@/lib/axios";
import PublicContext from "@/contexts/PublicContext";
import useSWR, { useSWRConfig } from "swr";
import toast from "react-hot-toast";

function UploadButton({
	children,
	name,
	...props
}: React.ComponentProps<typeof Button> & {
	name: string;
}) {
	const ref = useRef<HTMLLabelElement>(null);
	const formRef = useRef<HTMLFormElement>(null);
	const [loading, setLoading] = useState(false);
	const { sessionMutate } = useContext(PublicContext) as any;

	const handleUpload = async (e: React.ChangeEvent<HTMLFormElement>) => {
		const formData = new FormData(e.currentTarget);
		const file = formData.get(name);
		if (file)
			useAbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
				`/user/settings/upload-${name}`,
				formData,
				setLoading,
				`Successfully changed ${name}`,
				`Failed to change ${name}`,
				sessionMutate,
			);
		formRef.current?.reset();
	};

	return (
		<>
			<form ref={formRef} onChange={handleUpload} className="hidden">
				<input type="file" name={name} id={name} className="hidden" />
				<label ref={ref} htmlFor={name}></label>
			</form>
			<Button
				{...props}
				loading={loading}
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
	const [loading, setLoading] = useState(false);
	const { session, sessionMutate } = useContext(PublicContext) as any;

	const handleDisable = async () => {
		useAbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
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
			useAbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
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

function DeleteButton({
	type,
	children,
}: {
	type: "avatar" | "banner";
	children?: React.ReactNode;
}) {
	const [loading, setLoading] = useState(false);
	const { sessionMutate } = useContext(PublicContext) as any;

	const handleImageDelete = async () => {
		useAbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
			`/user/settings/delete-${type}`,
			null,
			setLoading,
			`Successfully deleted ${type}`,
			`Failed to delete ${type}`,
			sessionMutate,
		);
	};

	return (
		<Button
			loading={loading}
			onClick={handleImageDelete}
			variant="transparent"
			iconOnly
		>
			<Trash2 />
			{children}
		</Button>
	);
}

function SettingSection({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex w-full flex-col gap-2">
			<div className="text-sm">{title}</div>
			{children}
		</div>
	);
}

export default function Settings() {
	const { session, sessionMutate } = useContext(PublicContext) as any;
	const [username, setUsername] = useState(session.username);
	const [loading, setLoading] = useState(false);

	const handleSave = async () => {
		useAbstractedAttemptedExclusivelyPostRequestToTheNestBackendWhichToastsOnErrorThatIsInTheArgumentsAndReturnsNothing(
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
				<div className="grid grid-cols-2 gap-8 p-4">
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
								<UploadButton name="avatar" variant="secondary">
									Upload Avatar
								</UploadButton>
								<DeleteButton type="avatar">
									{/* Delete Avatar */}
								</DeleteButton>
							</div>
						</SettingSection>
						<Divider />
						<SettingSection title="Banner">
							<div className="flex gap-2">
								<UploadButton name="banner" variant="secondary">
									Upload Banner
								</UploadButton>
								<DeleteButton type="banner">
									{/* Delete Banner */}
								</DeleteButton>
							</div>
						</SettingSection>
					</div>
					<div className="flex items-center justify-center rounded-xl bg-black text-white ">
						<div className="p-2 rounded-2xl bg-card-200">

						<UserHover user={session} />
						</div>
					</div>
				</div>
				<div className="flex flex-col gap-8 p-4">
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
			</Card>
		</main>
	);
}
