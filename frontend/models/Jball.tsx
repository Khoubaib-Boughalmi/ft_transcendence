import { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export function Jball(props) {
	const { nodes, materials } = useGLTF("/3d/the_3_islands.glb");
	const group = useRef();

	return (
		<group {...props} dispose={null}>
			<group rotation={[-Math.PI / 2, 0, 0]} scale={0.01}>
				<mesh
					castShadow
					receiveShadow
					geometry={(nodes.Object_10 as THREE.Mesh).geometry}
					material={materials.curve_Pipe}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={(nodes.Object_11 as THREE.Mesh).geometry}
					material={materials.island_Connector_CURVE}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={(nodes.Object_12 as THREE.Mesh).geometry}
					material={materials.island_Metal_holders}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={(nodes.Object_19 as THREE.Mesh).geometry}
					material={materials.sphere}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={(nodes.Object_20 as THREE.Mesh).geometry}
					material={materials.ISLAND_BASE}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={(nodes.Object_21 as THREE.Mesh).geometry}
					material={materials.ISLAND_BASE}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={(nodes.Object_7 as THREE.Mesh).geometry}
					material={materials.base_island_additional_pipes}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={(nodes.Object_8 as THREE.Mesh).geometry}
					material={
						materials["base_island_additional_pipes_BEAM.001"]
					}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={(nodes.Object_9 as THREE.Mesh).geometry}
					material={materials.base_island_additional_pipes_transarent}
				/>
			</group>
		</group>
	);
}

export default Jball;
