import type { WaveformAudio } from '../Component/WaveformAudioPlayer'
import metadata from '../Source/audio/listening_study/metadata.json'
import audio01_prompt from '../Source/audio/listening_study/01_prompt.wav'
import audio01_csdlm from '../Source/audio/listening_study/01_csdlm.wav'
import audio01_dgslm from '../Source/audio/listening_study/01_dgslm.wav'
import audio01_groundTruth from '../Source/audio/listening_study/01_groundTruth.wav'
import audio02_prompt from '../Source/audio/listening_study/02_prompt.wav'
import audio02_csdlm from '../Source/audio/listening_study/02_csdlm.wav'
import audio02_dgslm from '../Source/audio/listening_study/02_dgslm.wav'
import audio02_groundTruth from '../Source/audio/listening_study/02_groundTruth.wav'
import audio03_prompt from '../Source/audio/listening_study/03_prompt.wav'
import audio03_csdlm from '../Source/audio/listening_study/03_csdlm.wav'
import audio03_dgslm from '../Source/audio/listening_study/03_dgslm.wav'
import audio03_groundTruth from '../Source/audio/listening_study/03_groundTruth.wav'
import audio04_prompt from '../Source/audio/listening_study/04_prompt.wav'
import audio04_csdlm from '../Source/audio/listening_study/04_csdlm.wav'
import audio04_dgslm from '../Source/audio/listening_study/04_dgslm.wav'
import audio04_groundTruth from '../Source/audio/listening_study/04_groundTruth.wav'
import audio05_prompt from '../Source/audio/listening_study/05_prompt.wav'
import audio05_csdlm from '../Source/audio/listening_study/05_csdlm.wav'
import audio05_dgslm from '../Source/audio/listening_study/05_dgslm.wav'
import audio05_groundTruth from '../Source/audio/listening_study/05_groundTruth.wav'
import audio06_prompt from '../Source/audio/listening_study/06_prompt.wav'
import audio06_csdlm from '../Source/audio/listening_study/06_csdlm.wav'
import audio06_dgslm from '../Source/audio/listening_study/06_dgslm.wav'
import audio06_groundTruth from '../Source/audio/listening_study/06_groundTruth.wav'
import audio07_prompt from '../Source/audio/listening_study/07_prompt.wav'
import audio07_csdlm from '../Source/audio/listening_study/07_csdlm.wav'
import audio07_dgslm from '../Source/audio/listening_study/07_dgslm.wav'
import audio07_groundTruth from '../Source/audio/listening_study/07_groundTruth.wav'
import audio08_prompt from '../Source/audio/listening_study/08_prompt.wav'
import audio08_csdlm from '../Source/audio/listening_study/08_csdlm.wav'
import audio08_dgslm from '../Source/audio/listening_study/08_dgslm.wav'
import audio08_groundTruth from '../Source/audio/listening_study/08_groundTruth.wav'

