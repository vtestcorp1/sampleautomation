/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview A common interface that all our custom vector based layers implement.
 */

import BaseVectorSource from '../sources/base-vector-source';

interface IGeoVectorLayer {
    getVectorSource(): BaseVectorSource;
}

export default IGeoVectorLayer;
