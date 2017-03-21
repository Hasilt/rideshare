
var webpack = require('webpack');
var path = require("path");

var lib_dir = __dirname + '/public/js/libs',
    node_dir = __dirname + '/node_modules',
    plugins_dir = __dirname + '/public/plugins';
   

var config = {
    addVendor: function (name, path) {  
        this.resolve.alias[name] = path;
        this.module.noParse.push(new RegExp(path));
    },

    resolve: {
        alias: {
            react: lib_dir + '/react.js',
            reactDom: lib_dir + '/react-dom',
            underscore: node_dir + '/underscore/underscore.js',
            jquery: lib_dir + '/jQuery-2.1.4.min.js',
            velocity: lib_dir + '/velocity.min.js',
            jqueryUi: plugins_dir + '/jQueryUI/jquery-ui.min.js',
            bootstrap: plugins_dir + '/bootstrap/js/bootstrap.min.js',
            slimscroll: plugins_dir + '/slimScroll/jquery.slimscroll.min.js',
            fastclick: plugins_dir + '/fastclick/fastclick.min.js',
        }
    }, 

    plugins: [
        new webpack.ProvidePlugin({
            jQuery: "jquery",
            'window.jQuery': "jquery",
        }),
        new webpack.optimize.CommonsChunkPlugin('vendors', 'js/dist/vendors.js', Infinity),

        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            minimize: true
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin()

    ],

    entry: {
        app: ['./public/js/app-main'],
        vendors: ['react','reactDom','underscore','jquery','velocity','jqueryUi','bootstrap','slimscroll','fastclick']
    },

    output: {
        path: path.join(__dirname, "public"),
        filename: "js/bundled-app.js"
    },

    output: {
        path: path.join(__dirname, "public"),
        filename: "js/dist/[name].bundle.js"
    },
    
    module: {
        noParse: [
            new RegExp(lib_dir + './react.js'),
            new RegExp(lib_dir + './react-dom.js')
        ],

        loaders: [
            // { 
            //     test: /\.js?$/, 
            //     loaders: ['react-hot'],
            //     include: path.join(__dirname, 'public')

            // },
            { 
               loader: 'babel', //'jsx-loader'
                query: {
                    presets: ['react', 'es2015']
                },
                include: path.join(__dirname, 'public')
            }, 
        ]
    }
};


module.exports = config;

