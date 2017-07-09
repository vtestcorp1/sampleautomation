
/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview A generic component that provided the ability to show images with
 * transparency with a grid underneath to highlight the transparent parts
 * of the image.
 */

import {BaseComponent} from 'src/base/base-types/base-component';
import {Component} from 'src/base/decorators';

@Component({
    name: 'bkImageView',
    templateUrl: 'src/common/widgets/image-view/image-view.html'
})
export class ImageViewComponent extends BaseComponent {
    constructor(private imageUrl: string) {
        super();
        this.setImageUrl(imageUrl);
    }

    public setImageUrl(imageUrl: string): void {
        this.imageUrl = imageUrl;
    }

    public getImageUrl(): string {
        return this.imageUrl;
    }
}
