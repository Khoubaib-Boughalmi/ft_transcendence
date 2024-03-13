import { useFrame, useThree } from "@react-three/fiber";

let RC_radius = 100; // Radius of the circular path
let RC_direction = 1;
let RC_height = 100; // Constant RC_height

export const RoundCamera = (props: {
	animationStarted: any;
	cameraPosition: number[];
	setAnimationStarted: (arg0: boolean) => void;
}) => {
	if (!props.animationStarted) {
		console.log("start");

		return null;
	}
	const { camera } = useThree();

	// Define the animation parameters
	const animationDuration = 1000; // Duration of the animation in seconds

	useFrame(({ clock }) => {
		// Start the animation when the component mounts

		// Calculate the current angle based on elapsed time
		const t = clock.getElapsedTime();
		const angle = (t / 10) * 2 * Math.PI; // This will complete a full circle in 'animationDuration' seconds

		// Calculate the new camera position
		const x = RC_radius * Math.cos(angle);
		const z = RC_radius * Math.sin(angle);
		// console.log("x", x, "z", z);

		// Set the camera's position and lookAt point
		camera.position.set(
			x + props.cameraPosition[0],
			RC_height + props.cameraPosition[1],
			z + props.cameraPosition[2],
		);
		camera.lookAt(0, 0, 0);

		// Reset the animation and clock when it completes
		// if (t >= animationDuration) {
		//   clock.stop();
		//   clock.start();
		//   setAnimationStarted(false);
		// }
		if (RC_direction == 1) {
			RC_height -= 0.2;
			RC_radius -= 0.2;
		}
		if (RC_direction == -1) {
			// RC_height = 7;
			// radius = 7;
			return null;
		}
		if (RC_height <= 0) {
			props.setAnimationStarted(false);
			// animationStarted = false;
			RC_direction = -1;
			return null;
		}
		// if (height >= 30) {
		//   direction = 1;
		// }
	});

	return null;
};

export default RoundCamera;
