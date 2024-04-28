import { useRef } from "react";
import { useGLTF } from "@react-three/drei";

export function Sky_cloud() {
	const sky = useGLTF("/3d/sky_cloud.glb");
	const skyRef = useRef();

	return (
		<mesh ref={skyRef}>
			<primitive object={sky.scene} />
		</mesh>
	);
}

export default Sky_cloud;
