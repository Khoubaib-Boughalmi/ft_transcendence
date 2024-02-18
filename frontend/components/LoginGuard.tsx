"use client";
import PublicContext from "@/contexts/PublicContext";
import { Spinner } from "@nextui-org/react";
import { useContext } from "react";
import { Button } from "./Button";

export default function LoginGuard({ children }: any) {
	const { verified, verifiedLoading, sessionLoading } = useContext(
		PublicContext,
	) as any;

	if (verifiedLoading)
		return (
			<div className="z-10 flex items-center justify-center">
				<Spinner size="lg" />
			</div>
		);

	return (
		<>
			{verified ? (
				<>{children}</>
			) : (
				<div className="z-10 flex select-none flex-col items-center justify-center gap-14 text-[0.75em]">
					<div className="bg-gradient-to-t from-primary to-secondary-800 bg-clip-text text-[15em] text-transparent">
						long enough
					</div>
					<div className="-mt-12 text-[1.25em] font-light text-foreground-600">
						An interactive gaming platform for the 1337 community.
						All rights reserved 2023 ©.
					</div>
					<Button
						className="px-96 text-lg"
						startContent={
							<img className="h-7 w-7" src="/42_Logo.svg" />
						}
						as="a"
						href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/intra/login`}
					>
						تسجيل الدخول
					</Button>
				</div>
			)}
		</>
	);
}
