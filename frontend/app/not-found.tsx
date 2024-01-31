export default function notFound() {
    return (
        <main className="flex flex-col items-center justify-center">
				<div className="absolute inset-0 flex justify-center">
					<img
						src="/noose.png"
						className="translate-x-[8%] translate-y-[-29%] blur-md"
					/>
				</div>
				<div className="bg-gradient-to-t from-card-400 to-card-600 bg-clip-text pl-4 text-[10rem] font-black text-transparent">
					?
				</div>
				<div className="-mt-14 font-bold">404</div>
			</main>
    )
}