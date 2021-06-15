import React from 'react';
import { Story, Meta } from '@storybook/react';

import { useSearchIndexer, SearchIndexerOptions, IndexState } from './search-indexer'

const sleep = (milliseconds:number) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

interface DummyData {
  id: number,
  textOne: string,
  textTwo: string
}

const randomString = (n:number, r:string|number=''):string => {
  while (n--) r += String.fromCharCode((r=Math.random()*62|0, r+=r>9?(r<36?55:61):48));
  return r as string;
};

const initialDummyState: DummyData[] = [
  {
    id: 0,
    textOne: randomString(20),
    textTwo: randomString(30)
  }
]

interface StoryArgs {
  delay: number,
  numOfDummyRecords: number
}

const Template: Story<StoryArgs> = (args: StoryArgs) => {

  const [dummyState, setDummyState] = React.useState<DummyData[]>(initialDummyState);
  const indexerOptions:SearchIndexerOptions<DummyData> = {
    getItemKey: (item: DummyData, index: number) => `KEY-${item.id}`,
    itemFieldsExtractor: async (item:DummyData) =>{
      if (args.delay > 0) {
        await sleep(args.delay*1000);
      }
      return [item.textOne, item.textTwo]
    },
    concurrency: 1
  }
  const [indexState, indexedState] = useSearchIndexer<DummyData>(dummyState, indexerOptions)

  const addData = React.useCallback(() => {
    let lastID = dummyState[dummyState.length-1].id;
    const addState:DummyData[] = [...Array(args.numOfDummyRecords)].map(() => ({
      id: ++lastID,
      textOne: randomString(20),
      textTwo: randomString(30)
    }));
    console.log("add", addState)
    setDummyState(oldState => ([...oldState, ...addState]));
  }, [dummyState]);

  React.useEffect(() => {
    console.log("effect", dummyState)
  }, [dummyState])

  const [searchTermState, setSearchTermState] = React.useState<string>('');
  const searchResults = React.useMemo(() => indexedState.filter((record:IndexState<DummyData>) => record.index.indexOf(searchTermState) > -1), [indexedState, searchTermState])

  return (
    <>
      <h2>Prepare Data</h2>
      
      <button onClick={addData}>Add & Index {args.numOfDummyRecords} Records</button>
      <div>
        Dummy records: {dummyState.length}
      </div>
      <div>
        Indexed records: {indexedState.length}
      </div>

      <h2>Search</h2>
      <input value={searchTermState} onChange={(event) => setSearchTermState(event.target?.value)} />

      <h2>Results</h2>
      {searchResults && 
        searchResults.map((item, index) => (<div>{JSON.stringify(item.data)}</div>))
      }
    </>
  )
}

export default {
  title: 'useSearchIndexer',
  component: Template,
  argTypes: {
 
  },
} as Meta;

export const Search = Template.bind({});
Search.args = {
  numOfDummyRecords: 10
}