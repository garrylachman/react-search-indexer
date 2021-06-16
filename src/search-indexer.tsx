import React from 'react';
import PQueue from 'p-queue/dist';

export interface IndexState<T> {
    [key: string]: {
        index: string | null,
        data: T
    }
}


function useIndexerQueue<T>(setIndex:React.Dispatch<React.SetStateAction<IndexState<T>>>, concurrency: number = 1) {
    const queue = React.useMemo(() => new PQueue({concurrency: concurrency}), []);
    const add = React.useCallback(async (task) => {
        const res:IndexState<T> = await queue.add(task);
        setIndex((prevState:IndexState<T>) => ({...prevState, ...res}));

    }, [queue]);


    return add;
}

export interface SearchIndexerOptions<T> {
    getItemKey: (item:T, index: number) => string;
    itemFieldsExtractor: (item:T) => string[] | Promise<string[]>;
    concurrency?: number
}

function defaultOptions<T>(state: T[]):SearchIndexerOptions<T> {
    return {
        getItemKey: (item: T, index: number) => `${index}`,
        itemFieldsExtractor: (item: T) => Object.values(item),
        concurrency: 1
    }
}

const initialState:IndexState<any> = {}

type DataWithKey<T> = {
    key: string;
    data: T
}

export function useSearchIndexer<T>(state:T[], options:SearchIndexerOptions<T>) {
    const _options:SearchIndexerOptions<T> = React.useMemo(() => {
        return {
            ...defaultOptions<T>(state),
            ...options
        }
    }, [options]);

    const [indexState, setIndexState] = React.useState<IndexState<T>>(initialState)
    const addToQueue = useIndexerQueue(setIndexState, _options.concurrency);

    React.useEffect(() => {
        // map data with thrier keys
        const dataWithKeys:DataWithKey<T>[] = [...state]
            .map((value: T, index: number):DataWithKey<T> => ({
                key: _options.getItemKey(value, index),
                data: value
            }))

        // add to queue 

        dataWithKeys.forEach((value: DataWithKey<T>, index: number) => {
            if (indexState[value.key] == null) {
                addToQueue( async () => {
                    const _index = await _options.itemFieldsExtractor(value.data);
                    return {
                        [`${value.key}`]: {
                            index: _index.join(","),
                            data: value.data
                        }
                    }
                })
            }
        })

        // put index placeholers, the data extractor run async
        const onlyKeys = Object.fromEntries(dataWithKeys.map(v => [v.key, { index: null, data: v.data}]))
        // first assign keys without index, after that prev state that hold data for proccesed keys
        setIndexState((prevState:IndexState<T>) => ({...onlyKeys, ...prevState}));

    }, [state])

    const indexedState:{
        index: string | null,
        data: T
    }[] = React.useMemo(() => Object.values(indexState).filter((item) => item.index != null), [indexState])

    return [indexState, indexedState];
}