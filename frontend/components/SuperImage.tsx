"use client";

import PublicContext from "@/contexts/PublicContext";
import Image from "next/image";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

export default function SuperImage({
	src,
	className,
	width,
	height,
	alt,
	...props
}: {
	src: string;
	width: number;
	height: number;
	alt: string;
	[key: string]: any;
}) {
	const { loadedImages, setLoadedImages } = useContext(PublicContext) as any;
	const [overlayHidden, setOverlayHidden] = useState(false);
	const imgRef = useRef<HTMLImageElement>(null);
	const loaded = loadedImages.includes(src);

	const updateLoadedImages = useCallback(() => {
		if (!loadedImages.includes(src))
			setLoadedImages((prev: string[]) =>
				[...prev, src].filter((v, i, a) => a.indexOf(v) === i),
			);
	}, [loadedImages, setLoadedImages, src]);

	useEffect(() => {
		if (imgRef.current && imgRef.current.complete) updateLoadedImages();
	}, [src, updateLoadedImages]);

	useEffect(() => {
		if (loaded) {
			const timeout = setTimeout(() => {
				setOverlayHidden(true);
			}, 500);
			return () => clearTimeout(timeout);
		}
	}, [loaded]);

	return (
		<>
			<Image
				ref={imgRef}
				src={src}
				alt={alt}
				width={width}
				height={height}
				className={twMerge(
					className,
					!className?.includes("absolute") && `relative`,
					"bg-card-200",
				)}
				onLoad={updateLoadedImages}
				{...props}
			/>
			{!overlayHidden && (
				<div
					className={twMerge(
						"absolute inset-0 bg-card-200 opacity-100 transition-opacity duration-500",
						className,
						loaded && "opacity-0",
					)}
				></div>
			)}
		</>
	);
}
