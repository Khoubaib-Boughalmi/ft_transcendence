import { Mesh } from "three";
import { useRef, useEffect, useState } from "react";
import { useSphere } from "@react-three/cannon";
import { useTexture } from "@react-three/drei";
import React from "react";

export function Ball(gprops) {
	const {
		GameData,
		animationStarted,
		setAnimationStarted,
		mTheHost,
		mypoints,
		setMypoints,
		oppPoints2,
		setOppPoints,
		setRendered,
		rendered,
		...props
	} = gprops;

	const lastTime3ndi = useRef(true);

	const position = useRef([0, 0, 0]);
	const velocity = useRef([0, 0, 0]);
	const [ref, api] = useSphere<Mesh>(() => ({
		type: "Dynamic",
		args: [0.05],
		mass: 0.04,
		angularVelocity: [0, 0, 0],
		angularFactor: [0.001, 0, 0],
		linearFactor: [1, 1, 1],
		position: [0, 2.5, 0],
		...props,

		onCollide: (e) => {
			if (!mTheHost) {
				return;
			}
			if (!e.body) return;

			if (e.body.name === "ground") {
				api.position.subscribe((v) => (position.current = v));
				api.velocity.subscribe((v) => (velocity.current = v));
				if (position.current[2] > 5 || position.current[2] < -5) {
					api.position.set(0, 2.5, 0);
					api.velocity.set(0, 0, 3);
					if (lastTime3ndi.current) {
						setOppPoints((prev) => prev + 1);
					} else {
						setMypoints((prev) => prev + 1);
					}
				} else if (
					position.current[0] > 1.8 ||
					position.current[0] < -1.8
				) {
					if (lastTime3ndi.current) {
						setMypoints((prev) => prev + 1);
					} else {
						setMypoints((prev) => prev + 1);
					}
					api.position.set(0, 2.5, 0);
					api.velocity.set(0, 0, 3);
				}
				if (e.contact.contactPoint[2] > 0) {
					lastTime3ndi.current = true;
				} else {
					lastTime3ndi.current = false;
				}
			}
			if (e.body.name === "racket_mine" || e.body.name === "racket_opp") {
				api.position.subscribe((v) => (position.current = v));
				api.velocity.subscribe((v) => (velocity.current = v));
				if (e.contact.rj[0] < -0.25) return;
				if (e.contact.rj[0] > 0.25) return;
				if (e.contact.rj[0] < 0) {
					velocity.current[0] -= Math.random() * 1.5;
					velocity.current[0] < -1
						? (velocity.current[0] = -1)
						: null;
					velocity.current[0] > 0
						? (velocity.current[0] = -0.2)
						: null;
				} else {
					velocity.current[0] += Math.random() * 1.5;
					velocity.current[0] > 1 ? (velocity.current[0] = 1) : null;
					velocity.current[0] < 0
						? (velocity.current[0] = 0.2)
						: null;
				}
				velocity.current[0] = e.contact.rj[0] * 10;
				velocity.current[1] = 2.4;
				velocity.current[2] *= -1;
				velocity.current[2] = 8.5 * Math.sign(velocity.current[2]);

				api.velocity.set(
					velocity.current[0],
					velocity.current[1],
					velocity.current[2],
				);
			}
		},
	}));

	GameData.ballRef = ref;
	GameData.ballAPi = api;
	useEffect(() => {
		if (!ref.current || rendered) return;
		ref.current.onAfterRender = () => {
			setRendered(true);
		};
		return () => {
			ref.current.onAfterRender = () => {};
		};
	}, [rendered]);
	const texture = useTexture("/PingPongBall.png");

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
