export type Question = {
  key: string
  categoryId: string
  text: string
  hint?: string
  priority: boolean
}

export type Category = {
  id: string
  number: string
  title: string
  tag: string
  tagClass: 'core' | 'ai' | 'comm' | 'mind' | 'fit'
  intent: string
}

export const CATEGORIES: Category[] = [
  {
    id: 'motivation',
    number: '01',
    title: '動機・志望度',
    tag: 'CORE',
    tagClass: 'core',
    intent: '見ているポイント：主体的に選んで応募しているか。目的意識があるか。',
  },
  {
    id: 'ai_interest',
    number: '02',
    title: 'AI・テクノロジーへの関心',
    tag: '重要',
    tagClass: 'ai',
    intent: '見ているポイント：AIを触った経験と、指示を工夫する思考があるか。',
  },
  {
    id: 'thinking',
    number: '03',
    title: '思考力・問題解決',
    tag: '思考力',
    tagClass: 'mind',
    intent: '見ているポイント：未知の課題に対して、自分なりに考えて動けるか。',
  },
  {
    id: 'communication',
    number: '04',
    title: 'コミュニケーション・報連相',
    tag: '報連相',
    tagClass: 'comm',
    intent: '見ているポイント：チームで働ける人か。適切に質問・報告ができるか。',
  },
  {
    id: 'self_mgmt',
    number: '05',
    title: '自己管理・働き方',
    tag: '自律性',
    tagClass: 'mind',
    intent: '見ているポイント：学業と両立しながら継続的にコミットできるか。',
  },
  {
    id: 'output',
    number: '06',
    title: '企画力・アウトプット志向',
    tag: '加点',
    tagClass: 'fit',
    intent: '見ているポイント：受け身でなく、自分からアイデアを出せるか。',
  },
  {
    id: 'culture',
    number: '07',
    title: 'カルチャーフィット',
    tag: 'FIT',
    tagClass: 'fit',
    intent: '見ているポイント：チームの雰囲気に合うか。フィードバックを受け入れられるか。',
  },
]

export const QUESTIONS: Question[] = [
  // 01 動機・志望度
  {
    key: 'motivation_1',
    categoryId: 'motivation',
    text: 'AIを使った開発に興味を持ったきっかけは何ですか？',
    hint: '自分の言葉で語れるか。流行りだから、以上の理由があるか',
    priority: true,
  },
  {
    key: 'motivation_2',
    categoryId: 'motivation',
    text: 'FREEDOM Xのどこに魅力を感じましたか？',
    hint: '事前に会社のことを調べているか',
    priority: false,
  },
  {
    key: 'motivation_3',
    categoryId: 'motivation',
    text: 'このインターンを経て、半年後にどうなっていたいですか？',
    hint: '漠然とでもゴールイメージを持っているか',
    priority: false,
  },
  // 02 AI・テクノロジーへの関心
  {
    key: 'ai_interest_1',
    categoryId: 'ai_interest',
    text: 'ChatGPTやClaudeなどの生成AIを普段使っていますか？どんな場面で使いますか？',
    hint: '使用頻度と用途の幅。「レポートに使ってる」だけでなく工夫があるか',
    priority: true,
  },
  {
    key: 'ai_interest_2',
    categoryId: 'ai_interest',
    text: 'AIへの指示がうまくいかなかったとき、どう工夫しましたか？',
    hint: '試行錯誤のプロセスを具体的に語れるか。この役割の適性に直結',
    priority: true,
  },
  {
    key: 'ai_interest_3',
    categoryId: 'ai_interest',
    text: '最近気になったテクノロジー系のニュースやサービスはありますか？',
    hint: '情報感度の高さ。なくても減点ではないが、あると◎',
    priority: false,
  },
  // 03 思考力・問題解決
  {
    key: 'thinking_1',
    categoryId: 'thinking',
    text: '何かを試してうまくいかなかったとき、どう原因を考えて対処しますか？',
    hint: '具体的なエピソードで語れるか。思考の順序が見えるか',
    priority: true,
  },
  {
    key: 'thinking_2',
    categoryId: 'thinking',
    text: 'まったくやったことのない作業を任されたら、まず何から始めますか？',
    hint: '調べる→試す→聞くの順序感。いきなり聞くだけではないか',
    priority: false,
  },
  {
    key: 'thinking_3',
    categoryId: 'thinking',
    text: '「正解がわからない問い」に自分なりの答えを出した経験はありますか？',
    hint: '正解のない業務に耐えられるか。完璧主義すぎないか',
    priority: false,
  },
  // 04 コミュニケーション・報連相
  {
    key: 'communication_1',
    categoryId: 'communication',
    text: '作業中にわからないことが出てきたとき、どのタイミングで人に聞きますか？',
    hint: '自分で考える時間と質問のバランス。「○分考えてダメなら聞く」等の基準があるか',
    priority: true,
  },
  {
    key: 'communication_2',
    categoryId: 'communication',
    text: 'チームで何かに取り組んだ経験を教えてください。どんな役割でしたか？',
    hint: 'リーダーでなくてOK。自分の立ち位置を理解しているか',
    priority: false,
  },
  {
    key: 'communication_3',
    categoryId: 'communication',
    text: '進捗や作業内容を伝えるとき、意識していることはありますか？',
    hint: '日次報告・週次レポートを続けられるかの判断材料',
    priority: false,
  },
  // 05 自己管理・働き方
  {
    key: 'self_mgmt_1',
    categoryId: 'self_mgmt',
    text: '週3〜4日の勤務と学業の両立は、どのようにイメージしていますか？',
    hint: '現実的なスケジュール感を持っているか',
    priority: false,
  },
  {
    key: 'self_mgmt_2',
    categoryId: 'self_mgmt',
    text: '締め切りが複数重なったとき、どう優先順位をつけますか？',
    hint: 'タスク管理の考え方があるか',
    priority: false,
  },
  {
    key: 'self_mgmt_3',
    categoryId: 'self_mgmt',
    text: '日常的にメモや記録を取る習慣はありますか？',
    hint: '作業報告を毎日書けるかの素養',
    priority: false,
  },
  // 06 企画力・アウトプット志向
  {
    key: 'output_1',
    categoryId: 'output',
    text: '「こうなったらもっと良くなるのに」と感じたアプリやサービスはありますか？',
    hint: '課題を見つける目線。具体的な改善案まで出せるとなお良い',
    priority: false,
  },
  {
    key: 'output_2',
    categoryId: 'output',
    text: '自分のアイデアを誰かに提案・プレゼンした経験はありますか？',
    hint: '企画→プレゼンの機会がある業務への適性',
    priority: false,
  },
  // 07 カルチャーフィット
  {
    key: 'culture_1',
    categoryId: 'culture',
    text: 'どんな環境だと自分は成長しやすいと感じますか？',
    hint: '自己理解の深さ。FREEDOM Xの環境と合うか',
    priority: false,
  },
  {
    key: 'culture_2',
    categoryId: 'culture',
    text: 'フィードバックをもらったとき、どう受け止めるタイプですか？',
    hint: '素直さと柔軟性。防御的にならないか',
    priority: false,
  },
]

export const OVERALL_EVAL_KEYS = ['aiAptitude', 'communication', 'total'] as const
export type OverallEvalKey = (typeof OVERALL_EVAL_KEYS)[number]
