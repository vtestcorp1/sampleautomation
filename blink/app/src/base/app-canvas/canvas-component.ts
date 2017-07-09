/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This is the base component for any canvas level component.
 * This class defines the interaction between app canvas and the component.
 */

export interface CanvasComponent {
    onCanvasStateChange(params: {[paramName: string]: string});
}
