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
  cosyvoice2: {
    id: 'cosyvoice2',
    shortAuthors: 'Du et al.',
    authors: 'Zhihao Du, Yuxuan Wang, Qian Chen, Xian Shi, Xiang Lv, Tianyu Zhao, Zhifu Gao, Yexin Yang, Changfeng Gao, Hui Wang, Fan Yu, Huadai Liu, Zhengyan Sheng, Yue Gu, Chong Deng, Wen Wang, Shiliang Zhang, Zhijie Yan, and Jingren Zhou',
    title: 'CosyVoice 2: Scalable streaming speech synthesis with large language models',
    venue: 'arXiv preprint arXiv:2412.10117',
    year: 2024,
    href: 'https://arxiv.org/abs/2412.10117',
    kind: 'preprint',
  },
  cosyvoice3: {
    id: 'cosyvoice3',
    shortAuthors: 'Du et al.',
    authors: 'Zhihao Du, Changfeng Gao, Yuxuan Wang, Fan Yu, Tianyu Zhao, Hao Wang, Xiang Lv, Hui Wang, Chongjia Ni, Xian Shi, Keyu An, Guanrou Yang, Yabin Li, Yanni Chen, Zhifu Gao, Qian Chen, Yue Gu, Mengzhe Chen, Yafeng Chen, Shiliang Zhang, Wen Wang, and Jieping Ye',
    title: 'CosyVoice 3: Towards in-the-wild speech generation via scaling-up and post-training',
    venue: 'arXiv preprint arXiv:2505.17589',
    year: 2025,
    href: 'https://arxiv.org/abs/2505.17589',
    kind: 'preprint',
  },
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
  voxtream2: {
    id: 'voxtream2',
    shortAuthors: 'Torgashov et al.',
    authors: 'Nikita Torgashov, Gustav Eje Henter, and Gabriel Skantze',
    title: 'VoXtream2: Full-stream TTS with dynamic speaking rate control',
    venue: 'arXiv preprint arXiv:2603.13518',
    year: 2026,
    href: 'https://arxiv.org/abs/2603.13518',
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
  modelReferences.dgslm,
  modelReferences.mooncast,
  modelReferences.vibevoice,
  modelReferences.zipvoice,
  modelReferences.cosyvoice2,
  modelReferences.cosyvoice3,
  modelReferences.voxtream2,
]

export function citationFor(reference: PaperReference): { label: string; href: string } {
  return {
    label: `(${reference.shortAuthors}, ${reference.year})`,
    href: reference.href,
  }
}
