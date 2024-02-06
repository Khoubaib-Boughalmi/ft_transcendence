import { memo } from "react";
import { Message } from "@/types/chat";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeVideo from "rehype-video";
import SuperImage from "./SuperImage";

const NoExceptURL = (url: string) => {
	try {
		return new URL(url);
	} catch {
		return null;
	}
}

function GayMarkdown({ message }: { message: Message }) {
	return (
		<Markdown
			key={message.id}
			children={message.content}
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
					if (!urlObj)
						return <a {...otherprops} />;

					// if it's a youtube link then render the video using an iframe embed
					let videoId: string | null = null;
					if (url?.startsWith("https://www.youtube.com/watch?v=")) {
						videoId = urlObj.searchParams.get("v");
					} else if (url?.startsWith("https://youtu.be/")) {
						videoId = url
							.split("https://youtu.be/")[1]
							.split("?")[0];
					} else if (
						url?.startsWith("https://www.youtube.com/embed/")
					) {
						videoId = url
							.split("https://www.youtube.com/embed/")[1]
							.split("?")[0];
					}

					if (videoId) {
						return (
							<iframe
								key={videoId}
								width="1280"
								height="720"
								src={`https://www.youtube.com/embed/${videoId}`}
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
								allowFullScreen={true}
							/>
						);
					}

					// if it's an image link then render the image
					if (url?.match(/\.(jpeg|jpg|gif|png)$/) || url?.includes("pregonanto.s3")) {
						return (
							<SuperImage
								alt="Embedded Image"
								width={256}
								height={256}
								src={url}
								className="h-full w-full object-cover"
							/>
						);
					}
					
					// for other links render a normal hyperlink
					return <a className="text-blue-500 hover:underline" {...props} />;
				},
			}}
			remarkPlugins={[remarkGfm, remarkBreaks]}
			rehypePlugins={[rehypeVideo]}
		/>
	);
}

export default memo(GayMarkdown);
