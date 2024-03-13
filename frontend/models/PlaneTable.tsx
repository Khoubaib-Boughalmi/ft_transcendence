import { PlaneProps, usePlane } from "@react-three/cannon";
import { Ref } from "react";

export function PlaneTable(props: PlaneProps) {
	const [ref, api] = usePlane(() => ({
		name: "ground",
		...props,
		// onCollide: () => {
		//   console.log("collide table");

		//   // api.position.
		//   // api.velocity.set(0, 1, 0);
		//   //rotation ++
		//   // api.quaternion.set(0, 0, 0, 0);
		// },
	}));

	return (
		<group ref={ref} name="ground">
			<mesh receiveShadow>
				{/* <planeGeometry args={[10, 10]} /> */}
				{/* <meshStandardMaterial color="#ff1f00" /> */}
			</mesh>
		</group>
	);
}

export default PlaneTable;
