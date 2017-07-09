/**
 * Copyright: ThoughtSpot Inc. 2012-2017
 * Author: Priyanshi Deshwal (priyanshi@thoughtspot.com)
 *
 * @fileoverview
 */

import {Component} from '../../base/decorators';
import {strings} from '../../base/strings';
import {CustomStylingService} from '../custom-styling/custom-styling-service';

@Component({
    name: 'bkPoweredFooter',
    templateUrl: 'src/modules/powered-footer/powered-footer.html'
})


export class PoweredFooterComponent {
    public logoTextPart1: string;
    public logoTextPart2: string;
    constructor() {
        this.logoTextPart1 = strings.poweredFooter.logo_title_part1;
        this.logoTextPart2 = strings.poweredFooter.logo_title_part2;
    }

    public setFooterTextValue(): string {
        return CustomStylingService.getConfig().getFooterText();
    }
}
