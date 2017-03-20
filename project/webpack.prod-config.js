var webpack = require('webpack'),
    config = require('./webpack.base-config.js');


config.output.path = require('path').resolve('./static/bundles');

config.plugins = config.plugins.concat([

    // removes a lot of debugging code in React
    new webpack.DefinePlugin({
        'process.env': {'NODE_ENV': JSON.stringify('production')},
    }),

    // keeps hashes consistent between compilations
    new webpack.optimize.OccurenceOrderPlugin(),

    // minifies your code
    new webpack.optimize.UglifyJsPlugin({
        compressor: {warnings: false},
    }),
]);

module.exports = config;
