const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin');
const PurgecssPlugin = require('purgecss-webpack-plugin');
const glob = require('glob');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const webpack = require('webpack');


//輸出內容
module.exports = {
    entry: './src/js/all.js',

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/bundle.js',
    },

    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 9000,
        open: true,
        hot: true
    },

    // devtool: 'eval-cheap-source-map',
    // devtool: 'source-map',

    module: {
        rules: [{
            oneOf: [{
                    test: /\.s[ac]ss$/i,
                    use: [MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: true,
                            },
                        },
                        {
                            loader: "postcss-loader",
                            options: {
                                sourceMap: true,
                                postcssOptions: {
                                    plugins: [
                                        ["autoprefixer", ],
                                    ],
                                },
                            },
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true,
                            },
                        },
                    ],
                },
                {
                    test: /\.(png|jpe?g|gif|svg|webp)$/i,
                    use: [{
                        loader: 'url-loader',
                        options: {
                            limit: 8192,
                            name: 'img/[name].[ext]',
                            publicPath: '/'
                        },
                    }, ],
                },
                {
                    test: /\.html$/i,
                    loader: "html-loader",
                },
                {
                    test: /\.m?js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            "presets": [
                                ["@babel/preset-env", {
                                    "useBuiltIns": "usage",
                                    "corejs": {
                                        "version": 3
                                    },
                                    "targets": {
                                        "chrome": "60",
                                        "firefox": "60",
                                        "ie": "9",
                                        "safari": "10",
                                        "edge": "17"
                                    }
                                }]
                            ],
                            cacheDirectory: true,
                        },
                    },
                },
            ]
        }],
    },

    plugins: [
        new MiniCssExtractPlugin({
            filename: 'style/bundle.css',
        }),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: 'src/index.html',
            title: 'Caching',
        }),
        new PurgecssPlugin({
            paths: glob.sync(`${path.resolve(__dirname, 'src')}/**/*`, {
                nodir: true,
            }),
        }),
        new OptimizeCssAssetsPlugin({
            cssProcessorPluginOptions: {
                preset: ['default', {
                    discardComments: {
                        removeAll: true
                    }
                }],
            },
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),
    ]
}