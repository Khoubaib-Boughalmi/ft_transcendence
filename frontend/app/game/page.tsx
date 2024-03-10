// import Cube from "@/components";

import Game from "@/gameComponents/game";

export default function Home({ params }: any) {
	console.log("Game started", params);

	return (
		// makae div and add other div in center has red color
		<div className="z-10 flex h-full w-full justify-center pt-28">
			<div className=" h-[80vh] w-[75vw]">
				<Game />
			</div>
		</div>
	);
}
