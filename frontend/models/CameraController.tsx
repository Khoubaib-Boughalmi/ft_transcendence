import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";

export const CameraController = (props: any) => {
	const GameData = props.GameData;

	const { camera } = useThree();

	const Racket_position = useRef([0, 0, 0]);
	const updateCameraPosition = () => {

		GameData.racket1APi.position.subscribe(
			(v) => (Racket_position.current = v),
		);
		if (
			Racket_position.current[0] == 0 &&
			Racket_position.current[1] == 0
		) {
			return null;
		}
		camera.position.x = Racket_position.current[0] * 0.7;
		camera.position.y = Racket_position.current[1] + 1;

		camera.lookAt(0, 0, 0);
	};

	useEffect(() => {
		const interval = setInterval(() => {
			updateCameraPosition();
		}, 20);

		return () => clearInterval(interval); 
	}, [GameData.racket1APi]);
	return null;
};

export default CameraController;
