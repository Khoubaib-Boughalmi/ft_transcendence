"use client";
import { Button } from "@/components/Button";
import { X } from "lucide-react";
import { ComponentProps, ReactNode } from "react";
import { Modal, ModalContent } from "@nextui-org/react";
import Card from "@/components/Card";

export default function ModalSet({
	children,
	trigger,
	title,
	isOpen,
	onOpenChange,
	onClose,
	size,
	footer,
	...modalProps
}: ComponentProps<typeof Modal> & {
	children: ReactNode;
	trigger: ReactNode;
	title?: ReactNode;
	footer?: ReactNode;
}) {
	return (
		<>
			<Modal
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				hideCloseButton
				size={size ?? "4xl"}
				{...modalProps}
			>
				<ModalContent className="bg-transparent shadow-none select-none">
					<Card
						header={
							<div className="flex w-full items-center justify-between">
								{title}
								<div className="ml-auto">
									<Button
										iconOnly
										startContent={<X size={12} />}
										variant="danger"
										onClick={onClose}
										className="p-1.5"
									></Button>
								</div>
							</div>
						}
						footer={footer}
						fullWidth
					>
						{children}
					</Card>
				</ModalContent>
			</Modal>
			{trigger}
		</>
	);
}
