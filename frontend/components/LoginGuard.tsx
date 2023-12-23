"use client";
import PublicContext from "@/contexts/PublicContext";
import { useContext } from "react";
import { Button } from "./Button";
import { Spinner } from "@nextui-org/react";

export default function ({ children }: any) {
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
				<div className="z-10 flex flex-col items-center justify-center gap-14 select-none text-[0.75em]">
					<div className="text-[15em] bg-gradient-to-t from-primary to-secondary-800 bg-clip-text text-transparent">
						long enough
					</div>
					<div className="text-[1.25em] font-light text-foreground-600 -mt-12">
						An interactive gaming platform for the 1337 community. All rights reserved 2023 ©.
					</div>
					<Button
						className="text-lg px-96"
						startContent={<img className="h-7 w-7" src="/42_Logo.svg" />}
						as="a"
						href={`http://localhost:3000/api/auth/intra/login`}
					>
						تسجيل الدخول
					</Button>
				</div>
			)}
		</>
	);
}
