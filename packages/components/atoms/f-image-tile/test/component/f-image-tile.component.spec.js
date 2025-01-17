const ImageTile = require('../../test-utils/component-objects/f-image-tile.component');

const imageTile = new ImageTile();

describe('f-image-tile component tests', () => {
    beforeEach(() => {
        imageTile.load();
    });

    it('should display the f-image-tile component', () => {
        // Assert
        expect(imageTile.isComponentDisplayed()).toBe(true);
    });
});
