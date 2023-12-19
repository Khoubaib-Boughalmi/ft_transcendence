"use client";

import { twMerge } from "tailwind-merge";
import { SuperSkeleton } from "./SuperSkeleton";
import { useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import PublicContext from "@/contexts/PublicContext";

export default function SuperImage({ src, className, ...props }: any) {
	const { loadedImages } = useContext(PublicContext) as any;
	const [_, setLoadedImagesState] = useState([...loadedImages]) as any;
	const imgRef = useRef<HTMLImageElement>(null);

	const updateLoadedImages = () => {
		loadedImages.add(src);
		setLoadedImagesState((prevImages: any) => [...prevImages, src]);
	};

	useEffect(() => {
		if (imgRef.current && imgRef.current.complete) updateLoadedImages();	
	}, [src]);

	const loaded = loadedImages.has(src);

	console.log(loadedImages);

	return (
		<>
			<img
				ref={imgRef}
				src={src}
				className={twMerge(
					className,
					!className.includes("absolute") && `relative`,
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
