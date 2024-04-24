"use client";
import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { a } from "@react-spring/three";
import * as THREE from "three";
// import scene from "../assets/3d/group2.glb";
// import { useFrame, useThree } from "@react-three/fiber";
// import { usePlane } from "@react-three/cannon";

// import { Group, Mesh } from "three";
// import tableScene from "../assets/3d/table_tennis_table.glb";

export function Table(props) {
	const { nodes, materials } = useGLTF("/3d/table_tennis_table.glb");
	return (
		<group {...props} dispose={null}>
			<group position={[0, 1.444, 0]}>
				<mesh
					castShadow
					receiveShadow
					geometry={(nodes.Object_4 as THREE.Mesh).geometry}
					material={materials.Material}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={(nodes.Object_5 as THREE.Mesh).geometry}
					material={materials["Material.001"]}
				/>
			</group>
			<mesh
				castShadow
				receiveShadow
				geometry={(nodes.Object_7 as THREE.Mesh).geometry}
				material={materials["Material.002"]}
			/>
			<mesh
				castShadow
				receiveShadow
				geometry={(nodes.Object_8 as THREE.Mesh).geometry}
				material={materials["Material.004"]}
			/>
			<mesh
				castShadow
				receiveShadow
				geometry={(nodes.Object_10 as THREE.Mesh).geometry}
				material={materials["Material.002"]}
			/>
			<mesh
				castShadow
				receiveShadow
				geometry={(nodes.Object_12 as THREE.Mesh).geometry}
				material={materials["Material.001"]}
			/>
			<mesh
				castShadow
				receiveShadow
				geometry={(nodes.Object_14 as THREE.Mesh).geometry}
				material={materials["Material.003"]}
			/>
			<mesh
				castShadow
				receiveShadow
				geometry={(nodes.Object_15 as THREE.Mesh).geometry}
				material={materials["Material.001"]}
			/>
			<mesh
				castShadow
				receiveShadow
				geometry={(nodes.Object_17 as THREE.Mesh).geometry}
				material={materials["Material.002"]}
			/>
		</group>
	);
}

export default Table;
