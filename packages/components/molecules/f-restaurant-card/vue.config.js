const path = require('path');

const rootDir = path.join(__dirname, '..', '..');
const assetsPlugin = require('postcss-assets');
const sassOptions = require('../../../../config/sassOptions')(rootDir);

// vue.config.js
module.exports = {
    chainWebpack: config => {
        config.module
            .rule('scss-importer')
            .test(/\.scss$/)
            .use('importer')
            .loader('sass-loader')
            .options({
                ...sassOptions,
                /**
                 * Requires sass-loader 7.3.1 - works out the relative path for the common.scss file for each component
                 *
                 * @param resourcePath
                 * @returns {string}
                 */
                additionalData (content, { resourcePath, rootContext }) {
                    const relativePath = path.relative(rootContext, resourcePath);
                    const levelsUpToSrc = relativePath.split(path.sep).reverse().indexOf('src');

                    // Only attempt to add common styles when under a src dir
                    if (levelsUpToSrc === -1) {
                        return `${content}`;
                    }

                    const absPath = path.join(
                        resourcePath,
                        ...(new Array(levelsUpToSrc).fill('..')),
                        'assets/scss/common.scss'
                    );
                    const relPath = path.relative(path.dirname(resourcePath), absPath)
                        .replace(new RegExp(path.sep.replace('\\', '\\\\'), 'g'), '/');

                    return `@import "${relPath}";
                            ${content}`;
                }
            });
    },

    css: {
        loaderOptions: {
            postcss: {
                plugins: [
                    assetsPlugin
                ]
            }
        }
    },

    pluginOptions: {
        lintStyleOnBuild: true
    }
};
