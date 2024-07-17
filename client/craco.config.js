const TerserPlugin = require("terser-webpack-plugin");
const isProd = process.env.NODE_ENV === "production";

module.exports = {
    webpack: {
        configure: (webpackConfig, { env, paths }) => {
            webpackConfig.optimization.minimize = isProd;
            webpackConfig.optimization.minimizer = [
                new TerserPlugin({
                    terserOptions: {
                        compress: {
                            drop_console: isProd,
                        },
                        output: {
                            comments: false,
                        },
                        mangle: false,
                    },
                }),
            ];
            return webpackConfig;
        },
    },
};