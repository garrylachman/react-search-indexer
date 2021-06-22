# react-search-indexer
React state indexer for better search

This library is just pretent to be a alegent way to solve simple problem in a long way :)
I can think about many ways to resolve this case, most of them better than this overkill solution - but still - i love all my children equally :) LOL

### The Issue we try to solve
#### The Problem
In case we have state that holds a long array of objects and we want to performe a simple search using `filter`. 
We have to check each key=value of the object or provide searchable keys - Its going to be ugly, messy & slow.

#### The Solution
The `useSearchIndexer` hook will create a searchable index, balance the indexing & the key extraction using local queue.
the hooks took 2 parameters, the first one is the state we want to index and the second is a options object.

Example of SearchIndexerOptions. DummyData is your Data interface
```ts
const indexerOptions:SearchIndexerOptions<DummyData> = {
  getItemKey: (item: DummyData, index: number) => `KEY-${item.id}`,
  itemFieldsExtractor: async (item:DummyData) => { 
    return [item.textOne, item.textTwo]
  },
  concurrency: 1
}
```
| Option  | Return | |
| ------------- | ------------- | ------------- |
| getItemKey  | String |  Return a uniqe row key  |
| itemFieldsExtractor | String[]  | The logic behinde the extraction of the searchable data. can be async or sync  |
| concurrency | int | how many con-currenct itemFieldsExtractor operations |

```ts
const [indexState, indexedState] = useSearchIndexer<DummyData>(dummyState, indexerOptions)
```
indexState is our index key=value map
indexedState is looks like our original state by not. lol, let me explain. its the same state but each object wraped with parent object that contains the 2 properties. `index` - our searchable string (concating itemFieldsExtractor result). `data` - the original state object.
Now the search became fast & easy.

```ts
const [searchTermState, setSearchTermState] = React.useState<string>('');
const searchResults = React.useMemo(() => Array.from(indexedState as []).filter((record:IndexState<DummyData>) => record.index.indexOf(searchTermState) > -1), [indexedState, searchTermState])
```

Now by settings the `searchTermState` state we trigger the searchResults Memo.

Storybook: https://garrylachman.github.io/react-search-indexer/
