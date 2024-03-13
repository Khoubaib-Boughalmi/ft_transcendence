import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";

export const CameraController = (props: any) => {
	const GameData = props.GameData;

	const { camera } = useThree();
	// console.log("camera controller", camera.position);

	const Racket_position = useRef([0, 0, 0]);
	const updateCameraPosition = () => {
		// console.log(GameData.racket1APi);

		GameData.racket1APi.position.subscribe(
			(v) => (Racket_position.current = v),
		);
		// console.log("Raacket", Racket_position.current);
		if (
			Racket_position.current[0] == 0 &&
			Racket_position.current[1] == 0
		) {
			return null;
		}
		const cameraSensitivity = 0.1;
		camera.position.x = Racket_position.current[0] * 0.7;
		camera.position.y = Racket_position.current[1] + 1;

		camera.lookAt(0, 0, 0);
		// console.log("controller", camera.position);
	};

	useEffect(() => {
		const interval = setInterval(() => {
			updateCameraPosition();
		}, 20); // 100 milliseconds = 0.1 seconds

		return () => clearInterval(interval); // Clean up the interval on component unmount
	}, [GameData.racket1APi]); // Empty dependency array means this effect runs once on mount

	// useFrame(() => {
	//   GameData.racket1APi.position.subscribe(
	//     (v) => (Racket_position.current = v)
	//   );
	//   // console.log(Racket_position.current);

	//   // console.log(Racket_position.current);

	//   // GameData.ballAPi.velocity.set(0, 0.1, 0);

	//   // console.log(mousePosition);

	//   // Modify these values to adjust sensitivity or direction
	//   const cameraSensitivity = 0.1;
	//   // camera.position.x +=
	//   //   (mousePosition.x - camera.position.x) * cameraSensitivity;
	//   // camera.position.y +=
	//   //   (mousePosition.y - camera.position.y) * cameraSensitivity * 0.1;
	//   camera.position.x = Racket_position.current[0] * 0.7;
	//   camera.position.y = Racket_position.current[1] + 1;

	//   camera.lookAt(0, 0, 0); // Adjust if you want the camera to look at a different point
	//   // console.log(canvasRef);
	// });

	return null;
};

export default CameraController;
