import { memo, useEffect, useState } from "react";
import { Message } from "@/types/chat";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import SuperImage from "./SuperImage";
import { Tweet } from "react-tweet";
import Youtube from "react-youtube";
import { ClipboardCheck, Copy } from "lucide-react";
import toast from "react-hot-toast";

const NoExceptURL = (url: string) => {
	try {
		return new URL(url);
	} catch {
		return null;
	}
};

const getVideoId = (url: URL): string | null => {
	if (url.hostname === "www.youtube.com" && url.searchParams.has("v")) {
		return url.searchParams.get("v");
	}
	if (
		url.hostname === "www.youtube.com" &&
		url.pathname.startsWith("/embed/")
	) {
		return url.pathname.split("/").pop() || null;
	}
	if (url.hostname === "youtu.be" && url.pathname.length > 1) {
		return url.pathname.split("/").pop() || null;
	}
	return null;
};

function GayMarkdown({ message }: { message: Message }) {
	const [copySuccess, setCopySuccess] = useState(false);

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
			children={message.content}
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

					// if it's a youtube link then render the video using an iframe embed
					const videoId: string | null = getVideoId(urlObj);
					if (videoId) {
						return (
							//<iframe
							//	key={videoId}
							//	width="1280"
							//	height="720"
							//	src={`https://www.youtube.com/embed/${videoId}`}
							//	allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
							//	allowFullScreen={true}
							///>
							<Youtube videoId={videoId} />
						);
					}

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
							<div className="relative mt-2">
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

					// for other links render a normal hyperlink
					return (
						<a
							className="text-blue-500 hover:underline"
							{...props}
						/>
					);
				},
			}}
		/>
	);
}

export default memo(GayMarkdown);
