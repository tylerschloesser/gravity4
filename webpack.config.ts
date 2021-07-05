import webpack from 'webpack'

const config: webpack.Configuration = {
  entry: './src/index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js',
  },
}

export default config