// All eight listening-study conversations; martial arts is displayed first.
export const listeningStudy = {
  participantCount: 12,
  conversationCount: 8,
  results: [
  {
    "id": "semantic",
    "label": "Semantic coherence",
    "description": "Whether the content is meaningful and relevant to the prompt.",
    "csdlm": {
      "mean": 4.166666666666667,
      "ci": 0.34258135280045676
    },
    "dgslm": {
      "mean": 1.90625,
      "ci": 0.6841506736500121
    },
    "groundTruth": {
      "mean": 4.052083333333333,
      "ci": 0.29996784201195204
    }
  },
  {
    "id": "turnTaking",
    "label": "Turn-taking naturalness",
    "description": "Appropriate timing of speaker changes, pauses, overlaps, and backchannels.",
    "csdlm": {
      "mean": 4.260416666666667,
      "ci": 0.2980500737624086
    },
    "dgslm": {
      "mean": 3.0416666666666665,
      "ci": 0.518408596696253
    },
    "groundTruth": {
      "mean": 4.145833333333333,
      "ci": 0.3798857564025676
    }
  },
  {
    "id": "speaker",
    "label": "Speaker similarity",
    "description": "Consistency of speaker identity with the prompt.",
    "csdlm": {
      "mean": 4.4375,
      "ci": 0.2382636327489892
    },
    "dgslm": {
      "mean": 2.0208333333333335,
      "ci": 0.6855810404555609
    },
    "groundTruth": {
      "mean": 4.5625,
      "ci": 0.17759122646426168
    }
  },
  {
    "id": "emotion",
    "label": "Emotional coherence",
    "description": "Whether emotional expression fits the context and spoken content.",
    "csdlm": {
      "mean": 4.21875,
      "ci": 0.30313716234381055
    },
    "dgslm": {
      "mean": 2.4791666666666665,
      "ci": 0.6150386827750861
    },
    "groundTruth": {
      "mean": 4.3125,
      "ci": 0.26772884738226826
    }
  },
  {
    "id": "audio",
    "label": "Audio quality",
    "description": "Clarity and absence of distortion or artifacts.",
    "csdlm": {
      "mean": 4.15625,
      "ci": 0.312452297241529
    },
    "dgslm": {
      "mean": 1.7916666666666667,
      "ci": 0.4899754879994745
    },
    "groundTruth": {
      "mean": 3.9270833333333335,
      "ci": 0.2633196353365311
    }
  },
  {
    "id": "overall",
    "label": "Overall conversational naturalness",
    "description": "Whether the continuation sounds like a natural conversation between two people.",
    "csdlm": {
      "mean": 4.09375,
      "ci": 0.24914611201877584
    },
    "dgslm": {
      "mean": 1.90625,
      "ci": 0.5847286288419976
    },
    "groundTruth": {
      "mean": 4.010416666666667,
      "ci": 0.24055900032728275
    }
  }
],
  examples: [
    { id: "example-01", title: "Example 01", topic: "Martial arts and boxing", prompt: { ...metadata.audio01_prompt, src: audio01_prompt } satisfies WaveformAudio, promptTranscript: [{"speaker": "B", "text": "back into the martial arts thing if it felt like I could do it without risking further injuries."}, {"speaker": "A", "text": "I've never done martial arts. It seems pretty intense."}], continuations: [{ model: "csdlm", label: "CSDLM (Ours)", audio: { ...metadata.audio01_csdlm, src: audio01_csdlm } satisfies WaveformAudio, transcript: [{"speaker": "A", "text": "I guess I could try a couple different martial arts and see what works best for me. I think I'd be more interested in boxing if I could do it without having to worry about being knocked out."}, {"speaker": "A", "text": "You ever watch boxing?"}, {"speaker": "B", "text": "Ah, yeah, I've seen boxing before. I'm not a huge fan of boxing, but..."}] }, { model: "dgslm", label: "dGSLM", audio: { ...metadata.audio01_dgslm, src: audio01_dgslm } satisfies WaveformAudio, transcript: [{"speaker": "A", "text": "but you say that they understand what's going on."}, {"speaker": "B", "text": "I'll ask you, like, up in a social arch."}, {"speaker": "A", "text": "I'm sorry, at certain systems."}, {"speaker": "B", "text": "And okay, I have to make them fool with it. That's on country witness by doing the different government, how to place the government staff."}, {"speaker": "A", "text": "Yeah."}] }, { model: "groundTruth", label: "Ground truth", audio: { ...metadata.audio01_groundTruth, src: audio01_groundTruth } satisfies WaveformAudio, transcript: [{"speaker": "B", "text": "a great workout."}, {"speaker": "A", "text": "don't know if I'd be..."}, {"speaker": "A", "text": "Yeah, yeah."}, {"speaker": "B", "text": "It's a great workout."}, {"speaker": "A", "text": "I actually...There's a type of martial arts that's become, I think, kind of popular lately. I forget what it's called, but it's what they..."}] }] },
    { id: "example-02", title: "Example 02", topic: "Letters from abroad", prompt: { ...metadata.audio02_prompt, src: audio02_prompt } satisfies WaveformAudio, promptTranscript: [{"speaker": "A", "text": "Or you haven't heard from him?"}, {"speaker": "B", "text": "Yeah, he writes letters every once in a while, but the mail is not that good over there, coming all the way over."}, {"speaker": "A", "text": "No, that's terrible. I mean, is he, like, last time you heard from him, was he afraid of being there?"}], continuations: [{ model: "csdlm", label: "CSDLM (Ours)", audio: { ...metadata.audio02_csdlm, src: audio02_csdlm } satisfies WaveformAudio, transcript: [{"speaker": "B", "text": "Yeah, yeah."}, {"speaker": "A", "text": "Yeah, or is he just..."}, {"speaker": "B", "text": "I just was afraid I had to send him a letter. I was afraid he was going to kill himself with something."}, {"speaker": "A", "text": "Oh, yeah."}, {"speaker": "A", "text": "Oh, no, that's just terrible."}, {"speaker": "B", "text": "And he got so sick one day, he got so sick he had to go to the hospital."}] }, { model: "dgslm", label: "dGSLM", audio: { ...metadata.audio02_dgslm, src: audio02_dgslm } satisfies WaveformAudio, transcript: [{"speaker": "A", "text": "Or, because it may be hard to work out of the work, everybody."}, {"speaker": "B", "text": "I'm signed there."}, {"speaker": "A", "text": "Um, but everything's going through the same terrorists that were not missing, like it varies without, from M Tatch"}, {"speaker": "B", "text": "I took a some thudsters too."}, {"speaker": "A", "text": "One five terrible thought protected to the country."}, {"speaker": "B", "text": "All right. Yeah. All right."}, {"speaker": "A", "text": "So I was getting more like, I could go in back."}] }, { model: "groundTruth", label: "Ground truth", audio: { ...metadata.audio02_groundTruth, src: audio02_groundTruth } satisfies WaveformAudio, transcript: [{"speaker": "A", "text": "Or was he optimistic?"}, {"speaker": "B", "text": "He said that the people were real nice, but the people were shooting at him, and I was like, that's not cool, man."}, {"speaker": "A", "text": "Yeah."}, {"speaker": "A", "text": "Yeah, I mean, we were supposed to go in there and, like, you know, and bring..."}] }] },
    { id: "example-03", title: "Example 03", topic: "Pets", prompt: { ...metadata.audio03_prompt, src: audio03_prompt } satisfies WaveformAudio, promptTranscript: [{"speaker": "A", "text": "Yeah, they do have definite personalities."}, {"speaker": "B", "text": "Like, they're distinctly different. Like, I could, like, think of a whole, like, persona for each of them, like what they would wear if they were human."}, {"speaker": "A", "text": "Uh-huh."}, {"speaker": "A", "text": "I agree. Yeah, we had a turtle last year,"}], continuations: [{ model: "csdlm", label: "CSDLM (Ours)", audio: { ...metadata.audio03_csdlm, src: audio03_csdlm } satisfies WaveformAudio, transcript: [{"speaker": "A", "text": "but it wasn't a pet, so it was a little different. But a turtle was kind of like, it's a pet, but not really, because you don't take it with you and stuff. But, um..."}, {"speaker": "B", "text": "Yeah, but I think my cats are always outside, and I think they really enjoy walking and stuff."}] }, { model: "dgslm", label: "dGSLM", audio: { ...metadata.audio03_dgslm, src: audio03_dgslm } satisfies WaveformAudio, transcript: [{"speaker": "A", "text": "My dog actually not reality shows, so that would be nice that it's just not for them. It's import elect anymore."}, {"speaker": "B", "text": "Well, what will make you worn a base do you know that other people?"}, {"speaker": "A", "text": "Yeah, that is. Yeah, it is. It's just a lot too many now."}] }, { model: "groundTruth", label: "Ground truth", audio: { ...metadata.audio03_groundTruth, src: audio03_groundTruth } satisfies WaveformAudio, transcript: [{"speaker": "A", "text": "my apartment. And same thing, it was kind of fun, and we'd get him out sometimes and make him crawl around, and we'd feed him. But you just don't get as attached to them."}, {"speaker": "B", "text": "Yeah."}, {"speaker": "A", "text": "I just said that my boyfriend's mom's house for dinner tonight."}] }] },
    { id: "example-04", title: "Example 04", topic: "Conversation topics", prompt: { ...metadata.audio04_prompt, src: audio04_prompt } satisfies WaveformAudio, promptTranscript: [{"speaker": "B", "text": "See?"}, {"speaker": "B", "text": "Not... not so far apart, although it sounds a bit far."}, {"speaker": "A", "text": "No."}, {"speaker": "A", "text": "No, it's- I-"}, {"speaker": "B", "text": "It's not."}, {"speaker": "A", "text": "I never pay attention to that stuff anyway."}, {"speaker": "B", "text": "Hehehe, exactly."}, {"speaker": "B", "text": "Ahhh,"}, {"speaker": "B", "text": "so yeah."}], continuations: [{ model: "csdlm", label: "CSDLM (Ours)", audio: { ...metadata.audio04_csdlm, src: audio04_csdlm } satisfies WaveformAudio, transcript: [{"speaker": "A", "text": "Yeah."}, {"speaker": "B", "text": "I'm trying to think what else we're supposed to talk about."}, {"speaker": "B", "text": "Alright."}, {"speaker": "B", "text": "I'm not sure if we're supposed to talk about something else or..."}, {"speaker": "B", "text": "Or not."}, {"speaker": "A", "text": "I don't know."}] }, { model: "dgslm", label: "dGSLM", audio: { ...metadata.audio04_dgslm, src: audio04_dgslm } satisfies WaveformAudio, transcript: [{"speaker": "A", "text": "Huh."}, {"speaker": "B", "text": "But no, I know this. I..."}, {"speaker": "B", "text": "usually I just came away, but it's such a half, I guess."}, {"speaker": "A", "text": "Right."}, {"speaker": "B", "text": "Um, well since it's me, so traffic, um, so attempts to lift force me. And I collect..."}] }, { model: "groundTruth", label: "Ground truth", audio: { ...metadata.audio04_groundTruth, src: audio04_groundTruth } satisfies WaveformAudio, transcript: [{"speaker": "A", "text": "Yeah."}, {"speaker": "B", "text": "Well, I was thinking, when I was thinking about comedy, what the hell do I have to say about comedy? Not a whole lot. But then I was..."}, {"speaker": "A", "text": "Which... I'm sorry, go ahead."}, {"speaker": "B", "text": "No, no, you go."}, {"speaker": "A", "text": "I didn't mean to interrupt."}, {"speaker": "A", "text": "Which... is this your first or second phone call?"}, {"speaker": "B", "text": "No, first."}, {"speaker": "A", "text": "It's your first one?"}, {"speaker": "B", "text": "Yeah."}] }] },
    { id: "example-05", title: "Example 05", topic: "Leaving home", prompt: { ...metadata.audio05_prompt, src: audio05_prompt } satisfies WaveformAudio, promptTranscript: [{"speaker": "B", "text": "This is my home, my freedom, everything. I wouldn't leave here. How about you?"}, {"speaker": "A", "text": "Me either."}, {"speaker": "A", "text": "I would stay here because, I mean, wherever you go, it's still gonna be problems for you. You might as well stay here, what you know is going on."}, {"speaker": "B", "text": "True that."}, {"speaker": "A", "text": "Yeah."}, {"speaker": "B", "text": "Crazy, and I wouldn't even..."}], continuations: [{ model: "csdlm", label: "CSDLM (Ours)", audio: { ...metadata.audio05_csdlm, src: audio05_csdlm } satisfies WaveformAudio, transcript: [{"speaker": "B", "text": "even leave if I had a million dollars. If I couldn't talk to my mom."}, {"speaker": "A", "text": "Oh yeah, definitely. You can't leave the country with a million dollars."}, {"speaker": "B", "text": "Yeah, I know. I wouldn't do that."}, {"speaker": "A", "text": "Like, you wouldn't even do that. Like, you wouldn't leave the US because there's problems."}] }, { model: "dgslm", label: "dGSLM", audio: { ...metadata.audio05_dgslm, src: audio05_dgslm } satisfies WaveformAudio, transcript: [{"speaker": "B", "text": "I'm much with studying brings."}, {"speaker": "A", "text": "Hey,"}, {"speaker": "B", "text": "I don't know if I'm signing, I would helping a million dollars."}, {"speaker": "A", "text": "it's kind of scary."}, {"speaker": "A", "text": "I'll try to play some games just to make sinless colleges."}, {"speaker": "B", "text": "Like we really live in since I have like this here if I would have that as like college."}] }, { model: "groundTruth", label: "Ground truth", audio: { ...metadata.audio05_groundTruth, src: audio05_groundTruth } satisfies WaveformAudio, transcript: [{"speaker": "B", "text": "cause I don't know any other place where I would be happy. There's a lot of crazy stuff going on outside the US, and I know I wouldn't go to Mexico because that's not right, and everywhere else, I don't know."}] }] },
    { id: "example-06", title: "Example 06", topic: "Reading", prompt: { ...metadata.audio06_prompt, src: audio06_prompt } satisfies WaveformAudio, promptTranscript: [{"speaker": "A", "text": "Really? You're that young? That you've got a good mind, because that's some... It's good to have an open mind, and I see a lot of kids that just don't have an open mind sometimes."}, {"speaker": "B", "text": "Yeah, and you know, I've read a few just outside of class because you hear about them from"}], continuations: [{ model: "csdlm", label: "CSDLM (Ours)", audio: { ...metadata.audio06_csdlm, src: audio06_csdlm } satisfies WaveformAudio, transcript: [{"speaker": "B", "text": "friends, and you're like, oh, you know, I wonder if you would read this or breathe like that. I wonder if they would be interested in this. And you wonder if you're going to get the same information that you're getting from these people or not. And..."}, {"speaker": "A", "text": "Well, I think they won't be... get the same information that you'd get."}] }, { model: "dgslm", label: "dGSLM", audio: { ...metadata.audio06_dgslm, src: audio06_dgslm } satisfies WaveformAudio, transcript: [{"speaker": "B", "text": "you know, doctors."}, {"speaker": "A", "text": "Uh-huh. Especially, I wouldn't believe how they'd certainly see into a smoking they'd certainly all about they shouldn't be seen into."}, {"speaker": "B", "text": "So you wouldn't like to go home or they leave, you would have an EBR, because they wouldn't go to China."}] }, { model: "groundTruth", label: "Ground truth", audio: { ...metadata.audio06_groundTruth, src: audio06_groundTruth } satisfies WaveformAudio, transcript: [{"speaker": "B", "text": "older people and reviews and stuff, so."}, {"speaker": "A", "text": "Yeah, and even Tom Sawyer is not politically correct anymore because of the"}, {"speaker": "A", "text": "You know the race thing and all that I mean, you know"}, {"speaker": "B", "text": "Right, I see, I don't, I think, you know, that's, that's a time period that they were in."}] }] },
    { id: "example-07", title: "Example 07", topic: "Sports strikes", prompt: { ...metadata.audio07_prompt, src: audio07_prompt } satisfies WaveformAudio, promptTranscript: [{"speaker": "A", "text": "What was the last major sports strike? Was it the baseball one or the NHL one?"}, {"speaker": "B", "text": "I don't remember the NHL one, but yeah, I think the Major League one was in the mid nineties sometime."}, {"speaker": "A", "text": "Yeah, yeah."}, {"speaker": "A", "text": "Yeah, I remember,"}], continuations: [{ model: "csdlm", label: "CSDLM (Ours)", audio: { ...metadata.audio07_csdlm, src: audio07_csdlm } satisfies WaveformAudio, transcript: [{"speaker": "A", "text": "like, that was years ago, and now I guess they're just trying to get more money. I think they're trying to get more money off of the players now, I think."}, {"speaker": "B", "text": "Yeah, they're trying to do all kinds of different things."}, {"speaker": "A", "text": "Yeah, I think they're trying to do it all to get all kinds of the..."}, {"speaker": "B", "text": "Yeah."}, {"speaker": "A", "text": "like extra money."}] }, { model: "dgslm", label: "dGSLM", audio: { ...metadata.audio07_dgslm, src: audio07_dgslm } satisfies WaveformAudio, transcript: [{"speaker": "A", "text": "like the day before that I can want to marry on the someone"}, {"speaker": "B", "text": "Right, right. Right."}, {"speaker": "A", "text": "Yeah."}, {"speaker": "B", "text": "Where do you, how do you simple play sometimes?"}, {"speaker": "A", "text": "Yeah. Yeah."}, {"speaker": "B", "text": "You know, I was just, they get their school and they, they all of a sudden, but it's much difficult for people to read on there."}, {"speaker": "B", "text": "Yeah."}, {"speaker": "A", "text": "Yeah."}] }, { model: "groundTruth", label: "Ground truth", audio: { ...metadata.audio07_groundTruth, src: audio07_groundTruth } satisfies WaveformAudio, transcript: [{"speaker": "A", "text": "like the NHL at some point in the early 90s, they were like, went on strike about something."}, {"speaker": "A", "text": "About like not getting paid or..."}, {"speaker": "B", "text": "Right."}, {"speaker": "A", "text": "I don't know. This is the usual stuff."}, {"speaker": "B", "text": "Right."}] }] },
    { id: "example-08", title: "Example 08", topic: "Cold weather", prompt: { ...metadata.audio08_prompt, src: audio08_prompt } satisfies WaveformAudio, promptTranscript: [{"speaker": "B", "text": "I cannot stand cold weather."}, {"speaker": "A", "text": "I grew up in the cold and I moved away because I can't stand being cold."}, {"speaker": "B", "text": "Oh, where you living now?"}, {"speaker": "A", "text": "I live in LA."}, {"speaker": "B", "text": "Okay. I'm in New York City, so..."}, {"speaker": "A", "text": "Okay. I hate snow. I hate shoveling snow. I hate walking in snow. All that mess."}, {"speaker": "B", "text": "It's a mixture."}], continuations: [{ model: "csdlm", label: "CSDLM (Ours)", audio: { ...metadata.audio08_csdlm, src: audio08_csdlm } satisfies WaveformAudio, transcript: [{"speaker": "B", "text": "Oh, I know, I can't stand it."}, {"speaker": "A", "text": "Yeah."}, {"speaker": "B", "text": "Wow. I don't know, I don't..."}, {"speaker": "A", "text": "I just don't like being outside in the snow. So..."}, {"speaker": "B", "text": "Yeah, it's... I'm not real big on cold weather."}, {"speaker": "A", "text": "Okay."}, {"speaker": "B", "text": "No, I can't do it."}, {"speaker": "A", "text": "Yeah, I'm gonna... I'm not really into cold weather. You know, it's, it's kind of like it's..."}] }, { model: "dgslm", label: "dGSLM", audio: { ...metadata.audio08_dgslm, src: audio08_dgslm } satisfies WaveformAudio, transcript: [{"speaker": "B", "text": "Oh, okay. Okay."}, {"speaker": "A", "text": "Okay, but I've been data wars here to island so sometimes I can track to ah... I've never been to snow out of years."}, {"speaker": "B", "text": "I've never done this number before."}, {"speaker": "A", "text": "I do 70 oversea the girl thing."}, {"speaker": "A", "text": "Yeah, that's a good"}, {"speaker": "B", "text": "Oh, so this is..."}] }, { model: "groundTruth", label: "Ground truth", audio: { ...metadata.audio08_groundTruth, src: audio08_groundTruth } satisfies WaveformAudio, transcript: [{"speaker": "B", "text": "Yeah. Summer and spring, my friend."}, {"speaker": "A", "text": "Are you are you more an outdoor person or I?"}, {"speaker": "B", "text": "Um, you know, yeah. Definitely, yeah."}, {"speaker": "A", "text": "Mean the nice weather it's great to be out and I like walking a lot"}, {"speaker": "B", "text": "Definitely. I mean, I like doing all the outdoor summer activities."}] }] }
  ],
}
