/**
 * @author: @AngularClass
 * and some modifications from IBM
 */

const webpack = require('webpack');
const helpers = require('./helpers');

const fs = require('fs');
const path = require('path');
const gzip = require("zlib").gzip;

/*
 * Webpack Plugins
 */
// problem with copy-webpack-plugin
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
//const ForkCheckerPlugin = require('awesome-typescript-loader').ForkCheckerPlugin;
const { CheckerPlugin } = require('awesome-typescript-loader')
const HtmlElementsPlugin = require('./html-elements-plugin');
const AssetsPlugin = require('assets-webpack-plugin');

/*
 * Since not part of the webpack runtime, it needs to be told separately
 * where the roots of the source and destination are for a particular
 * invocation.
 */
var gziptee = function(src, dest) {
  const gzipSmallerThan = 0.8;

  function mkdirhier(dir) {
    if(path.resolve('.').length < dir.length) {
      mkdirhier(path.dirname(dir));
    }
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, 0777 & (~process.umask()));
    }
  }

  var gzipper = function(content, _path) {
    gzip(content, function(err, result) {
      if (err) {
        console.error(err);
      }
      else {
        if((result.length / content.length) < gzipSmallerThan) {
          var gzpath = path.resolve('.', path.join(dest, path.relative(src, _path)) + '.gz');
          // The file hasn't been copied yet, so its parent might not exist yet
          mkdirhier(path.dirname(gzpath));
          fs.writeFile(gzpath, result);
        }
      }
    });
    return content;
  }
  return gzipper;
}

/*
 * Webpack Constants
 */
const HMR = helpers.hasProcessFlag('hot');
const METADATA = {
  title: 'Conversation Inspector for IBM Watson',
  baseUrl: '/',
  isDevServer: helpers.isWebpackDevServer(),
  endpointAuthToken: 'botlandtoken'
};

/*
 * Webpack configuration
 *
 * See: http://webpack.github.io/docs/configuration.html#cli
 */
