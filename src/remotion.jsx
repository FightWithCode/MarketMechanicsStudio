import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Film, fps, size} from './video';

function Root() {
  return <Composition id="MarketMechanics" component={Film} width={1920} height={1080} fps={fps} durationInFrames={fps}
    calculateMetadata={({props})=>{
      const [width,height] = size(props.project.aspect);
      return {width,height,durationInFrames:Math.round(props.project.duration*fps)};
    }}/>;
}

registerRoot(Root);
