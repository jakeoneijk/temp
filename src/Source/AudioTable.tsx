import AudioSpecTable from '../Component/AudioSpecTable'
import type { TheadMetaType } from '../Component/Type'

type Props = {
  audioType: 'Speech' | 'Music' | 'Sound Effect'
}

// One entry per column, in the same order as EXPECTED_SUFFIXES below.
const theadMetaArray: TheadMetaType[] = [
  { name: 'Input', miniTopDescription: '', description: '', color: '#4D97EF' },
  { name: 'Baseline A', miniTopDescription: '', description: '', color: '#C00909' },
  { name: 'Baseline B', miniTopDescription: '', description: '', color: '#C00909' },
  { name: 'CSDLM', miniTopDescription: '', description: '(proposed)', color: '#EF7E4D' },
  { name: 'Ground-Truth', miniTopDescription: '', description: '', color: '#449948' },
]

// Filename suffixes that identify each column, e.g. s_0_0_input.wav
const EXPECTED_SUFFIXES = ['0_input', '1_baseline_a', '2_baseline_b', '3_csdlm', '4_hr']

const typeAbbrevMap = {
  'Speech': 's',
  'Music': 'm',
  'Sound Effect': 'f',
}
const totalWavFiles = import.meta.glob('./audio/*.wav', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
const totalImgFiles = import.meta.glob('./spec/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>

function getFiles(audioType: 'Speech' | 'Music' | 'Sound Effect', fileType: 'wav' | 'png') {
  const prefix = `/${fileType === 'wav' ? 'audio' : 'spec'}/${typeAbbrevMap[audioType]}`;
  const files = fileType === 'wav' ? totalWavFiles : totalImgFiles;
  return Object.entries(files).filter(([path]) => path.includes(prefix))
    .sort(([aPath], [bPath]) => aPath.localeCompare(bPath, undefined, { numeric: true }))
    .map(([_, url]) => url)
}

function checkPrefix(urls: string[]): boolean {
  if (urls.length === 0) return false;

  const firstName = urls[0].split("/").pop() ?? "";
  const prefix = firstName.slice(0, 4);

  // check every file has the same prefix
  return urls.every(url => {
    const name = url.split("/").pop() ?? "";
    return name.startsWith(prefix);
  });
}

function checkGroup(urls: string[]): boolean {
  if (urls.length !== EXPECTED_SUFFIXES.length) {
    return false;
  }

  return urls.every((url, i) => url.includes(EXPECTED_SUFFIXES[i]));
}

export default function AudioTable({ audioType }: Props) {
  const wavFiles = getFiles(audioType, 'wav')
  const imgFiles = getFiles(audioType, 'png')

  if (wavFiles.length === 0) return null

  const groupSize = EXPECTED_SUFFIXES.length
  const tableAudio: string[][] = []
  for (let i = 0; i < wavFiles.length; i += groupSize) {
    const wavFilesGroup = wavFiles.slice(i, i + groupSize);
    const imgFilesGroup = imgFiles.slice(i, i + groupSize);
    if (!checkPrefix(wavFilesGroup) || !checkPrefix(imgFilesGroup)) throw new Error(`File naming prefix mismatch in ${audioType} files.`)
    if (!checkGroup(wavFilesGroup) || !checkGroup(imgFilesGroup)) throw new Error(`File naming group mismatch in ${audioType} files.`)
    tableAudio.push(wavFilesGroup, imgFilesGroup)
  }
  return (
    <AudioSpecTable
      tableName={audioType}
      theadMetaArray={theadMetaArray}
      tableAudio={tableAudio}
      audioWidth="180px"
    />
  )
}
