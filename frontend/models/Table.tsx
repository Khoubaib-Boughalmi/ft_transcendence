"use client";
import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { a } from "@react-spring/three";
import scene from "../assets/3d/group2.glb";
// import { useFrame, useThree } from "@react-three/fiber";
// import { usePlane } from "@react-three/cannon";

// import { Group, Mesh } from "three";
import tableScene from "../assets/3d/table_tennis_table.glb";

export function Table(props) {
	const { nodes, materials } = useGLTF(tableScene);
	return (
		<group {...props} dispose={null}>
			<group position={[0, 1.444, 0]}>
				<mesh
					castShadow
					receiveShadow
					geometry={nodes.Object_4.geometry}
					material={materials.Material}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={nodes.Object_5.geometry}
					material={materials["Material.001"]}
				/>
			</group>
			<mesh
				castShadow
				receiveShadow
				geometry={nodes.Object_7.geometry}
				material={materials["Material.002"]}
			/>
			<mesh
				castShadow
				receiveShadow
				geometry={nodes.Object_8.geometry}
				material={materials["Material.004"]}
			/>
			<mesh
				castShadow
				receiveShadow
				geometry={nodes.Object_10.geometry}
				material={materials["Material.002"]}
			/>
			<mesh
				castShadow
				receiveShadow
				geometry={nodes.Object_12.geometry}
				material={materials["Material.001"]}
			/>
			<mesh
				castShadow
				receiveShadow
				geometry={nodes.Object_14.geometry}
				material={materials["Material.003"]}
			/>
			<mesh
				castShadow
				receiveShadow
				geometry={nodes.Object_15.geometry}
				material={materials["Material.001"]}
			/>
			<mesh
				castShadow
				receiveShadow
				geometry={nodes.Object_17.geometry}
				material={materials["Material.002"]}
			/>
		</group>
	);
}

export default Table;
