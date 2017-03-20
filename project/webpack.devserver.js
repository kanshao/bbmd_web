var webpack = require('webpack'),
    WebpackDevServer = require('webpack-dev-server'),
    config = require('./webpack.dev-config.js');


new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    hot: true,
    inline: true,
    historyApiFallback: true,
    stats: { colors: true },
}).listen(3001, '0.0.0.0', function (err, result) {
    if (err) console.log(err);
    console.log('Listening at 0.0.0.0:3001');
});
