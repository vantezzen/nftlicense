const webpack = require('webpack');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

const generalConfig = {
  watchOptions: {
    aggregateTimeout: 600,
    ignored: /node_modules/,
  },
  devtool: 'inline-source-map',
  plugins: [
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
      cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, './dist')],
    }),
  ],
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
};

const getNodeConfig = () => ({
  ...generalConfig,
  entry: './src/index.ts',
  target: 'node',
  externals: [nodeExternals()],
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'NFTLicense.js',
    libraryTarget: 'umd',
  },
});

const getBrowserConfig = () => {
  const config = {
    ...generalConfig,
    entry: './src/browser/index.ts',
    target: 'web',
    output: {
      path: path.resolve(__dirname, './dist'),
      filename: 'NFTLicenseBrowser.js',
      libraryTarget: 'umd',
      globalObject: 'this',
      libraryExport: 'default',
      umdNamedDefine: true,
      library: 'NFTLicenseBrowser',
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      fallback: {
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        assert: require.resolve('assert'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify'),
        url: require.resolve('url'),
      },
    },
  };
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    })
  );
  return config;
};

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    generalConfig.devtool = 'source-map';
  } else if (argv.mode === 'production') {
  } else {
    throw new Error('Specify env');
  }

  return [getNodeConfig(), getBrowserConfig()];
};
