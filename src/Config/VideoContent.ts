import type { VideoExample } from '../Component/VideoSection'
import example01 from '../Source/video/dialogue_continuation/01.mp4'
import example02 from '../Source/video/dialogue_continuation/02.mp4'

// Add new examples here; the player layout is shared by every video section.
export const dialogueContinuation = {
  id: 'dialogue-continuation',
  title: 'Dialogue Continuation',
  description: 'The model continues both speakers after the dashed line.',
  videos: [
    { id: 'example-01', title: 'Example 01', src: example01 },
    { id: 'example-02', title: 'Example 02', src: example02 },
  ] satisfies VideoExample[],
}
