import React from "react";

interface GameScoreProps {
	myPoints: number;
	oppPoints: number;
}

export const GameScore: React.FC<GameScoreProps> = ({
	myPoints,
	oppPoints,
}) => {
	return (
		<div className="absolute left-0 top-0 z-10 flex items-center">
			<div className="relative flex h-16 w-48 justify-between rounded-lg bg-gray-800 shadow-md">
				<div className=" flex flex-col items-center justify-center rounded-lg bg-yellow-500 px-4 py-2 text-center font-bold">
					P1: {myPoints ? myPoints : 0}
				</div>
				<div className="flex flex-col items-center justify-center rounded-lg bg-blue-500 px-4 py-2 text-center font-bold text-white">
					P2: {oppPoints ? oppPoints : 0}
				</div>
			</div>
		</div>
	);
};

export default GameScore;
