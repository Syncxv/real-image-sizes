/** @type {import('../../../fake_node_modules/powercord/entities/').default} */
const { Plugin } = require('powercord/entities');
const { inject, uninject } = require('powercord/injector');
const { getModule } = require('powercord/webpack');
const { findInReactTree } = require('powercord/util');

class RealImageSizes extends Plugin {
    startPlugin() {
        const LazyImageModule = getModule((m) => m?.default?.displayName === 'LazyImage', false);
        inject(`${this.entityID}-LazyImage-getHeight`, LazyImageModule.default.prototype, 'getHeight', function () {
            return this.props.height;
        });
        inject(`${this.entityID}-LazyImage-getWidth`, LazyImageModule.default.prototype, 'getWidth', function () {
            return this.props.width;
        });

        const ImageComponent = getModule((m) => m.displayName === 'Image', false);
        inject(`${this.entityID}-Image-render`, ImageComponent.prototype, 'render', (_, res) => {
            const img = findInReactTree(res, (p) => p.src);
            const urlObj = new URL(img.src);
            urlObj.searchParams.delete('width');
            urlObj.searchParams.delete('height');
            img.src = urlObj.toString();
            return res;
        });
    }

    pluginWillUnload() {
        uninject(`${this.entityID}-LazyImage-getHeight`);
        uninject(`${this.entityID}-LazyImage-getWidth`);
        uninject(`${this.entityID}-Image-render`);
    }
}

module.exports = RealImageSizes;
