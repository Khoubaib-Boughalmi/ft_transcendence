import React, { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { a } from "@react-spring/three";
// import scene from "/3d/racket.glb";
import { useBox } from "@react-three/cannon";
import * as THREE from "three";


export function Racket(ogprops) {
	const { nodes, materials } = useGLTF("/3d/racket.glb");
	const { GameData, canvasRef, name, ...props } = ogprops;
	const [racketRef, api] = useBox(() => ({
		...props,
		collisionResponse: 0,
		type: "Kinematic", 
		args: [0.55, 0.55, 0.4],
	}));
	if (props.isplayer) {
		GameData.racket1Ref = racketRef;
		GameData.racket1APi = api;
	} else if (!props.isplayer) {
		GameData.racket2Ref = racketRef;
		GameData.racket2APi = api;
	}
	const started = useRef(false);

	useEffect(() => {
		const handleMouseMove = (e) => {
			if (!canvasRef.current) return;

			const canvasRect = canvasRef.current.getBoundingClientRect();

			const mouseX = e.clientX - canvasRect.left;
			const mouseY = e.clientY - canvasRect.top;

			const x = (mouseX / canvasRect.width) * 3 - 1.5;
			const z = mouseY / canvasRect.height - 0.5;
			const yRotation = -(0.5 - mouseX / canvasRect.width) * 0.7;
			const zRotation = (0.5 - mouseX / canvasRect.width) * 0.5;

			api.position.set(
				x,
				racketRef.current.position.y,
				racketRef.current.position.z + z * 0.2,
			);
			api.rotation.set(
				racketRef.current.rotation.x,
				yRotation,
				zRotation,
			);
		};

		if (props.isplayer && !started.current) {
			started.current = true;
			window.addEventListener("mousemove", handleMouseMove);
		}

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
		};
	}, [props.isplayer, api]);

	return (
		<a.group name={name} ref={racketRef} {...props}>
			<mesh
				geometry={
					(nodes.SM_PingPongPaddle_M_PingPongPaddle_0 as THREE.Mesh)
						.geometry
				}
				material={materials.M_PingPongPaddle}
			/>
		</a.group>
	);
}

export default Racket;
