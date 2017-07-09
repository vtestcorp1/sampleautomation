/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview Service that holds a sage data sources.
 * Note that currently we keep a global sage data sources
 * array. Ideally we can have multiple sage data scopes.
 */

import {ngRequire, Provide} from '../../../base/decorators';

Provide('sageDataScopeService') ({
    getSources,
    setSources,
    updateSourcesName,
    subscribeToSourcesChanged,
    isSourceSelected
});

let jsUtil: any = ngRequire('jsUtil');

// Map of current selection.
let sources: {[id: string] : boolean} = {};
let sourcesIdToSourcesName = {};
let listeners: { [id: string]: (id: string, name: string) => void} = {};

export function getSources(): string[] {
    return Object.keys(sources);
}

export function isSourceSelected(id: string) : boolean {
    return !!sources[id];
}

export function setSources(dataScope: string[]) {
    dataScope = dataScope || [];
    sources = {};
    dataScope.forEach((id: string) => {
        sources[id] = true;
    });
    fireListeners();
}

export function updateSourcesName(updatedSourcesIdsToSourcesName: { [idx: string] :string}) {
    let sourceIds = Object.keys(updatedSourcesIdsToSourcesName);
    if (!sourceIds) {
        return;
    }

    sourceIds.forEach((sourceId) => {
            sourcesIdToSourcesName[sourceId] = updatedSourcesIdsToSourcesName[sourceId];
        });
    fireListeners();
}

export function subscribeToSourcesChanged(fn: (id: string, name: string) => void): () => void {
    let id = jsUtil.generateUUID();
    listeners[id] = fn;
    return () => {
        return deregister(id);
    };
}

export function getActiveSourceName(): string[] {
    return Object.keys(sources).map((sourceId) => {
        return sourcesIdToSourcesName[sourceId] ? sourcesIdToSourcesName[sourceId] : sourceId;
    });
}

export function unionOfSources(arr1:string[], arr2:string[]): string[] {
    let set = new Set(arr1);
    arr2.forEach(source => set.add(source));
    return Array.from(set);
}

function fireListeners() {
    let sourcesArray = Object.keys(sources);
    Object.values(listeners).forEach(
        (listener) => listener(sourcesArray, sourcesIdToSourcesName)
    );
}

function deregister(id: string) {
    delete listeners[id];
}
