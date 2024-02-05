import { memo } from "react";
import { Message } from "@/types/chat";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeVideo from "rehype-video";

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
					const url = props.href;
					let videoId: string | null = null;

					if (url?.startsWith("https://www.youtube.com/watch?v=")) {
						videoId = new URL(url).searchParams.get("v");
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
					return <a {...props} />;
				},
			}}
			urlTransform={(url, key, node) => {
				node.properties.style =
					"color: rgb(47, 129, 247); padding-top: 25px; padding-bottom: 25px;";
				node.properties.class += " hover:underline";
				return url;
			}}
			remarkPlugins={[remarkGfm, remarkBreaks]}
			rehypePlugins={[rehypeVideo]}
		/>
	);
}

export default memo(GayMarkdown);
