/*

require => 使用nodeJS的功能，並幫我引用到檔案內
           如果是引用plugin，就是到node_modules幫我把檔案引進來

*/

const path = require('path'); //設定路徑
const HtmlWebpackPlugin = require('html-webpack-plugin'); //設定 html-webpack-plugin (複製 HTML 文件，並引入 JS / CSS 檔案)
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); //設定 mini-css-extract-plugin ( CSS 檔案獨立設定)
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin'); //設定 clean-webpack-plugin (清除舊有 dist 內容) 
const PurgecssPlugin = require('purgecss-webpack-plugin'); //設定 purgecss-webpack-plugin (清除沒用到的 CSS 樣式)
const glob = require('glob'); //設定多頁打包
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin'); //設定 optimize-css-assets-webpack-plugin ( CSS 檔案壓縮)
const webpack = require('webpack'); //設定 ProvidePlugin (引入第三方資源)
const CopyWebpackPlugin = require('copy-webpack-plugin'); //設定 copy-webpack-plugin (複製 src 檔案到 dist 的資料夾)

//輸出內容
module.exports = {
    target: "web",

    devtool: 'eval-cheap-source-map',
    // devtool: 'source-map',

    entry: './src/js/all.js',

    //輸出路徑位置
    output: {
        path: path.resolve(__dirname, 'dist'), //檔案輸出位置
        filename: 'js/bundle-[contenthash:5].js', //JS 輸出檔名
        assetModuleFilename: 'img/[name][ext]', //圖片輸出路徑
    },

    resolve: {
        modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    },

    //新增 HTTP 伺服器
    devServer: {
        static: {
            directory: path.resolve(__dirname, 'dist'), //使用 dist 資料夾的內容生成 HTML 檔案
        },
        compress: true, //是否要壓縮
        port: 7000, //伺服器 port 設定
        open: true, //開啟 devServer 時，自動開啟 HTML 網站
        hot: true
    },

    optimization: {
        usedExports: true, // usedExports:true 開啟優化( Tree Shaking 但保留程式碼)
        minimize: true, // minimize:true 開啟壓縮 (刪除未使用程式碼)
        // sideEffects 將檔案標誌為副作用

        //抽離公用模組
        splitChunks: {
            chunks: 'initial', //只處理同步加載的 chunk，例如 import xxx 語法載入的模組
            minSize: 20000,
            minRemainingSize: 0,
            minChunks: 1,
            maxAsyncRequests: 30,
            maxInitialRequests: 30,
            enforceSizeThreshold: 50000,
            cacheGroups: {
                defaultVendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10,
                    reuseExistingChunk: true,
                    name: 'vendor',
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true,
                },
            },
        },
    },

    module: {
        rules: [

            // CSS / SASS-loader
            {
                test: /\.s[ac]ss$/i,
                use: [MiniCssExtractPlugin.loader, //產生 CSS 獨立文件
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                        },
                    },
                    {
                        loader: "postcss-loader", //編譯並處理 CSS 兼容性設定
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
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },

            //圖片處理
            {
                test: /\.(png|jpe?g|gif)$/i,
                type: 'asset/resource',
            },

            {
                test: /\.svg$/,
                loader: 'svg-inline-loader',
            },

            //image-webpack-loader
            {
                test: /\.(gif|png|jpe?g|svg)$/i,
                use: [{
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
                }, ]
            },

            //babel
            {
                test: /\.m?js$/,
                exclude: /node_modules/, //exclude 的內容不要幫我做JS兼容性
                use: {
                    loader: 'babel-loader',
                    options: {
                        "presets": [
                            ["@babel/preset-env", {
                                "useBuiltIns": "usage",
                                "corejs": {
                                    "version": 3
                                },
                                //JS 兼容性版本設定
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

            //字型處理
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                include: [path.resolve(__dirname, "src/assets/fontStyle")], // 只命中指定 目錄下的檔案，加快 Webpack 搜尋速度
                exclude: /(node_modules)/, // 排除 node_modules 目錄下的檔案
                loader: 'file-loader',
                // 新增 options 配置引數：關於 file-loader 的配置項
                options: {
                    limit: 10000,
                    outputPath: 'css/fonts/', // 定義打包完成後最終匯出的檔案路徑
                    name: '[name].[hash:7].[ext]' // 檔案的最終名稱
                }
            },
        ],
    },

    plugins: [
        //設定 CSS 獨立文件位置
        new MiniCssExtractPlugin({
            filename: 'style/bundle-[contenthash:5].css',
        }),

        //新增首頁 HTML 檔案，並將 JS / CSS 引入
        new HtmlWebpackPlugin({
            template: 'src/index.html', //引入檔案名稱
            filename: 'index.html', //輸出檔案名稱
        }),

        //清除多餘的 CSS
        new PurgecssPlugin({
            paths: glob.sync(`${path.resolve(__dirname, 'src')}/**/*`, {
                nodir: true,
            }),
        }),

        //壓縮 CSS 檔案
        new OptimizeCssAssetsPlugin({
            cssProcessorPluginOptions: {
                preset: ['default', {
                    discardComments: {
                        removeAll: true
                    }
                }],
            },
        }),

        //引入第三方資源
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
        }),

        //清除 dist 舊有內容
        new CleanWebpackPlugin(),

        //複製 src 其他資料到 dist 內
        //例如： zip、 mp3、 font
        new CopyWebpackPlugin({
            patterns: [{
                from: "./src/assets", //起始資料夾
                to: "assets/[path][name][ext]" //搬運資料夾
            }, ],
        }),
    ]
}