var config = require('./webpack.base-config.js'),
    webpack = require('webpack');

// turn debug on
config.__devFlagPlugin.definitions.__DEBUG__ = true;

// add dev-server entry
config.entry = [
    'webpack-dev-server/client?http://localhost:3001',
    'webpack/hot/only-dev-server',
    './assets/js/index',
];

// override django's STATIC_URL for webpack bundles
config.output.publicPath = 'http://localhost:3001/static/bundles/';

// add the hot-module plugin
config.plugins.unshift(
    new webpack.HotModuleReplacementPlugin()
);

// use hot-reloader for jsx
config.module.loaders[0]['loader'] = 'react-hot';

module.exports = config;
