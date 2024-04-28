import { PlaneProps, usePlane } from "@react-three/cannon";
import React from "react";
import { Mesh } from "three";

export function PlaneTable(props: PlaneProps) {
	const [ref, api] = usePlane<Mesh>(() => ({
		name: "ground",
		...props,
	}));

	return (
		<mesh receiveShadow ref={ref} name="ground">
		</mesh>
	);
}

export default PlaneTable;
