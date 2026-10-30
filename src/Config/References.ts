export type PaperReference = {
  id: string
  shortAuthors: string
  authors: string
  title: string
  venue: string
  year: number
  href: string
  kind: 'journal' | 'conference' | 'preprint'
  volume?: string
  pages?: string
}

export const modelReferences = {
  dgslm: {
    id: 'dgslm',
    shortAuthors: 'Nguyen et al.',
    authors: 'Tu Anh Nguyen, Eugene Kharitonov, Jade Copet, Yossi Adi, Wei-Ning Hsu, Ali Elkahky, Paden Tomasello, Robin Algayres, Benoît Sagot, Abdelrahman Mohamed, and Emmanuel Dupoux',
    title: 'Generative spoken dialogue language modeling',
    venue: 'Transactions of the Association for Computational Linguistics',
    year: 2023,
    href: 'https://aclanthology.org/2023.tacl-1.15/',
    kind: 'journal',
    volume: '11',
    pages: '250–266',
  },
  mooncast: {
    id: 'mooncast',
    shortAuthors: 'Ju et al.',
    authors: 'Zeqian Ju, Dongchao Yang, Shen Kai, Yichong Leng, Zhengtao Wang, Songxiang Liu, Xinyu Zhou, Tao Qin, Xiangyang Li, Jianwei Yu, and Xu Tan',
    title: 'MoonCast: High-quality zero-shot podcast generation',
    venue: 'Advances in Neural Information Processing Systems',
    year: 2025,
    href: 'https://papers.neurips.cc/paper_files/paper/2025/hash/095a6917768712b7ccc61acbeecad1d8-Abstract-Conference.html',
    kind: 'conference',
    volume: '38',
    pages: '6283–6317',
  },
  vibevoice: {
    id: 'vibevoice',
    shortAuthors: 'Peng et al.',
    authors: 'Zhiliang Peng, Jianwei Yu, Wenhui Wang, Yaoyao Chang, Yutao Sun, Li Dong, Yi Zhu, Weijiang Xu, Hangbo Bao, Zehua Wang, Shaohan Huang, Yan Xia, and Furu Wei',
    title: 'VibeVoice technical report',
    venue: 'arXiv preprint arXiv:2508.19205',
    year: 2025,
    href: 'https://arxiv.org/abs/2508.19205',
    kind: 'preprint',
  },
  zipvoice: {
    id: 'zipvoice',
    shortAuthors: 'Zhu et al.',
    authors: 'Han Zhu, Wei Kang, Liyong Guo, Zengwei Yao, Fangjun Kuang, Weiji Zhuang, Zhaoqing Li, Zhifeng Han, Dong Zhang, Xin Zhang, Xingchen Song, Lingxuan Ye, Long Lin, and Daniel Povey',
    title: 'ZipVoice-Dialog: Non-autoregressive spoken dialogue generation with flow matching',
    venue: 'Findings of the Association for Computational Linguistics: ACL 2026',
    year: 2026,
    href: 'https://aclanthology.org/2026.findings-acl.1928/',
    kind: 'conference',
    pages: '38717–38729',
  },
} satisfies Record<string, PaperReference>

export const demoReferences: readonly PaperReference[] = [
  modelReferences.mooncast,
  modelReferences.dgslm,
  modelReferences.vibevoice,
  modelReferences.zipvoice,
]

export function citationFor(reference: PaperReference): { label: string; href: string } {
  return {
    label: `(${reference.shortAuthors}, ${reference.year})`,
    href: reference.href,
  }
}
