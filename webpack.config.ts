import webpack from 'webpack'

const config: webpack.Configuration = {
  mode: 'development',
	entry: './src/index.ts',
	output: {
		path: __dirname + '/dist',
		filename: 'bundle.js',
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
}

export default config
