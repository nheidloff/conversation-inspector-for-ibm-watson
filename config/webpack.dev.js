/**
 * @author: @AngularClass
 * and some modifications from IBM
 */

const helpers = require('./helpers');
const webpackMerge = require('webpack-merge'); // used to merge webpack configs
const commonConfig = require('./webpack.common.js'); // the settings that are common to prod and dev
/**
 * Webpack Plugins
 */
const DefinePlugin = require('webpack/lib/DefinePlugin');
const NamedModulesPlugin = require('webpack/lib/NamedModulesPlugin');

/**
 * Webpack Constants
 */
const ENV = process.env.ENV = process.env.NODE_ENV = 'development';
const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 3000;
const HMR = helpers.hasProcessFlag('hot');
const BOT_ENDPOINT = process.env.BOT_ENDPOINT || 'http://localhost:3002';
const METADATA = webpackMerge(commonConfig({env: ENV}).metadata, {
  host: HOST,
  port: PORT,
  ENV: ENV,
  HMR: HMR
});

/**
 * Webpack configuration
 *
 * See: http://webpack.github.io/docs/configuration.html#cli
 */
module.exports = function(options) {
  return webpackMerge(commonConfig({env: ENV}), {

    /**
     * Merged metadata from webpack.common.js for index.html
     *
     * See: (custom attribute)
     */
    metadata: METADATA,

    /**
     * Switch loaders to debug mode.
     *
     * See: http://webpack.github.io/docs/configuration.html#debug
     */
    debug: true,

    /**
     * Developer tool to enhance debugging
     *
     * See: http://webpack.github.io/docs/configuration.html#devtool
     * See: https://github.com/webpack/docs/wiki/build-performance#sourcemaps
     */
    devtool: 'cheap-module-source-map',

    /**
     * Options affecting the output of the compilation.
     *
     * See: http://webpack.github.io/docs/configuration.html#output
     */
    output: {

      /**
       * The output directory as absolute path (required).
       *
       * See: http://webpack.github.io/docs/configuration.html#output-path
       */
      path: helpers.root('dist'),

      /**
       * Specifies the name of each output file on disk.
       * IMPORTANT: You must not specify an absolute path here!
       *
       * See: http://webpack.github.io/docs/configuration.html#output-filename
       */
      filename: '[name].bundle.js',

      /**
       * The filename of the SourceMaps for the JavaScript files.
       * They are inside the output.path directory.
       *
       * See: http://webpack.github.io/docs/configuration.html#output-sourcemapfilename
       */
      sourceMapFilename: '[name].map',

      /** The filename of non-entry chunks as relative path
       * inside the output.path directory.
       *
       * See: http://webpack.github.io/docs/configuration.html#output-chunkfilename
       */
      chunkFilename: '[id].chunk.js',

      library: 'ac_[name]',
      libraryTarget: 'var',
    },

    plugins: [

      /**
       * Plugin: DefinePlugin
       * Description: Define free variables.
       * Useful for having development builds with debug logging or adding global constants.
       *
       * Environment helpers
       *
       * See: https://webpack.github.io/docs/list-of-plugins.html#defineplugin
       */
      // NOTE: when adding more properties, make sure you include them in custom-typings.d.ts
      new DefinePlugin({
        'ENDPOINT_AUTH_TOKEN': JSON.stringify(METADATA.endpointAuthToken),
        'END_USER_APP': JSON.stringify({ url: "https://localhost:4200/"}),
        'BLUEMIX_AUTH': JSON.stringify({
          clientId: "watson-personal-assistant",
          clientSecret: "HFKjlJFDGFCflkjlj",
          serviceUrl: "https://login.ng.bluemix.net/UAALoginServerWAR", // Bluemix public ng
          //serviceUrl: "https://login.stage1.ng.bluemix.net/UAALoginServerWAR", // Bluemix stage1 ng
          callback: "http://localhost:3000"
        }),
        "ACCESS_TOKEN_PROVIDERS": JSON.stringify({
            "gmail":{
                "verify_url":"https://www.googleapis.com/oauth2/v3/tokeninfo",
                "refresh_url":"https://www.googleapis.com/oauth2/v4/token"
            }
        }),
        'ENV': JSON.stringify(METADATA.ENV),
        'HMR': METADATA.HMR,
        'process.env': {
          'ENDPOINT_AUTH_TOKEN': JSON.stringify(METADATA.endpointAuthToken),
          'ENV': JSON.stringify(METADATA.ENV),
          'NODE_ENV': JSON.stringify(METADATA.ENV),
          'HMR': METADATA.HMR
        }
      }),

      /**
         * Plugin: NamedModulesPlugin (experimental)
         * Description: Uses file names as module name.
         *
         * See: https://github.com/webpack/webpack/commit/a04ffb928365b19feb75087c63f13cadfc08e1eb
         */
        new NamedModulesPlugin(),

    ],

    /**
     * Static analysis linter for TypeScript advanced options configuration
     * Description: An extensible linter for the TypeScript language.
     *
     * See: https://github.com/wbuchwalter/tslint-loader
     */
    tslint: {
      emitErrors: false,
      failOnHint: false,
      resourcePath: 'src'
    },

    /**
     * Webpack Development Server configuration
     * Description: The webpack-dev-server is a little node.js Express server.
     * The server emits information about the compilation state to the client,
     * which reacts to those events.
     *
     * See: https://webpack.github.io/docs/webpack-dev-server.html
     */
    devServer: {
      port: METADATA.port,
      host: METADATA.host,
      historyApiFallback: true,
      watchOptions: {
        aggregateTimeout: 300,
        poll: 1000
      },
      outputPath: helpers.root('dist'),
      proxy: {       
        '/api/v1/namespaces/': {
          target: 'https://openwhisk.ng.bluemix.net', // Bluemix public ng
          //target: 'https://openwhisk.stage1.ng.bluemix.net', // Bluemix stage1 ng
          changeOrigin: true,
          protocolRewrite: 'https',
          logLevel: 'debug',
          secure: false
        },
        '/bluemix/': {
          target: 'https://openwhisk.ng.bluemix.net', // Bluemix public ng
          //target: 'https://openwhisk.stage1.ng.bluemix.net', // Bluemix stage1 ng
          changeOrigin: true,
          protocolRewrite: 'https',
          logLevel: 'debug',
          secure: false
        },
        '/conversation/api/': {
          target: 'https://gateway.watsonplatform.net', // Bluemix public ng
          //target: 'https://gateway-s.watsonplatform.net', // Bluemix stage1 ng
          changeOrigin: true, 
          protocolRewrite: 'https',
          logLevel: 'debug',
          secure: false
        },        
        '/UAALoginServerWAR': {
          target: 'https://login.ng.bluemix.net', // Bluemix public ng
          //target: 'https://login.stage1.ng.bluemix.net', // Bluemix stage1 ng
          changeOrigin: true,
          protocolRewrite: 'https',
          logLevel: 'debug',
          secure: false
        },
        '/v2': {
          target: 'https://api.ng.bluemix.net', // Bluemix public ng
          //target: 'https://api.stage1.ng.bluemix.net', // Bluemix stage1 ng
          changeOrigin: true, 
          protocolRewrite: 'https',
          logLevel: 'debug',
          secure: false
        },      
        '/endpoint': {
          // target: 'http://endpoint.mybluemix.net',
          target: BOT_ENDPOINT,
          changeOrigin: true, 
          protocolRewrite: 'https',
          logLevel: 'debug',
          secure: false
        },
        '/account': {
          // target: 'http://endpoint.mybluemix.net',
          target: 'http://localhost:3002',
          changeOrigin: true,
          protocolRewrite: 'https',
          logLevel: 'debug',
          secure: false
        },
        '/wpa': {
          target: 'https://localhost:3001',
          changeOrigin: true,   // for vhosted sites
          protocolRewrite: 'https',
          logLevel: 'debug',
          secure: false
        },
        '/listings': {
          target: 'https://watson-api-explorer.mybluemix.net',
          changeOrigin: true,   // for vhosted sites
          protocolRewrite: 'https',
          logLevel: 'debug',
          secure: false
        }
      }
    },

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

  });
}
