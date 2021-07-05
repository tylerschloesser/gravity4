import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'

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
  plugins: [new HtmlWebpackPlugin()],
}

export default config
