"use client";

import { twMerge } from "tailwind-merge";
import { SuperSkeleton } from "./SuperSkeleton";
import { useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import PublicContext from "@/contexts/PublicContext";

export default function SuperImage({ src, className, width, height, alt, ...props }: {
	src: string;
	width: number;
	height: number;
	alt: string;
	[key: string]: any;
}) {
	const { loadedImages, setLoadedImages } = useContext(PublicContext) as any;
	const imgRef = useRef<HTMLImageElement>(null);

	const updateLoadedImages = () => {
		if (!loadedImages.includes(src))
		setLoadedImages((prev: string[]) => [...prev, src].filter((v, i, a) => a.indexOf(v) === i));
	};

	useEffect(() => {
		if (imgRef.current && imgRef.current.complete) updateLoadedImages();	
	}, [src]);

	const loaded = loadedImages.includes(src);

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
					"bg-card-200"
				)}
				onLoad={updateLoadedImages}
				{...props}
			/>
			<div
				className={twMerge(
					"absolute inset-0 bg-card-200 opacity-100 transition-opacity duration-500",
					className,
					loaded && "opacity-0",
				)}
			></div>
		</>
	);
}
