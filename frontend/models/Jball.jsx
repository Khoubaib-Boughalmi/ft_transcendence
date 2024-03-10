import { useRef } from "react";
import { useGLTF } from "@react-three/drei";
// import { useFrame } from "@react-three/fiber";

import jbalScene from "@/assets/3d/the_3_islands.glb";

export function Jball(props) {
	// console.log("jball props", props);
	const { nodes, materials } = useGLTF(jbalScene);
	return (
		<group {...props} dispose={null}>
			<group rotation={[-Math.PI / 2, 0, 0]} scale={0.01}>
				<mesh
					castShadow
					receiveShadow
					geometry={nodes.Object_10.geometry}
					material={materials.curve_Pipe}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={nodes.Object_11.geometry}
					material={materials.island_Connector_CURVE}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={nodes.Object_12.geometry}
					material={materials.island_Metal_holders}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={nodes.Object_19.geometry}
					material={materials.sphere}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={nodes.Object_20.geometry}
					material={materials.ISLAND_BASE}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={nodes.Object_21.geometry}
					material={materials.ISLAND_BASE}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={nodes.Object_7.geometry}
					material={materials.base_island_additional_pipes}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={nodes.Object_8.geometry}
					material={
						materials["base_island_additional_pipes_BEAM.001"]
					}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={nodes.Object_9.geometry}
					material={materials.base_island_additional_pipes_transarent}
				/>
			</group>
		</group>
	);
}

export default Jball;
