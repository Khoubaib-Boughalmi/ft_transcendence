import { Message } from "@/types/chat";
import { Check, ClipboardCheck, Copy, Divide, X } from "lucide-react";
import { memo, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";
import { Tweet } from "react-tweet";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import SuperImage from "./SuperImage";
import { Button } from "./Button";
import PublicContext from "@/contexts/PublicContext";
import { twMerge } from "tailwind-merge";
import Card from "./Card";
import Divider from "./Divider";
import Link from "next/link";

const NoExceptURL = (url: string) => {
	try {
		return new URL(url);
	} catch {
		return null;
	}
};

function GayMarkdown({ message }: { message: Message }) {
	const [copySuccess, setCopySuccess] = useState(false);
	const { session } = useContext(PublicContext) as any;

	const copyImageUrl = (imageUrl: string) => {
		navigator.clipboard
			.writeText(imageUrl)
			.then(() => setCopySuccess(true))
			.catch((err) => toast.error("Failed to copy image URL"));
	};

	useEffect(() => {
		if (copySuccess) {
			const id = setTimeout(() => {
				setCopySuccess(false);
			}, 1000);
			return () => clearTimeout(id);
		}
	}, [copySuccess]);

	return (
		<Markdown
			key={message.id}
			disallowedElements={["p"]}
			unwrapDisallowed
			remarkPlugins={[remarkGfm, remarkBreaks]}
			components={{
				code(props) {
					const { children, className, node, ...rest } = props;
					return (
						<code {...rest} className={className}>
							{children}
						</code>
					);
				},
				a: (props) => {
					const { href: url, ...otherprops } = props;
					const urlObj = NoExceptURL(url!);

					// if the url is not valid then render a normal text link
					if (!urlObj) return <a {...otherprops} />;

					// if it's a link to an mp4 or mov file then render the video
					if (url?.match(/\.(mp4|mov)$/)) {
						return (
							<video
								width={640}
								height={360}
								controls
								src={url}
								className="mt-2"
							/>
						);
					}

					// if it's an image link then render the image
					if (
						url?.match(/\.(jpeg|jpg|gif|png)$/) ||
						url?.includes("pregonanto.s3")
					) {
						return (
							<div className="relative mt-2 max-w-[38.2%]">
								<SuperImage
									alt="Embedded Image"
									width={256}
									height={256}
									src={url}
									className="h-full w-full object-cover"
								/>
								<button
									onClick={() => copyImageUrl(url)}
									className="absolute right-0 top-0 m-1 rounded-md bg-gray-800 bg-opacity-50 p-1 text-white"
								>
									{copySuccess ? (
										<ClipboardCheck />
									) : (
										<Copy />
									)}
								</button>
							</div>
						);
					}

					// if it's a twitter link then render the tweet
					if (url?.startsWith("https://twitter.com")) {
						const tweetId = url.split("/status/")[1];
						return <Tweet id={tweetId} />;
					}

					// Display Game invite embed
					if (url?.startsWith(process.env.NEXT_PUBLIC_FRONTEND_URL + "/game")) {
						return (
							<div className="my-2 flex">
								<Card
									className="overflow-hidden bg-card-200 p-0 shadow-md shadow-card-100/75"
									classNames={{
										innerContainer: "p-0 flex",
									}}
								>
									<div className="aspect-square h-full">
										<SuperImage
											src={message.user.avatar}
											alt={message.user.username}
											width={256 / 2}
											height={256 / 2}
											className="h-full w-full object-cover"
										/>
									</div>
									<div className="relative flex h-full w-64 flex-col justify-between text-sm text-foreground-700 ">
										<div className="absolute bottom-0 left-0 top-0 z-10 aspect-square h-full -translate-x-full bg-gradient-to-l from-card-200"></div>
										<div className="w-full bg-gradient-to-l from-card-300 px-4 py-2 text-end text-xs font-bold leading-3 text-foreground-500">
											MATCH INVITE
										</div>
										<div className="flex w-full flex-1 flex-col items-center justify-center gap-2 px-4">
											{message.user.id != session?.id ? (
												<>
													You are courting death!
													<Divider />
													<div className="flex w-full justify-center gap-2">
														<Link href={url}>
															<Button
																variant="secondary"
																startContent={
																	<Check
																		size={
																			16
																		}
																	/>
																}
																className="h-8 text-sm"
															>
																Accept
															</Button>
														</Link>
														<Button
															iconOnly
															variant="danger"
															className="aspect-square h-8 w-8 shrink-0"
															startContent={
																<X
																	className="aspect-square"
																	size={16}
																/>
															}
														></Button>
													</div>
												</>
											) : (
												<>Mankind is in danger!</>
											)}
										</div>
									</div>
								</Card>
							</div>
							// <div className="h-24 bg-card-200 rounded-lg my-2 p-4 flex items-center justify-start gap-4 w-fit">
							// 	<div className="h-full aspect-square relative">
							// 		<SuperImage
							// 			className="absolute inset-0 w-full h-full rounded-full object-cover"
							// 			src={message.user.avatar}
							// 			alt={message.user.username}
							// 			width={32}
							// 			height={32}
							// 		/>
							// 	</div>
							// 	<div>
							// 		<p className="font-semibold">{message.user.username}</p>
							// 		{message.user.id != session?.id && <p className="text-foreground-800">{"Challenges you to a match!"}</p>}
							// 		{message.user.id === session?.id && <p className="text-foreground-800">{"You've sent a challenge!"}</p>}
							// 	</div>
							// 	{message.user.id != session?.id && <div className="ml-auto space-y-2">
							// 		<Button
							// 			variant="secondary"
							// 			className="px-4 py-2 rounded-lg"
							// 			href={url}
							// 			as="a"
							// 		>
							// 			Accept
							// 		</Button>
							// 	</div>
							// 	}
							// </div>
						);
					}

					// for other links render a normal hyperlink
					return (
						<a
							className="text-blue-500 hover:underline"
							{...props}
						/>
					);
				},
			}}
		>
			{message.content}
		</Markdown>
	);
}

export default memo(GayMarkdown);
