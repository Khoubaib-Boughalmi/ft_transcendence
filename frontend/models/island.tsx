"use client";
import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { Mesh } from "three";
import { a } from "@react-spring/three";
import scene from "../assets/3d/group2.glb";
// import { useFrame, useThree } from "@react-three/fiber";
import { usePlane } from "@react-three/cannon";

// import { Group, Mesh } from "three";

export function Island(props) {
	const { nodes, materials } = useGLTF(scene);
	const [ref] = usePlane<Mesh>(() => ({
		material: "ground",
		type: "Static",
	}));
	return (
		<mesh>
			<group {...props} dispose={null}>
				<group
					position={[0, 0, -1.82]}
					rotation={[-Math.PI / 2, 0, 0]}
					scale={1.078}
				>
					<mesh
						castShadow
						receiveShadow
						geometry={nodes.Gound_0.geometry}
						material={materials.Ground}
						position={[0, -1.652, -0.005]}
					/>
				</group>
				<group position={[0, 1.444, 0]}>
					<mesh
						ref={ref}
						castShadow
						receiveShadow
						geometry={nodes.Object_4.geometry}
						material={materials["Material.005"]}
					/>

					<mesh
						castShadow
						receiveShadow
						geometry={nodes.Object_5.geometry}
						material={materials["Material.006"]}
					/>
				</group>
				<mesh
					castShadow
					receiveShadow
					geometry={nodes.Object_10.geometry}
					material={materials["Material.007"]}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={nodes.Object_17.geometry}
					material={materials["Material.007"]}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={nodes.Object_12.geometry}
					material={materials["Material.006"]}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={nodes.Object_14.geometry}
					material={materials["Material.009"]}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={nodes.Object_15.geometry}
					material={materials["Material.006"]}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={nodes.Object_7.geometry}
					material={materials["Material.007"]}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={nodes.Object_8.geometry}
					material={materials["Material.008"]}
				/>
			</group>
		</mesh>
	);
}

export default Island;
