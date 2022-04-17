'use strict';

var path = require('path');
var webpack = require('sgmf-scripts').webpack;
var ExtractTextPlugin = require('sgmf-scripts')['extract-text-webpack-plugin'];
var jsFiles = require('sgmf-scripts').createJsPath();
var scssFiles = require('sgmf-scripts').createScssPath();

var bootstrapPackages = {
    Alert: 'exports-loader?Alert!bootstrap/js/src/alert',
    // Button: 'exports-loader?Button!bootstrap/js/src/button',
    Carousel: 'exports-loader?Carousel!bootstrap/js/src/carousel',
    Collapse: 'exports-loader?Collapse!bootstrap/js/src/collapse',
    // Dropdown: 'exports-loader?Dropdown!bootstrap/js/src/dropdown',
    Modal: 'exports-loader?Modal!bootstrap/js/src/modal',
    // Popover: 'exports-loader?Popover!bootstrap/js/src/popover',
    Scrollspy: 'exports-loader?Scrollspy!bootstrap/js/src/scrollspy',
    Tab: 'exports-loader?Tab!bootstrap/js/src/tab',
    // Tooltip: 'exports-loader?Tooltip!bootstrap/js/src/tooltip',
    Util: 'exports-loader?Util!bootstrap/js/src/util'
};

// Add those imports to your webpack
var glob = require('glob');
var fs = require('fs');
process.noDeprecation = true;
var cwd = process.cwd();

// ZENKRAFT: Add this function
function createScssPath() {
    var cartridgesPath = path.resolve(cwd, "cartridges");
    var clientPath = path.resolve(cartridgesPath, '*', "cartridge/client");
    var result = {};

    glob.sync(path.resolve(clientPath, "*", "scss", "**", "*.scss"))
        .filter(f => !path.basename(f).startsWith("_"))
        .forEach(filePath => {
            var name = path.basename(filePath, '.scss');
            if (name.indexOf('_') !== 0) {
                let location = path.relative(cwd, filePath);
                location = location.substr(0, location.length - 5).replace('scss', 'css');
                result[location.replace('client', 'static')] = filePath;
            }
        });

    return result;
};

// ZENKRAFT: Add this function
function createJsFiles() {
    var cartridgesPath = path.resolve(cwd, "cartridges");
    var clientPath = path.resolve(cartridgesPath, '*', "cartridge/client");
    var result = {};

    glob.sync(path.resolve(clientPath, "*", "js", "*.js")).forEach(f => {
        var key = path.join(path.dirname(path.relative(cwd, f)), path.basename(f, ".js"));
        result[key.replace('client', 'static')] = f;
    });

    return result;
};

module.exports = [{
    mode: 'production',
    name: 'js',
    entry: createJsFiles(), // ZENKRAFT: Change the entry from  sgmfScripts.createJsPath(), to createJsFiles(),
    output: {
        path: path.resolve(__dirname) + '/',
        filename: '[name].js'
    },
    resolve: {
        alias: {
            base: path.resolve(__dirname, './cartridges/app_storefront_base/cartridge/client/default/js'),
        }
    },
    module: {
        rules: [
            {
                test: /bootstrap(.)*\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/env'],
                        plugins: ['@babel/plugin-proposal-object-rest-spread'],
                        cacheDirectory: true
                    }
                }
            }
        ]
    },
    plugins: [new webpack.ProvidePlugin(bootstrapPackages)]
}, {
    mode: 'none',
    name: 'scss',
    entry: createScssPath(),
    output: {
        path: path.resolve(__dirname) + '/',
        filename: '[name].css'
    },
    resolve: {
        alias: {
            base: path.resolve(__dirname, './cartridges/app_storefront_base/cartridge/client/default/scss'),
        }
    },
    module: {
        rules: [{
            test: /\.scss$/,
            use: ExtractTextPlugin.extract({
                use: [{
                    loader: 'css-loader',
                    options: {
                        url: false,
                        minimize: true
                    }
                }, {
                    loader: 'postcss-loader',
                    options: {
                        plugins: [
                            require('autoprefixer')()
                        ]
                    }
                }, {
                    loader: 'sass-loader',
                    options: {
                        includePaths: [
                            path.resolve('node_modules'),
                            path.resolve('node_modules/flag-icon-css/sass')
                        ]
                    }
                }]
            })
        }]
    },
    plugins: [
        new ExtractTextPlugin({ filename: '[name].css' })
    ]
}];
