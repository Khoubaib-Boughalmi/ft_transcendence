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
				<div className="z-10 flex flex-col items-center justify-center gap-12 select-none">
					<div className="text-[10vw] leading-[7.5vw] ">Something</div>
					<div className="text-[1vw] font-light text-foreground-600">
						something something something something something
					</div>
					<Button
						className="text-lg px-96"
						startContent={
							<img className="h-7 w-7" src="/42_Logo.svg" />
						}
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
