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
        open: true
    },

    module: {
        rules: [{
            test: /\.s[ac]ss$/i,
            use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader", ],
        }, {
            test: /\.(png|jpe?g|gif|svg|webp)$/i,
            use: [{
                loader: 'url-loader',
                options: {
                    limit: 8192,
                    name: 'img/[name].[ext]',
                    publicPath: '../',
                },
            }, ],
        }, {
            test: /\.html$/i,
            loader: "html-loader",
        }, {
            loader: 'image-webpack-loader',
            options: {
                disable: process.env.NODE_ENV === 'production' ? false : true,
            },
        }, ],
    },

    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
        }),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: 'src/index.html',
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
    ],
};