module.exports = function(options) {
  var isProd = options.env === 'production';
  return {

    /*
     * Static metadata for index.html
     *
     * See: (custom attribute)
     */
    metadata: METADATA,

    /*
     * Cache generated modules and chunks to improve performance for multiple incremental builds.
     * This is enabled by default in watch mode.
     * You can pass false to disable it.
     *
     * See: http://webpack.github.io/docs/configuration.html#cache
     */
     //cache: false,

    /*
     * The entry point for the bundle
     * Our Angular.js app
     *
     * See: http://webpack.github.io/docs/configuration.html#entry
     */
    entry: {
      'polyfills': './src/polyfills.browser.ts',
      'vendor':    './src/vendor.browser.ts',
      'main':      './src/main.browser.ts'
    },

    /*
     * Options affecting the resolving of modules.
     *
     * See: http://webpack.github.io/docs/configuration.html#resolve
     */
    resolve: {

      /*
       * An array of extensions that should be used to resolve modules.
       *
       * See: http://webpack.github.io/docs/configuration.html#resolve-extensions
       */
      extensions: ['', '.ts', '.js', '.json'],

      // Make sure root is src
      root: helpers.root('src'),

      // remove other default values
      modulesDirectories: ['node_modules'],

    },

    /*
     * Options affecting the normal modules.
     *
     * See: http://webpack.github.io/docs/configuration.html#module
     */
    module: {

      /*
       * An array of applied pre and post loaders.
       *
       * See: http://webpack.github.io/docs/configuration.html#module-preloaders-module-postloaders
       */
      preLoaders: [
        {
          test: /\.ts$/,
          loader: 'string-replace-loader',
          query: {
            search: '(System|SystemJS)(.*[\\n\\r]\\s*\\.|\\.)import\\((.+)\\)',
            replace: '$1.import($3).then(mod => (mod.__esModule && mod.default) ? mod.default : mod)',
            flags: 'g'
          },
          include: [helpers.root('src')]
        },

      ],

      /*
       * An array of automatically applied loaders.
       *
       * IMPORTANT: The loaders here are resolved relative to the resource which they are applied to.
       * This means they are not resolved relative to the configuration file.
       *
       * See: http://webpack.github.io/docs/configuration.html#module-loaders
       */
      loaders: [
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&mimetype=application/font-woff" },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader" },
        /*
         * Typescript loader support for .ts and Angular 2 async routes via .async.ts
         * Replace templateUrl and stylesUrl with require()
         *
         * See: https://github.com/s-panferov/awesome-typescript-loader
         * See: https://github.com/TheLarkInn/angular2-template-loader
         */
        {
          test: /\.ts$/,
          loaders: [
            '@angularclass/hmr-loader?pretty=' + !isProd + '&prod=' + isProd,
            'awesome-typescript-loader',
            'angular2-template-loader'
          ],
          exclude: [/\.(spec|e2e)\.ts$/]
        },

        /*
         * Json loader support for *.json files.
         *
         * See: https://github.com/webpack/json-loader
         */
        {
          test: /\.json$/,
          loader: 'json-loader'
        },

        /*
         * to string and css loader support for *.css files
         * Returns file content as string
         *
         */
        {
          test: /\.css$/,
          loaders: ['to-string-loader', 'css-loader']
        },

        /* Raw loader support for *.html
         * Returns file content as string
         *
         * See: https://github.com/webpack/raw-loader
         */
        {
          test: /\.html$/,
          loader: 'raw-loader',
          exclude: [helpers.root('src/index.html')]
        },

        /* File loader for supporting images, for example, in CSS files.
        */
        {
          test: /\.(jpg|png|gif)$/,
          loader: 'file'
        },
        {  
          test: /.less$/, 
          exclude: [path.join(__dirname, './node_modules'), /^\/node_modules$/, /node_modules/, helpers.root('node_modules')],
          include: path.join(__dirname, '../src/assets/less'), 
          loader: 'raw-loader!less-loader' 
        }
        // { test: /\.js$/, loader: 'es6-loader' }
      ]

    },

    /*
     * Add additional plugins to the compiler.
     *
     * See: http://webpack.github.io/docs/configuration.html#plugins
     */
    plugins: [

    new webpack.ContextReplacementPlugin(
      /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
      __dirname
    ),

      new AssetsPlugin({
        path: helpers.root('dist'),
        filename: 'webpack-assets.json',
        prettyPrint: true
      }),

      /*
       * Plugin: ForkCheckerPlugin
       * Description: Do type checking in a separate process, so webpack don't need to wait.
       *
       * See: https://github.com/s-panferov/awesome-typescript-loader#forkchecker-boolean-defaultfalse
       */
      //new ForkCheckerPlugin(),
      new CheckerPlugin(),
      /*
       * Plugin: CommonsChunkPlugin
       * Description: Shares common code between the pages.
       * It identifies common modules and put them into a commons chunk.
       *
       * See: https://webpack.github.io/docs/list-of-plugins.html#commonschunkplugin
       * See: https://github.com/webpack/docs/wiki/optimization#multi-page-app
       */
      new webpack.optimize.CommonsChunkPlugin({
        name: ['polyfills', 'vendor'].reverse()
      }),

      /*
       * Plugin: CopyWebpackPlugin
       * Description: Copy files and directories in webpack.
       *
       * Copies project static assets.
       *
       * See: https://www.npmjs.com/package/copy-webpack-plugin
       */
       new CopyWebpackPlugin([
        {
          from: 'src/assets',
          to: 'assets',
          transform: gziptee('src/assets', 'dist/assets'),
          ignore: [
            '.gitkeep',
            '*.less'
          ]
        },
        {
          from: 'node_modules/bootstrap/dist',
          to: 'assets/bootstrap',
          transform: gziptee('node_modules/bootstrap/dist', 'dist/assets/bootstrap')
        },
        {
          from: 'node_modules/jszip/dist',
          to: 'assets/jszip',
          transform: gziptee('node_modules/jszip/dist', 'dist/assets/jszip')
        },
        {
          from: 'node_modules/html2canvas/dist',
          to: 'assets/html2canvas',
          transform: gziptee('node_modules/html2canvas/dist', 'dist/assets/html2canvas')
        },
        {
          from: 'node_modules/font-awesome',
          to: 'assets/font-awesome',
          transform: gziptee('node_modules/font-awesome', 'dist/assets/font-awesome'),
          ignore:[// tried using RegEx, but didn't work. had to list them out - Juan
            '*.less',
            '*.json',
            '*.txt',
            '*.md',
            '*.scss',
            '.npmignore'
          ]
        },        
        {
          from: 'node/package.json',
          to: ''
        },
        {
          from: 'node/server.js',
          to: ''
        },
        {
          from: 'node/watson.js',
          to: ''
        },
        {
          from: 'node/credentials.js',
          to: ''
        },
        {
          from: 'node/readCredentials.js',
          to: ''
        }
      ]),

      /*
       * Plugin: HtmlWebpackPlugin
       * Description: Simplifies creation of HTML files to serve your webpack bundles.
       * This is especially useful for webpack bundles that include a hash in the filename
       * which changes every compilation.
       *
       * See: https://github.com/ampedandwired/html-webpack-plugin
       */
      new HtmlWebpackPlugin({
        template: 'src/index.html',
        chunksSortMode: 'dependency'
      }),

      
    new webpack.ContextReplacementPlugin(
      /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
      __dirname
    ),


      /*
       * Plugin: HtmlHeadConfigPlugin
       * Description: Generate html tags based on javascript maps.
       *
       * If a publicPath is set in the webpack output configuration, it will be automatically added to
       * href attributes, you can disable that by adding a "=href": false property.
       * You can also enable it to other attribute by settings "=attName": true.
       *
       * The configuration supplied is map between a location (key) and an element definition object (value)
       * The location (key) is then exported to the template under then htmlElements property in webpack configuration.
       *
       * Example:
       *  Adding this plugin configuration
       *  new HtmlElementsPlugin({
       *    headTags: { ... }
       *  })
       *
       *  Means we can use it in the template like this:
       *  <%= webpackConfig.htmlElements.headTags %>
       *
       * Dependencies: HtmlWebpackPlugin
       */

new webpack.ProvidePlugin({
            jQuery: 'jquery',
            $: 'jquery',
            jquery: 'jquery'
        }),

        new webpack.ProvidePlugin({
            html2canvas: 'html2canvas'
        }),

        new webpack.ProvidePlugin({
            jszip: 'jszip',
            JSZip: 'jszip'
            
        }),

      new HtmlElementsPlugin({
        headTags: require('./head-config.common')
      }),

    ],

    /*
     * Include polyfills or mocks for various node stuff
     * Description: Node configuration
     *
     * See: https://webpack.github.io/docs/configuration.html#node
     */
    node: {
      global: 'window',
      crypto: 'empty',
      process: true,
      module: false,
      clearImmediate: false,
      setImmediate: false
    }

  };
}
