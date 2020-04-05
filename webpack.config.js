const path = require('path');
const copyPlugin = require('copy-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

const basicConfig = {
    module: {
        rules: [{
            test: /\.(js|jsx)$/u,
            exclude: '/node_modules/',
            use: 'babel-loader',
        }],
    },
    resolve: {
        extensions: [
            '.js',
            '.jsx',
        ],
    },
    watchOptions: {
        ignored: ['node_modules'],
    },
    entry: ['@babel/polyfill', path.join(__dirname, 'src', 'index.js')],
    output: {
        filename: 'index.js',
    },
    target: 'node',
};

const configs = [{
    ...basicConfig,
    target: 'node',
    entry: ['@babel/polyfill', path.join(__dirname, 'src', 'api', 'index.js')],
    externals: [nodeExternals(), 'mysql2'],
    output: {
        filename: 'index.js',
        libraryTarget: 'commonjs2',
    },
    node: {
        // Looks like webpack messes with Node globals: https://webpack.js.org/configuration/node/
        // We don't want that when building for node, so we disable it.
        __dirname: false,
        __filename: false,
    },
}, {
    ...basicConfig,
    target: 'web',
    entry: ['@babel/polyfill', path.join(__dirname, 'src', 'front', 'index.js')],
    output: {
        filename: 'front/index.js',
    },
    plugins: [
        new copyPlugin([
            {from: 'src/front/index.html', to: 'front/index.html'},
            {from: 'src/front/img', to: 'front/img'},
            {from: 'src/front/font', to: 'front/font'},
        ]),
    ],
    module: {
        ...basicConfig.module,
        rules: [
            ...basicConfig.module.rules, {
                test: /\.scss$/u,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader',
                ],
            }, {
                test: /\.svg$/u,
                use: 'file-loader',
            }, {
                test: /\.png$/u,
                use: [{
                    loader: 'url-loader',
                    options: {mimetype: 'image/png'},
                }],
            },
        ],
    },
}];

if (process.env.NODE_ENV === 'production') {
    module.exports = configs.map(config => ({
        ...config,
        mode: 'production',
        output: {
            ...config.output,
            path: path.resolve(__dirname, 'dist', 'prod'),
        }
    }));
} else {
    module.exports = configs.map(config => ({
        ...config,
        mode: 'development',
        devtool: 'source-map',
        output: {
            ...config.output,
            path: path.resolve(__dirname, 'dist', 'dev'),
        },
    }));
}
