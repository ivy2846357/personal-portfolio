/*

require => 使用nodeJS的功能，並幫我引用到檔案內
           如果是引用plugin，就是到node_modules幫我把檔案引進來

*/


const path = require('path'); //設定路徑
const HtmlWebpackPlugin = require('html-webpack-plugin'); //設定html-webpack-plugin(複製HTML文件，並引入JS/CSS檔案)
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); //設定mini-css-extract-plugin(CSS檔案獨立設定)
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin'); //設定clean-webpack-plugin(清除舊有dist內容) 
const PurgecssPlugin = require('purgecss-webpack-plugin'); //設定purgecss-webpack-plugin(清除沒用到的CSS樣式)
const glob = require('glob'); //設定多頁打包
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin'); //設定optimize-css-assets-webpack-plugin(CSS檔案壓縮)
const webpack = require('webpack');

//輸出內容
module.exports = {

    entry: './src/js/all.js', //選擇要輸出的檔案

    //輸出路徑位置
    output: {
        path: path.resolve(__dirname, 'dist'), //檔案輸出位置
        filename: 'js/[name]-[contenthash:5].js', //JS輸出檔名
        assetModuleFilename: 'img/[name][contenthash:5][ext][query]', //圖片輸出路徑
    },

    //新增HTTP伺服器
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'), //使用dist資料夾的內容生成HTML檔案
        },
        compress: true, //是否要壓縮
        port: 9000, //伺服器port設定
        open: true, //開啟devServer時，自動開啟HTML網站
        hot: true
    },

    optimization: {
        usedExports: true, // usedExports:true 開啟優化(Tree Shaking但保留程式碼)
        minimize: true, // minimize:true 開啟壓縮 (刪除未使用程式碼)
        // sideEffects 將檔案標誌為副作用
    },

    // devtool: 'eval-cheap-source-map',
    devtool: 'source-map',

    module: {
        rules: [{
            oneOf: [

                //CSS/SASS-loader
                {
                    test: /\.s[ac]ss$/i,
                    use: [MiniCssExtractPlugin.loader, //產生CSS獨立文件
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: true,
                            },
                        },
                        {
                            loader: "postcss-loader", //編譯並處理CSS兼容性設定
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

                //html-loader
                {
                    test: /\.html$/i,
                    loader: "html-loader",
                },

                //圖片處理
                {
                    test: /\.(png|jpg|gif)$/,
                    // 通用資源型別, 不需要安裝 loader
                    type: 'asset',
                    // 現在，webpack 將按照預設條件，自動地在 resource 和 inline 之間進行選擇
                    // 小於 8kb 的檔案，將會視為 inline 模組型別，否則會被視為 resource 模組類
                    // 自定義設定
                    // 小於 8KB 轉 base64
                    parser: {
                        dataUrlCondition: {
                            maxSize: 8 * 1024
                        }
                    },
                },

                //image-webpack-loader
                {
                    test: /\.(gif|png|jpe?g|svg)$/i,
                    use: [
                        'file-loader',
                        {
                            loader: 'image-webpack-loader',
                            options: {
                                mozjpeg: {
                                    progressive: true,
                                    quality: 65,
                                },
                                optipng: {
                                    enabled: false, // 表示不啟用這一個圖片優化器
                                },
                                //各圖片類型設置
                                pngquant: {
                                    quality: [0.65, 0.90],
                                    speed: 4
                                },
                                gifsicle: {
                                    interlaced: false,
                                },
                                webp: {
                                    quality: 75 // 配置選項表示啟用 WebP 優化器
                                },
                                disable: process.env.NODE_ENV === 'production' ? false : true, // 只在 production 環境啟用壓縮
                            }
                        },
                    ]
                },

                //babel
                {
                    test: /\.m?js$/,
                    exclude: /node_modules/, //exclude的內容不要幫我做JS兼容性
                    use: {
                        loader: 'babel-loader',
                        options: {
                            "presets": [
                                ["@babel/preset-env", {
                                    "useBuiltIns": "usage",
                                    "corejs": {
                                        "version": 3
                                    },
                                    //JS兼容性版本設定
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
        //設定CSS獨立文件位置
        new MiniCssExtractPlugin({
            filename: 'style/bundle-[contenthash:5].css',
        }),
        //新增HTML檔案，並將JS/CSS引入
        new HtmlWebpackPlugin({
            template: 'src/index.html',
            title: 'Caching',
        }),
        //清除多餘的CSS
        new PurgecssPlugin({
            paths: glob.sync(`${path.resolve(__dirname, 'src')}/**/*`, {
                nodir: true,
            }),
        }),
        //壓縮CSS檔案
        new OptimizeCssAssetsPlugin({
            cssProcessorPluginOptions: {
                preset: ['default', {
                    discardComments: {
                        removeAll: true
                    }
                }],
            },
        }),
        //載入jQuery
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),
        //清除dist舊有內容
        new CleanWebpackPlugin(),
    ]
}