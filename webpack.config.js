//載入node.js的路徑(不需更動)
const path = require('path');

//輸出內容
module.exports = {
    entry: './src/js/all.js', 

    output: {
        path: path.resolve(__dirname, 'dist/js'),
        filename: 'bundle.js',
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
            use: ["style-loader","css-loader","sass-loader",],
        }, ],
    },
};