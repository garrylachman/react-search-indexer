import React from 'react';
import { Story, Meta } from '@storybook/react';

import { useSearchIndexer, SearchIndexerOptions, IndexState } from './search-indexer'
import Highlight from 'react-highlight';
import 'highlight.js/styles/default.css'

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
    setDummyState(oldState => ([...oldState, ...addState]));
  }, [dummyState]);

  const [searchTermState, setSearchTermState] = React.useState<string>('');
  const searchResults = React.useMemo(() => Array.from(indexedState as []).filter((record:IndexState<DummyData>) => record.index.indexOf(searchTermState) > -1), [indexedState, searchTermState])

  return (
    <>
     <Highlight className='javascript'>
      {`
        import { useSearchIndexer, SearchIndexerOptions, IndexState } from './search-indexer'
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

        const App = () => {
          const [dummyState, setDummyState] = React.useState<DummyData[]>(initialDummyState);
          const indexerOptions:SearchIndexerOptions<DummyData> = {
            getItemKey: (item: DummyData, index: number) => 'KEY-' + item.id,
            itemFieldsExtractor: async (item:DummyData) =>{
              return [item.textOne, item.textTwo]
            },
            concurrency: 1
          }
          const [indexState, indexedState] = useSearchIndexer<DummyData>(dummyState, indexerOptions)

          React.useEffect(() => {
            let lastID = 0;
            const addState:DummyData[] = [...Array(100)].map(() => ({
              id: ++lastID,
              textOne: randomString(20),
              textTwo: randomString(30)
            }));
            setDummyState(oldState => ([...oldState, ...addState]));
          }, [])

          const [searchTermState, setSearchTermState] = React.useState<string>('');
          const searchResults = React.useMemo(() => Array.from(indexedState as []).filter((record:IndexState<DummyData>) => record.index.indexOf(searchTermState) > -1), [indexedState, searchTermState])

          return (
            <>
            /// use here searchResults for search results
            </>
          )
        }

        export default App
      `}
    </Highlight>
      <h2>Prepare Data</h2>
      
      <button onClick={addData}>Add & Index {args.numOfDummyRecords} Records</button>
      <div style={{flex: 1, flexDirection: 'row', display: 'flex', paddingTop: 5}}>
        <div style={{flex: 1}}>
          Dummy records: {dummyState.length}
        </div>
        <div style={{flex: 1}}>
          Indexed records: {indexedState.length}
        </div>
      </div>
      
      <h2>Search</h2>
      <input value={searchTermState} onChange={(event) => setSearchTermState(event.target?.value)} />

      <h2>Results ({searchResults && searchResults.length})</h2>
      <div>
        <div style={{flex: 1, flexDirection: 'row', display: 'flex', fontWeight: 'bold', paddingBottom: 5}}>
          <div style={{flex: 1, flexDirection: 'column'}}>ID</div>
          <div style={{flex: 5, flexDirection: 'column'}}>textOne</div>
          <div style={{flex: 5, flexDirection: 'column'}}>textTwo</div>
        </div>
      {searchResults && 
        searchResults.slice(-10).map((item, index) => (
        <div style={{flex: 1, flexDirection: 'row', display: 'flex'}} key={`row-${index}`}>
          <div style={{flex: 1, flexDirection: 'column'}}>{item.data.id}</div>
          <div style={{flex: 5, flexDirection: 'column'}}>{item.data.textOne}</div>
          <div style={{flex: 5, flexDirection: 'column'}}>{item.data.textTwo}</div>
        </div>))
      }
      </div>
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