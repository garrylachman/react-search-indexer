import React from 'react';
import { Story, Meta } from '@storybook/react';
import {  } from '@storybook/csf'

import { useSearchIndexer, SearchIndexerOptions } from './search-indexer'

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


  return (
    <>
      <button onClick={addData}>Add & Index {args.numOfDummyRecords} Records</button>
      <div style={{flex: 1, flexDirection: 'row', display: 'flex', paddingTop: 5}}>
        <div style={{flex: 1}}>
          Dummy records: {dummyState.length}
        </div>
        <div style={{flex: 1}}>
          Indexed records: {indexedState.length}
        </div>
      </div>
    </>
  )
}


export default {
  title: 'useSearchIndexer',
  component: Template,
  argTypes: {
    delay: {
      control: {
        type: 'range', min: 0, max: 10, step: 1
      }
    }
  },
} as Meta;

export const Basic = Template.bind({});
Basic.args = {
  delay: 0,
  numOfDummyRecords: 10
}