import { useRef, useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useSphere } from "@react-three/cannon";
import ballScene from "../assets/3d/ball.glb";
import imageww from "../assets/3d/gradient.jpg";
import { useTexture } from "@react-three/drei";
import { m } from "framer-motion";
// mypoints = { mypoints };
// setMypoints = { setMypoints };
export function Ball(gprops) {
	const {
		GameData,
		animationStarted,
		setAnimationStarted,
		mTheHost,
		mypoints,
		setMypoints,
		...props
	} = gprops;

	// const [lastPosInGround, setLastPosInGround] = useState([0, 0, 0]);
	// const [lastRacketisMine, setLastRacketisMine] = useState(false);
	const lastPosInGround = useRef([0, 0, 0]);
	const lastRacketisMine = useRef(false);

	const position = useRef([0, 0, 0]);
	const velocity = useRef([0, 0, 0]);
	const [ref, api] = useSphere(
		() => ({
			type: "Dynamic",
			args: [0.05],
			mass: 0.04,
			velocity: [0, 5, 10],
			angularVelocity: [0, 0, 0],
			...props,
			// velocity: [1, 2, 10],
			onCollide: (e) => {
				console.log("collided with", e.body.name);

				// api.rotation.set(0, 0, 0);
				// api.quaternion.set(0, 0, 0, 0);
				// api.angularDamping.set(0, 0, 0);
				api.angularVelocity.set(0, 0, 0);
				if (!mTheHost) {
					console.log("m not the host");
					return;
				}
				if (!e.body) return;

				if (e.body.name === "ground") {
					api.position.subscribe((v) => (position.current = v));
					api.velocity.subscribe((v) => (velocity.current = v));
					// setLastPosInGround(position.current);
					lastPosInGround.current = position.current;
					// console.log("position", position.current);
					if (position.current[2] > 5 || position.current[2] < -5) {
						console.log("lastplace", lastPosInGround);
						console.log("isMine", lastRacketisMine);
						// setMyPoints(myPoints + 1);
						// GamePoints.myPoints++;
						// console.log("GamePoints", GamePoints.myPoints);
						api.position.set(0, 2.5, 0);
						api.velocity.set(0, 0, 3);
					}
					if (
						position.current[0] > 1.5 ||
						position.current[0] < -1.5
					) {
						// GamePoints.oppPoints++;
						// console.log("GamePoints", GamePoints);
						// setMyPoints(myPoints + 1);

						console.log("lastplace", lastPosInGround);
						console.log("isMine", lastRacketisMine);
						api.position.set(0, 2.5, 0);
						api.velocity.set(0, 0, 3);
					}
				}
				if (
					e.body.name === "racket_mine" ||
					e.body.name === "racket_opp"
				) {
					if (e.body.name === "racket_mine") {
						// setLastRacketisMine(true);
						lastRacketisMine.current = true;
					}
					if (e.body.name === "racket_opp") {
						// setLastRacketisMine(false);
						lastRacketisMine.current = false;
					}
					api.position.subscribe((v) => (position.current = v));
					api.velocity.subscribe((v) => (velocity.current = v));
					// console.log("collided racket", e.contact.contactPoint);
					// console.log("----->", e.contact.contactNormal);
					// console.log("----->", e.contact.rj);
					if (e.contact.rj[0] < -0.25) return;
					if (e.contact.rj[0] > 0.25) return;

					// if (e.contact.contactNormal[2] < -0.5) return;
					api.angularVelocity.set(0, 0, 0);

					// if (e.contact.contactNormal[1] > 0) {
					//   console.log("collided with racket from top");
					// } else {
					//   console.log("collided with racket from bottom");
					// }
					// if (e.contact.contactNormal[0] > 0) {
					//   console.log(" right");
					// }
					// if (e.contact.contactNormal[0] < 0) {
					//   console.log(" left");
					// }
					// if (e.contact.contactNormal[2] > 0) {
					//   console.log("front");
					// }
					// if (e.contact.contactNormal[2] < 0) {
					//   console.log("back");
					// }

					// console.log("position", position.current);
					if (e.contact.rj[0] < 0) {
						velocity.current[0] -= Math.random() * 1.5;
						velocity.current[0] < -1.5
							? (velocity.current[0] = -1.5)
							: null;
						velocity.current[0] > 0
							? (velocity.current[0] = -0.5)
							: null;
						// console.log("left ", velocity.current[0]);
					} else {
						velocity.current[0] += Math.random() * 1.5;
						velocity.current[0] > 1.5
							? (velocity.current[0] = 1.5)
							: null;
						velocity.current[0] < 0
							? (velocity.current[0] = 0.5)
							: null;
						// console.log("right ", velocity.current[0]);
					}
					velocity.current[0] = e.contact.rj[0] * 10;
					// console.log("velocity 0 ", velocity.current[0]);
					// velocity.current[0] += (0.5 - Math.random()) * 3;
					velocity.current[1] = 2.4;
					velocity.current[2] *= -1;
					// console.log("velocity", velocity.current);
					// if (
					//   Math.abs(velocity.current[2]) > 10 ||
					//   Math.abs(velocity.current[2]) < 8
					// ) {
					// console.log("velocity AFTER", velocity.current);
					velocity.current[2] = 8.5 * Math.sign(velocity.current[2]);
					// console.log("velocity BESFORE", velocity.current);
					// }

					api.velocity.set(
						velocity.current[0],
						velocity.current[1],
						velocity.current[2],
					);
					// api.sleepSpeedLimit = 0.1;
					// api.sleep();
					// api.velocity.subscribe((v) => (velocity.current = v));
					// console.log("velocity BESFORE 2", velocity.current);

					// console.log(0, velocity.current[1], velocity.current[2]);
					// const finalY = 5;
					// const initialY = position.current[1];
					// const gravity = -10;
					// const time = 1;
					// let TargetZ = 0;
					// let Mergez = position.current.z - center.z;

					// if (Math.abs(Mergez) < 0.5) {
					//   Mergez *= 1.4;
					// }
					// if (Mergez > 0) {
					//   TargetZ =
					//     Math.abs(Mergez) * (-5 - position.current.z) + position.current.z;
					// } else {
					//   TargetZ =
					//     Math.abs(Mergez) * (5 - position.current.z) + position.current.z;
					// }

					// const vyy = (finalY - initialY - 0.5 * gravity * time * time) / time;
					// let TargetX = -2;
					// const vxx = (TargetX - position.current[0]) / time;
					// const vzz = (TargetZ - position.current[2]) / time;

					// // Setting the new velocities based on the calculated values
					// velocity.current[0] = 0;
					// velocity.current[1] = 4.2;
					// velocity.current[2] = -5.5;
					// console.log("velocity", velocity.current);
					// api.velocity.set(
					//   velocity.current[0],
					//   velocity.current[1],
					//   velocity.current[2]
					// );
				}
			},
		}),

		useRef(),
	);
	GameData.ballRef = ref;
	GameData.ballAPi = api;

	// if (animationStarted)
	// {
	//   api.sleep()
	// }
	// else{
	//   api.velocity.set([1, 2, 10])
	// }

	// useFrame(({ clock }) => {
	//   api.rotation.set(0, 0, 0);
	//   api.quaternion.set(0, 0, 0, 0);
	//   api.angularDamping.set(0, 0, 0);
	//   api.angularVelocity.set(0, 0, 0);
	//   api.position.subscribe((v) => (position.current = v));
	//   api.velocity.subscribe((v) => (velocity.current = v));
	//   // console.log("Velocity", velocity.current);
	//   if (
	//     (position.current[0] > 1.5 && velocity.current[0] > 0) ||
	//     (position.current[0] < -1.5 && velocity.current[0] < 0)
	//   ) {
	//     // velocity.current[0] *= 2;
	//     // if (velocity.current[1] > 10 || velocity.current[1] < 4) {
	//     // }

	//     velocity.current[0] *= -1;
	//     api.velocity.set(
	//       velocity.current[0],
	//       velocity.current[1],
	//       velocity.current[2]
	//     );
	//   }
	//   if (
	//     (position.current[2] > 4 && velocity.current[2] > 0) ||
	//     (position.current[2] < -3 && velocity.current[2] < 0)
	//   ) {
	//     // velocity.current[2] *= 2;
	//     // if (velocity.current[1] > 10 || velocity.current[1] < 4) {
	//     // velocity.current[1] = 3;
	//     // }
	//     // console.log("pos", position.current);
	//     if (position.current[0] > 0) velocity.current[0] -= Math.random();
	//     else velocity.current[0] += Math.random();
	//     velocity.current[1] = 2;
	//     // console.log("velocity", velocity.current);
	//     velocity.current[2] *= -1;
	//     // if (
	//     //   Math.abs(velocity.current[2]) > 10 ||
	//     //   Math.abs(velocity.current[2]) < 8
	//     // ) {
	//     velocity.current[2] = 9 * Math.sign(velocity.current[2]);
	//     // }

	//     api.velocity.set(
	//       velocity.current[0],
	//       velocity.current[1],
	//       velocity.current[2]
	//     );
	//   }
	//   // api.linearFactor.set(1, 1, 1);
	//   // api.
	// });

	// useEffect(() => {
	//   const unsubscribe = api.velocity.subscribe((v) => (velocity.current = v));
	//   console.log(unsubscribe);
	// }, []);

	const texture = useTexture("/PingPongBall.png"); // Load the texture using the image URL
	// useEffect(() => {
	//   console.log(ref.current.position);
	// }, [ref.current?.position]);
	return (
		<mesh
			ref={ref}
			name="Ball"
			castShadow
			onPointerDown={() => {
				api.velocity.set(0, 5, 10);
			}}
		>
			<sphereGeometry args={[0.06]} />
			<meshStandardMaterial map={texture} />
		</mesh>
	);
}

export default Ball;
