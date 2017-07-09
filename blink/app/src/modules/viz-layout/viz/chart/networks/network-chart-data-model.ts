/**
 * Copyright Thoughtspot Inc. 2016
 * Author:  Chabbey Francois (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview This class takes datas from callosum and return
 * an array of node and links
 *
 * We are assuming series of the form
 *
 *   [ [ <Node1>, <Node2>, <linkValue> ] , [...] ]
 *
 *
 */

'use strict';


import {MapWithArray} from '../../../../../base/utils/ts-utils';
import {VisualizationColumnModel} from '../../../../callosum/model/visualization-column';
import {ChartModel} from '../chart-model';
import {ChartQueryDefinition} from '../chart-query-definition';

export class ChartNode {
    constructor(public key: string,
                public name: string,
                public baseColumnIndex: number,
                public value?: number) {}
}

export class ChartLink {
    constructor(public key: string,
                public value: number,
                public source: ChartNode,
                public target: ChartNode) {}
}

//TS will cast automatically for us when using this function
export function isChartLink(chartElement: ChartNode | ChartLink): chartElement is ChartLink {
    return (chartElement as ChartLink).source !== undefined;
}

export class NetworkChartDataModel {

    private _links: ChartLink[] = [];
    private _nodesMapById: MapWithArray<string, ChartNode> = new MapWithArray<string, ChartNode>();

    constructor(private chartModel: ChartModel) {
        this.init(chartModel);
        this.processData(chartModel);
    }

    get links(): ChartLink[] {
        return this._links;
    }

    get nodes(): ChartNode[] {
        return this._nodesMapById.getArray();
    }

    public getNodeByKey(id: string): ChartNode {
        return this._nodesMapById.getElementByKey(id);
    }

    private init(chartModel: ChartModel) {
        // TODO(chab) remove if not used
    }

    private addNodeToDictionaryIfNeeded(key: string,
                                        name: string,
                                        baseColumnIndex: number) {
        let node: ChartNode = this.getNodeByKey(key);
        if (!node) {
            node = new ChartNode(
                key,
                name,
                baseColumnIndex
            );
            this._nodesMapById.addElement(key, node);
        }
        return node;
    }

    private processData(chartModel: ChartModel) {
        // Note(chab) determine what we want to do with Null Values (here or downstream?)
        let dataArray = chartModel.getDataArray();
        let queryDefinitions: ChartQueryDefinition[] = chartModel.getQueryDefinitions();
        this._links = dataArray.reduce((links, linksArray, idx) =>
            links.concat(this.processLinksArray(
                linksArray.getData(),
                queryDefinitions[idx].xAxisColumns[0],
                queryDefinitions[idx].xAxisColumns[1],
                queryDefinitions[idx].yAxisColumns[0])),
            []);
    }
    private processLinksArray(links: Array<Array<any>>,
                              sourceColumn: VisualizationColumnModel,
                              targetColumn: VisualizationColumnModel,
                              valueColumn: VisualizationColumnModel): ChartLink[] {

        let sourceColumnId = sourceColumn.getId(),
            sourceColumnDataIndex = sourceColumn.getDataRowIndex(),
            targetColumnId = targetColumn.getId(),
            targetColumnDataIndex = targetColumn.getDataRowIndex(),
            valueColumnDataIndex = valueColumn.getDataRowIndex(),
            sourceColumnIndex = this.chartModel.getXAxisColumns()
                .findIndex(c => c.getId() === sourceColumnId),
            targetColumnIndex = this.chartModel.getXAxisColumns()
                .findIndex(c => c.getId() === targetColumnId);

        // we compute a key for each links, keys is based on <nodeSourceKey-nodeTargetKey>
        // we compute a key for each node, keys is <column-nodeValue>
        return links.map((link: any[]) => {
            let sourceName = link[sourceColumnDataIndex],
                targetName = link[targetColumnDataIndex],
                value = link[valueColumnDataIndex],
                sourceNodeKey = `${sourceColumnId}-${sourceName}`,
                targetNodeKey = `${targetColumnId}-${targetName}`,
                source = this.addNodeToDictionaryIfNeeded(sourceNodeKey,
                    sourceName,
                    sourceColumnIndex),
                target = this.addNodeToDictionaryIfNeeded(targetNodeKey,
                    targetName,
                    targetColumnIndex);
            return new ChartLink(
                `${sourceNodeKey}-${targetNodeKey}`,
                value,
                source,
                target,
            );
        });
    }
}

