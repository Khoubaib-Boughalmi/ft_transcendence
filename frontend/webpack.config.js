module.exports = {
	module: {
		rules: [
			{
				test: /\.(glb|gltf)$/,
				use: [
					{
						loader: "file-loader",
						options: {
							name: "[name].[ext]",
							outputPath: "assets/3d/",
						},
					},
				],
			},
		],
	},
};
