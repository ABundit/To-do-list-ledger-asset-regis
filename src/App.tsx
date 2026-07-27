import { useState, type ChangeEvent } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  Circle,
  Clock3,
  File,
  FileText,
  FolderOpen,
  Image,
  Landmark,
  LayoutDashboard,
  Link2,
  ListTodo,
  MoreHorizontal,
  Plus,
  ReceiptText,
  Save,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
  Upload,
  UserRound,
  WalletCards,
  X,
  type LucideIcon,
} from 'lucide-react'

type Mode = 'personal' | 'work'
type NavKey = 'overview' | 'tasks' | 'ledger' | 'investment' | 'assets'
type EntryKind = 'income' | 'expense' | 'asset' | 'investment'
type Transaction = {
  id?: string
  title: string
  date: string
  amount: string
  rawAmount?: number
  tone: 'income' | 'expense'
  icon: LucideIcon
  category?: string
  linkedTo?: 'asset' | 'investment'
}
type AssetRow = {
  icon: string
  name: string
  category: string
  value: string
  updated: string
  docs: number
}
type InvestmentEntry = {
  name: string
  category: string
  amount: string
  date: string
}

const navItems: { key: NavKey; label: string; icon: LucideIcon }[] = [
  { key: 'overview', label: 'ภาพรวม', icon: LayoutDashboard },
  { key: 'tasks', label: 'รายการสิ่งที่ต้องทำ', icon: ListTodo },
  { key: 'ledger', label: 'รายรับ–รายจ่าย', icon: WalletCards },
  { key: 'investment', label: 'การลงทุน', icon: ChartNoAxesCombined },
  { key: 'assets', label: 'ทะเบียนทรัพย์สิน', icon: Landmark },
]

const navMeta: Record<NavKey, { eyebrow: string; title: string }> = {
  overview: { eyebrow: 'ภาพรวมวันนี้', title: 'สวัสดีครับ คุณสมชาย 👋' },
  tasks: { eyebrow: 'งานและนัดหมาย', title: 'จัดการสิ่งที่ต้องทำ' },
  ledger: { eyebrow: 'กระแสเงินสด', title: 'ติดตามรายรับ–รายจ่าย' },
  investment: { eyebrow: 'พอร์ตของคุณ', title: 'ภาพรวมการลงทุน' },
  assets: { eyebrow: 'ข้อมูลสำคัญ', title: 'ทะเบียนทรัพย์สิน' },
}

const personalTasks = [
  { id: 1, title: 'จ่ายค่าไฟและค่าน้ำประจำเดือน', meta: 'วันนี้ · 18:00 น.', tag: 'บ้าน', urgent: true },
  { id: 2, title: 'ตรวจสอบเงินปันผลกองทุน', meta: 'พรุ่งนี้ · 10:00 น.', tag: 'การลงทุน', urgent: false },
  { id: 3, title: 'นัดตรวจสุขภาพประจำปี', meta: '28 ก.ค. · โรงพยาบาล', tag: 'สุขภาพ', urgent: false },
]

const workTasks = [
  { id: 1, title: 'ส่งแบบระบบไฟฟ้าให้ทีมโครงการ', meta: 'วันนี้ · 14:00 น.', tag: 'โครงการ', urgent: true },
  { id: 2, title: 'ประชุมติดตามงานผู้รับเหมา', meta: 'พรุ่งนี้ · 09:30 น.', tag: 'ประชุม', urgent: false },
  { id: 3, title: 'สรุปรายงานความปลอดภัยประจำเดือน', meta: '30 ก.ค. · สำนักงาน', tag: 'เอกสาร', urgent: false },
]

const personalTransactions: Transaction[] = [
  { title: 'เงินบำนาญ', date: '25 ก.ค. 2569', amount: '+฿24,500', tone: 'income', icon: Landmark },
  { title: 'ซื้อของใช้ในบ้าน', date: '24 ก.ค. 2569', amount: '−฿1,280', tone: 'expense', icon: WalletCards },
  { title: 'เงินปันผลกองทุนรวม', date: '23 ก.ค. 2569', amount: '+฿3,450', tone: 'income', icon: TrendingUp },
  { title: 'ดอกเบี้ยสหกรณ์', date: '22 ก.ค. 2569', amount: '+฿1,860', tone: 'income', icon: Landmark },
]

const workTransactions: Transaction[] = [
  { title: 'เงินเดือนประจำเดือน', date: '25 ก.ค. 2569', amount: '+฿58,500', tone: 'income', icon: BriefcaseBusiness },
  { title: 'ค่าเดินทางหน้างาน', date: '24 ก.ค. 2569', amount: '−฿860', tone: 'expense', icon: WalletCards },
  { title: 'ค่าอุปกรณ์สำนักงาน', date: '23 ก.ค. 2569', amount: '−฿1,450', tone: 'expense', icon: FileText },
  { title: 'เบี้ยเลี้ยงโครงการ', date: '22 ก.ค. 2569', amount: '+฿2,400', tone: 'income', icon: BriefcaseBusiness },
]

const assetRows: AssetRow[] = [
  { icon: '🏠', name: 'บ้านพักอาศัย', category: 'อสังหาริมทรัพย์', value: '฿3,850,000', updated: '12 ก.ค. 2569', docs: 3 },
  { icon: '🚙', name: 'Toyota Corolla Cross', category: 'ยานพาหนะ', value: '฿890,000', updated: '4 มิ.ย. 2569', docs: 2 },
  { icon: '💻', name: 'MacBook Pro 14"', category: 'อุปกรณ์', value: '฿72,900', updated: '18 พ.ค. 2569', docs: 1 },
]

const workAssetRows: AssetRow[] = [
  { icon: '📐', name: 'ชุดอุปกรณ์สำรวจหน้างาน', category: 'เครื่องมือ', value: '฿48,500', updated: '20 ก.ค. 2569', docs: 2 },
  { icon: '💻', name: 'Notebook วิศวกรรม', category: 'อุปกรณ์สำนักงาน', value: '฿56,900', updated: '6 ก.ค. 2569', docs: 2 },
  { icon: '📱', name: 'โทรศัพท์สำหรับงาน', category: 'อุปกรณ์สื่อสาร', value: '฿28,900', updated: '14 มิ.ย. 2569', docs: 1 },
]

const members = [
  { value: 'somchai', label: 'สมชาย · นักลงทุนวัยเกษียณ' },
  { value: 'suda', label: 'สุดา · นักลงทุนวัยเกษียณ' },
  { value: 'narin', label: 'นรินทร์ · วิศวกร' },
]

function App() {
  const [mode, setMode] = useState<Mode>('personal')
  const [activeNav, setActiveNav] = useState<NavKey>('overview')
  const [completedTasks, setCompletedTasks] = useState<number[]>([])
  const [showUpload, setShowUpload] = useState(false)
  const [showEntry, setShowEntry] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [member, setMember] = useState('somchai')
  const [entryKind, setEntryKind] = useState<EntryKind>('expense')
  const [entryName, setEntryName] = useState('')
  const [entryAmount, setEntryAmount] = useState('')
  const [entryCategory, setEntryCategory] = useState('ทั่วไป')
  const [savedMessage, setSavedMessage] = useState('')
  const [customTransactions, setCustomTransactions] = useState<Record<Mode, Transaction[]>>({
    personal: [],
    work: [],
  })
  const [customAssets, setCustomAssets] = useState<Record<Mode, AssetRow[]>>({
    personal: [],
    work: [],
  })
  const [customInvestments, setCustomInvestments] = useState<Record<Mode, InvestmentEntry[]>>({
    personal: [],
    work: [],
  })

  const isPersonal = mode === 'personal'
  const tasks = isPersonal ? personalTasks : workTasks
  const transactions = [
    ...customTransactions[mode],
    ...(isPersonal ? personalTransactions : workTransactions),
  ]
  const assets = [...customAssets[mode], ...(isPersonal ? assetRows : workAssetRows)]
  const meta = navMeta[activeNav]
  const customIncomeTotal = customTransactions[mode]
    .filter((transaction) => transaction.tone === 'income')
    .reduce((sum, transaction) => sum + (transaction.rawAmount ?? 0), 0)
  const customExpenseTotal = customTransactions[mode]
    .filter((transaction) => transaction.tone === 'expense')
    .reduce((sum, transaction) => sum + (transaction.rawAmount ?? 0), 0)
  const monthlyIncome = (isPersonal ? 48_260 : 60_900) + customIncomeTotal
  const monthlyExpense = (isPersonal ? 21_840 : 12_640) + customExpenseTotal
  const assetRegistryTotal = assets.reduce(
    (sum, asset) => sum + Number(asset.value.replace(/[฿,]/g, '')),
    0,
  )
  const customAssetTotal = customAssets[mode].reduce(
    (sum, asset) => sum + Number(asset.value.replace(/[฿,]/g, '')),
    0,
  )
  const customInvestmentTotal = customInvestments[mode].reduce(
      (sum, item) => sum + Number(item.amount.replace(/[฿,]/g, '')),
      0,
    )
  const investmentTotal = (isPersonal ? 1_247_830 : 684_250) + customInvestmentTotal
  const baht = (value: number) => `฿${value.toLocaleString('th-TH')}`

  const totals = isPersonal
    ? [
            { label: 'ทรัพย์สินสุทธิ', value: baht(5_482_350 + customAssetTotal + customInvestmentTotal), trend: '+6.4%', type: 'up', note: 'จากเดือนที่แล้ว' },
            { label: 'รายรับเดือนนี้', value: baht(monthlyIncome), trend: '+8.2%', type: 'up', note: 'รวมทุกแหล่งรายได้' },
            { label: 'รายจ่ายเดือนนี้', value: baht(monthlyExpense), trend: '−3.1%', type: 'down', note: 'รวมรายการเชื่อมโยง' },
            { label: 'งานที่ต้องทำ', value: '8 งาน', trend: '3', type: 'task', note: 'งานสำคัญวันนี้' },
          ]
    : [
            { label: 'รายรับจากงาน', value: baht(monthlyIncome), trend: '+4.1%', type: 'up', note: 'จากเดือนที่แล้ว' },
            { label: 'ค่าใช้จ่ายงาน', value: baht(monthlyExpense), trend: '−2.6%', type: 'down', note: 'รวมรายการเชื่อมโยง' },
            { label: 'งบโครงการคงเหลือ', value: '฿184,500', trend: '72%', type: 'up', note: 'ของงบโครงการ' },
            { label: 'งานที่ต้องทำ', value: '11 งาน', trend: '4', type: 'task', note: 'งานเร่งด่วนวันนี้' },
          ]

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files))
    }
  }

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode)
    setCompletedTasks([])
    setSavedMessage('')
  }

  const openEntryForm = (kind?: EntryKind) => {
    const nextKind = kind ?? (activeNav === 'assets' ? 'asset' : activeNav === 'investment' ? 'investment' : 'expense')
    setEntryKind(nextKind)
    setEntryName('')
    setEntryAmount('')
    setEntryCategory(nextKind === 'asset' ? 'อุปกรณ์' : nextKind === 'investment' ? 'กองทุนรวม' : 'ทั่วไป')
    setShowEntry(true)
  }

  const saveEntry = () => {
    const amount = Number(entryAmount.replace(/,/g, ''))
    if (!entryName.trim() || !Number.isFinite(amount) || amount <= 0) return

    const isIncome = entryKind === 'income'
    const linkedTo = entryKind === 'asset' ? 'asset' : entryKind === 'investment' ? 'investment' : undefined
    const formattedAmount = `${isIncome ? '+' : '−'}฿${amount.toLocaleString('th-TH')}`
    const transaction: Transaction = {
      id: `${Date.now()}-${entryKind}`,
      title: entryName.trim(),
      date: '27 ก.ค. 2569 · บันทึกใหม่',
      amount: formattedAmount,
      rawAmount: amount,
      tone: isIncome ? 'income' : 'expense',
      icon: entryKind === 'asset' ? Landmark : entryKind === 'investment' ? TrendingUp : ReceiptText,
      category: entryKind === 'asset' ? 'ซื้อทรัพย์สิน' : entryKind === 'investment' ? 'ซื้อการลงทุน' : entryCategory,
      linkedTo,
    }

    setCustomTransactions((current) => ({
      ...current,
      [mode]: [transaction, ...current[mode]],
    }))

    if (entryKind === 'asset') {
      setCustomAssets((current) => ({
        ...current,
        [mode]: [
          {
            icon: entryCategory === 'ยานพาหนะ' ? '🚙' : entryCategory === 'อสังหาริมทรัพย์' ? '🏠' : '📦',
            name: entryName.trim(),
            category: entryCategory,
            value: `฿${amount.toLocaleString('th-TH')}`,
            updated: '27 ก.ค. 2569',
            docs: 0,
          },
          ...current[mode],
        ],
      }))
      setSavedMessage(`บันทึก “${entryName.trim()}” ในทะเบียนทรัพย์สิน และสร้างรายจ่ายใน Ledger แล้ว`)
    } else if (entryKind === 'investment') {
      setCustomInvestments((current) => ({
        ...current,
        [mode]: [
          {
            name: entryName.trim(),
            category: entryCategory,
            amount: `฿${amount.toLocaleString('th-TH')}`,
            date: '27 ก.ค. 2569',
          },
          ...current[mode],
        ],
      }))
      setSavedMessage(`บันทึก “${entryName.trim()}” ในพอร์ตลงทุน และสร้างเงินออกใน Ledger แล้ว`)
    } else {
      setSavedMessage(`บันทึก “${entryName.trim()}” ใน Ledger แล้ว`)
    }

    setShowEntry(false)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <span />
            <span />
          </div>
          <div>
            <strong>BaanBalance</strong>
            <small>จัดการชีวิตอย่างสมดุล</small>
          </div>
        </div>

        <nav className="side-nav" aria-label="เมนูหลัก">
          <p className="nav-label">เมนูหลัก</p>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                className={`nav-item ${activeNav === item.key ? 'active' : ''}`}
                key={item.key}
                onClick={() => setActiveNav(item.key)}
              >
                <Icon size={19} strokeWidth={1.8} />
                <span>{item.label}</span>
                {item.key === 'tasks' && <span className="nav-count">{isPersonal ? 8 : 11}</span>}
              </button>
            )
          })}
        </nav>

        <div className="sidebar-spacer" />
        <button className="nav-item">
          <Settings size={19} strokeWidth={1.8} />
          <span>ตั้งค่า</span>
        </button>
        <div className="privacy-note">
          <ShieldCheck size={18} />
          <div>
            <strong>ข้อมูลของคุณปลอดภัย</strong>
            <span>เข้ารหัสและแยกตามสมาชิก</span>
          </div>
        </div>
        <div className="sidebar-profile">
          <div className="avatar avatar-small">สช</div>
          <div>
            <strong>คุณสมชาย</strong>
            <span>ผู้ดูแลครอบครัว</span>
          </div>
          <MoreHorizontal size={18} />
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="mobile-brand">
            <div className="brand-mark">
              <span />
              <span />
            </div>
            <strong>BaanBalance</strong>
          </div>
          <div className="mode-switch" aria-label="เลือกโหมดการใช้งาน">
            <button className={isPersonal ? 'active' : ''} onClick={() => switchMode('personal')}>
              <UserRound size={16} />
              Personal
            </button>
            <button className={!isPersonal ? 'active' : ''} onClick={() => switchMode('work')}>
              <BriefcaseBusiness size={16} />
              Work
            </button>
          </div>

          <div className="topbar-actions">
            <label className="search">
              <Search size={18} />
              <input aria-label="ค้นหา" placeholder="ค้นหา..." />
              <kbd>⌘ K</kbd>
            </label>
            <button className="icon-button" aria-label="การแจ้งเตือน">
              <Bell size={19} />
              <span className="notification-dot" />
            </button>
            <div className="family-selector">
              <div className="avatar">{member === 'somchai' ? 'สช' : member === 'suda' ? 'สด' : 'นร'}</div>
              <label>
                <small>กำลังดูข้อมูลของ</small>
                <select value={member} onChange={(event) => setMember(event.target.value)} aria-label="เลือกสมาชิก">
                  {members.map((option) => (
                    <option value={option.value} key={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <ChevronDown size={15} />
            </div>
          </div>
        </header>

        <div className="content">
          <section className="welcome-row">
            <div>
              <span className="eyebrow">{meta.eyebrow}</span>
              <h1>{meta.title}</h1>
              <p>
                {isPersonal
                  ? 'นี่คือสรุปชีวิตและการเงินของคุณ ประจำวันจันทร์ที่ 27 กรกฎาคม 2569'
                  : 'นี่คือภาพรวมงานและค่าใช้จ่าย ประจำวันจันทร์ที่ 27 กรกฎาคม 2569'}
              </p>
            </div>
            {activeNav !== 'tasks' && (
              <button className="primary-button" onClick={() => openEntryForm()}>
                <Plus size={18} />
                {activeNav === 'assets'
                  ? 'เพิ่มทรัพย์สิน'
                  : activeNav === 'investment'
                    ? 'เพิ่มการลงทุน'
                    : 'เพิ่มรายการใหม่'}
              </button>
            )}
          </section>

          {savedMessage && (
            <div className="sync-notice">
              <Link2 size={18} />
              <div>
                <strong>เชื่อมโยงรายการเรียบร้อย</strong>
                <span>{savedMessage}</span>
              </div>
              <button aria-label="ปิดข้อความ" onClick={() => setSavedMessage('')}><X size={16} /></button>
            </div>
          )}

          {activeNav === 'overview' && (
          <>
          <section className="stat-grid" aria-label="ข้อมูลสรุป">
            {totals.map((stat, index) => (
              <article className={`stat-card stat-${index + 1}`} key={stat.label}>
                <div className="stat-card-top">
                  <span>{stat.label}</span>
                  <button aria-label={`ดูรายละเอียด${stat.label}`}>
                    <MoreHorizontal size={18} />
                  </button>
                </div>
                <strong>{stat.value}</strong>
                <div className="stat-footer">
                  <span className={`trend trend-${stat.type}`}>
                    {stat.type === 'up' && <ArrowUpRight size={13} />}
                    {stat.type === 'down' && <ArrowDownRight size={13} />}
                    {stat.type === 'task' && <Clock3 size={13} />}
                    {stat.trend}
                  </span>
                  <small>{stat.note}</small>
                </div>
                <div className="stat-ornament" />
              </article>
            ))}
          </section>

          <section className="dashboard-grid">
            <article className="panel cashflow-panel">
              <div className="panel-heading">
                <div>
                  <span className="panel-kicker">กระแสเงินสด</span>
                  <h2>รายรับและรายจ่าย</h2>
                </div>
                <button className="period-button">
                  6 เดือนล่าสุด <ChevronDown size={14} />
                </button>
              </div>
              <div className="cash-summary">
                <div>
                  <span className="dot income-dot" />
                  <small>รายรับทั้งหมด</small>
                  <strong>{isPersonal ? '฿284,650' : '฿358,200'}</strong>
                </div>
                <div>
                  <span className="dot expense-dot" />
                  <small>รายจ่ายทั้งหมด</small>
                  <strong>{isPersonal ? '฿132,480' : '฿76,840'}</strong>
                </div>
                <div className="net-badge">
                  <TrendingUp size={15} /> สุทธิ +{isPersonal ? '฿152,170' : '฿281,360'}
                </div>
              </div>
              <div className="chart" aria-label="กราฟรายรับรายจ่าย 6 เดือน">
                {[58, 72, 64, 85, 76, 92].map((height, index) => (
                  <div className="chart-month" key={index}>
                    <div className="bar-group">
                      <span className="bar income-bar" style={{ height: `${height}%` }} />
                      <span className="bar expense-bar" style={{ height: `${Math.max(28, height - 31 + (index % 2) * 10)}%` }} />
                    </div>
                    <small>{['ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.'][index]}</small>
                  </div>
                ))}
                <span className="chart-line line-one" />
                <span className="chart-line line-two" />
                <span className="chart-line line-three" />
              </div>
            </article>

            <article className="panel tasks-panel">
              <div className="panel-heading">
                <div>
                  <span className="panel-kicker">จัดลำดับวันของคุณ</span>
                  <h2>สิ่งที่ต้องทำ</h2>
                </div>
                <button className="text-button" onClick={() => setActiveNav('tasks')}>
                  ดูทั้งหมด <ArrowUpRight size={15} />
                </button>
              </div>
              <div className="task-progress">
                <div>
                  <strong>{completedTasks.length}/{tasks.length}</strong>
                  <span>เสร็จแล้ววันนี้</span>
                </div>
                <div className="progress-track">
                  <span style={{ width: `${(completedTasks.length / tasks.length) * 100}%` }} />
                </div>
              </div>
              <div className="task-list">
                {tasks.map((task) => {
                  const done = completedTasks.includes(task.id)
                  return (
                    <button
                      className={`task-row ${done ? 'done' : ''}`}
                      key={task.id}
                      onClick={() =>
                        setCompletedTasks((current) =>
                          done ? current.filter((id) => id !== task.id) : [...current, task.id],
                        )
                      }
                    >
                      <span className="task-check">{done ? <Check size={15} /> : <Circle size={18} />}</span>
                      <span className="task-copy">
                        <strong>{task.title}</strong>
                        <small>
                          <CalendarDays size={13} /> {task.meta}
                        </small>
                      </span>
                      <span className={`task-tag ${task.urgent ? 'urgent' : ''}`}>{task.tag}</span>
                    </button>
                  )
                })}
              </div>
              <button className="add-task">
                <Plus size={16} /> เพิ่มงานใหม่
              </button>
            </article>
          </section>

          <section className="lower-grid">
            <article className="panel transaction-panel">
              <div className="panel-heading">
                <div>
                  <span className="panel-kicker">อัปเดตล่าสุด</span>
                  <h2>รายการเคลื่อนไหว</h2>
                </div>
                <button className="text-button">
                  ดูทั้งหมด <ArrowUpRight size={15} />
                </button>
              </div>
              <div className="transaction-list">
                {transactions.map((transaction) => {
                  const Icon = transaction.icon
                  return (
                    <div className="transaction-row" key={transaction.title}>
                      <span className={`transaction-icon ${transaction.tone}`}>
                        <Icon size={18} />
                      </span>
                      <div>
                        <strong>{transaction.title}</strong>
                        <small>{transaction.date}</small>
                      </div>
                      <strong className={transaction.tone}>{transaction.amount}</strong>
                    </div>
                  )
                })}
              </div>
            </article>

            <article className="panel investment-panel">
              <div className="panel-heading">
                <div>
                  <span className="panel-kicker">ภาพรวมพอร์ต</span>
                  <h2>การลงทุน</h2>
                </div>
                <button className="icon-button subtle" aria-label="ตัวเลือกการลงทุน">
                  <MoreHorizontal size={18} />
                </button>
              </div>
              <div className="portfolio-total">
                <div>
                  <small>มูลค่าพอร์ตรวม</small>
                  <strong>{baht(investmentTotal)}</strong>
                  <span><ArrowUpRight size={13} /> +9.8% ปีนี้</span>
                </div>
                <div className="donut">
                  <div><strong>4</strong><small>ประเภท</small></div>
                </div>
              </div>
              <div className="asset-allocation">
                {(isPersonal
                  ? [
                      ['สินทรัพย์ดิจิทัล', '42%', 'teal'],
                      ['กองทุนรวม', '28%', 'gold'],
                      ['เงินฝาก/สหกรณ์', '20%', 'blue'],
                      ['หุ้น', '10%', 'coral'],
                    ]
                  : [
                      ['หุ้นไทย', '38%', 'teal'],
                      ['หุ้นต่างประเทศ', '27%', 'gold'],
                      ['กองทุนรวม', '25%', 'blue'],
                      ['เงินสด', '10%', 'coral'],
                    ]
                ).map(([name, value, color]) => (
                  <div key={name}>
                    <span className={`allocation-dot ${color}`} />
                    <small>{name}</small>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="panel assets-panel">
            <div className="panel-heading asset-heading">
              <div>
                <span className="panel-kicker">ทะเบียนกลาง</span>
                <h2>ทรัพย์สินล่าสุด</h2>
              </div>
              <div className="asset-actions">
                <button className="secondary-button" onClick={() => setShowUpload(true)}>
                  <Upload size={16} /> อัปโหลดเอกสาร
                </button>
                <button className="text-button" onClick={() => setActiveNav('assets')}>
                  ดูทะเบียนทั้งหมด <ArrowUpRight size={15} />
                </button>
              </div>
            </div>
            <div className="asset-table">
              <div className="asset-table-head">
                <span>รายการทรัพย์สิน</span>
                <span>มูลค่าโดยประมาณ</span>
                <span>อัปเดตล่าสุด</span>
                <span>เอกสาร</span>
              </div>
              {assets.map((asset) => (
                <div className="asset-row" key={asset.name}>
                  <div className="asset-name">
                    <span className="asset-emoji">{asset.icon}</span>
                    <div>
                      <strong>{asset.name}</strong>
                      <small>{asset.category}</small>
                    </div>
                  </div>
                  <strong>{asset.value}</strong>
                  <span>{asset.updated}</span>
                  <button className="doc-pill" onClick={() => setShowUpload(true)}>
                    <FolderOpen size={15} /> {asset.docs} ไฟล์
                  </button>
                </div>
              ))}
            </div>
          </section>
          </>
          )}

          {activeNav === 'tasks' && (
            <section className="focus-page">
              <div className="focus-stat-grid">
                <article><span>งานทั้งหมด</span><strong>{isPersonal ? 8 : 11}</strong><small>รายการ</small></article>
                <article><span>เสร็จแล้ววันนี้</span><strong>{completedTasks.length}</strong><small>จาก {tasks.length} งานวันนี้</small></article>
                <article><span>งานเร่งด่วน</span><strong>{isPersonal ? 3 : 4}</strong><small>ควรจัดการก่อน</small></article>
              </div>
              <article className="panel focus-panel task-focus-panel">
                <div className="panel-heading">
                  <div>
                    <span className="panel-kicker">{isPersonal ? 'งานส่วนตัว' : 'งานที่ทำงาน'}</span>
                    <h2>รายการสิ่งที่ต้องทำวันนี้</h2>
                  </div>
                  <button className="primary-button"><Plus size={17} /> เพิ่มงาน</button>
                </div>
                <div className="task-progress focus-progress">
                  <div><strong>{completedTasks.length}/{tasks.length}</strong><span>เสร็จแล้ววันนี้</span></div>
                  <div className="progress-track"><span style={{ width: `${(completedTasks.length / tasks.length) * 100}%` }} /></div>
                </div>
                <div className="focus-task-list">
                  {tasks.map((task) => {
                    const done = completedTasks.includes(task.id)
                    return (
                      <button
                        className={`task-row ${done ? 'done' : ''}`}
                        key={task.id}
                        onClick={() =>
                          setCompletedTasks((current) =>
                            done ? current.filter((id) => id !== task.id) : [...current, task.id],
                          )
                        }
                      >
                        <span className="task-check">{done ? <Check size={15} /> : <Circle size={18} />}</span>
                        <span className="task-copy">
                          <strong>{task.title}</strong>
                          <small><CalendarDays size={13} /> {task.meta}</small>
                        </span>
                        <span className={`task-tag ${task.urgent ? 'urgent' : ''}`}>{task.tag}</span>
                      </button>
                    )
                  })}
                </div>
              </article>
            </section>
          )}

          {activeNav === 'ledger' && (
            <section className="focus-page">
              <div className="focus-stat-grid ledger-stats">
                <article><span>รายรับเดือนนี้</span><strong>{baht(monthlyIncome)}</strong><small className="income">+8.2% จากเดือนก่อน</small></article>
                <article><span>รายจ่ายเดือนนี้</span><strong>{baht(monthlyExpense)}</strong><small className="expense">รวมรายการเชื่อมโยง</small></article>
                <article><span>คงเหลือสุทธิ</span><strong>{baht(monthlyIncome - monthlyExpense)}</strong><small>กระแสเงินสดเดือนนี้</small></article>
              </div>
              <div className="ledger-toolbar">
                <div className="ledger-tabs">
                  <button className="active">ทั้งหมด</button>
                  <button>รายรับ</button>
                  <button>รายจ่าย</button>
                  <button>เชื่อมโยง</button>
                </div>
                <div>
                  <button className="secondary-button" onClick={() => openEntryForm('income')}><Plus size={15} /> เพิ่มรายรับ</button>
                  <button className="primary-button" onClick={() => openEntryForm('expense')}><Plus size={15} /> เพิ่มรายจ่าย</button>
                </div>
              </div>
              <article className="panel ledger-panel">
                <div className="ledger-table-head">
                  <span>วันที่</span><span>รายการ</span><span>หมวดหมู่</span><span>เชื่อมโยง</span><span>จำนวนเงิน</span>
                </div>
                {transactions.map((transaction, index) => {
                  const Icon = transaction.icon
                  return (
                    <div className={`ledger-row ${transaction.id ? 'new-entry' : ''}`} key={transaction.id ?? `${transaction.title}-${index}`}>
                      <span className="ledger-date">{transaction.date}</span>
                      <div className="ledger-name">
                        <span className={`transaction-icon ${transaction.tone}`}><Icon size={17} /></span>
                        <strong>{transaction.title}</strong>
                      </div>
                      <span className="ledger-category">{transaction.category ?? (transaction.tone === 'income' ? 'รายรับ' : 'ค่าใช้จ่าย')}</span>
                      <span>
                        {transaction.linkedTo ? (
                          <button className="linked-pill" onClick={() => setActiveNav(transaction.linkedTo === 'asset' ? 'assets' : 'investment')}>
                            <Link2 size={12} /> {transaction.linkedTo === 'asset' ? 'ทะเบียนทรัพย์สิน' : 'พอร์ตลงทุน'}
                          </button>
                        ) : <span className="not-linked">—</span>}
                      </span>
                      <strong className={transaction.tone}>{transaction.amount}</strong>
                    </div>
                  )
                })}
              </article>
            </section>
          )}

          {activeNav === 'investment' && (
            <section className="focus-page">
              <div className="investment-focus-grid">
                <article className="panel investment-panel investment-overview">
                  <div className="panel-heading">
                    <div><span className="panel-kicker">มูลค่าปัจจุบัน</span><h2>สัดส่วนพอร์ตการลงทุน</h2></div>
                    <button className="primary-button" onClick={() => openEntryForm('investment')}><Plus size={16} /> ซื้อการลงทุน</button>
                  </div>
                  <div className="portfolio-total">
                    <div>
                      <small>มูลค่าพอร์ตรวม</small>
                      <strong>{baht(investmentTotal)}</strong>
                      <span><ArrowUpRight size={13} /> +9.8% ปีนี้</span>
                    </div>
                    <div className="donut"><div><strong>4</strong><small>ประเภท</small></div></div>
                  </div>
                  <div className="asset-allocation">
                    {(isPersonal
                      ? [['สินทรัพย์ดิจิทัล', '42%', 'teal'], ['กองทุนรวม', '28%', 'gold'], ['เงินฝาก/สหกรณ์', '20%', 'blue'], ['หุ้น', '10%', 'coral']]
                      : [['หุ้นไทย', '38%', 'teal'], ['หุ้นต่างประเทศ', '27%', 'gold'], ['กองทุนรวม', '25%', 'blue'], ['เงินสด', '10%', 'coral']]
                    ).map(([name, value, color]) => (
                      <div key={name}><span className={`allocation-dot ${color}`} /><small>{name}</small><strong>{value}</strong></div>
                    ))}
                  </div>
                </article>
                <article className="panel linked-records-panel">
                  <div className="panel-heading">
                    <div><span className="panel-kicker">ประวัติการบันทึก</span><h2>รายการลงทุนล่าสุด</h2></div>
                    <span className="auto-sync-badge"><Link2 size={13} /> เชื่อม Ledger อัตโนมัติ</span>
                  </div>
                  <div className="holding-list">
                    {customInvestments[mode].map((item) => (
                      <div className="holding-row new-entry" key={`${item.name}-${item.date}`}>
                        <span className="holding-icon"><TrendingUp size={17} /></span>
                        <div><strong>{item.name}</strong><small>{item.category} · {item.date}</small></div>
                        <strong>{item.amount}</strong>
                      </div>
                    ))}
                    {(isPersonal
                      ? [['Bitcoin', 'สินทรัพย์ดิจิทัล', '฿523,800'], ['กองทุน SET50', 'กองทุนรวม', '฿349,390'], ['หุ้นสหกรณ์', 'เงินฝาก/สหกรณ์', '฿249,560']]
                      : [['PTT', 'หุ้นไทย', '฿259,500'], ['Global Equity', 'หุ้นต่างประเทศ', '฿184,750'], ['กองทุน RMF', 'กองทุนรวม', '฿171,060']]
                    ).map(([name, category, amount]) => (
                      <div className="holding-row" key={name}>
                        <span className="holding-icon"><TrendingUp size={17} /></span>
                        <div><strong>{name}</strong><small>{category}</small></div>
                        <strong>{amount}</strong>
                      </div>
                    ))}
                  </div>
                </article>
              </div>
              <div className="link-explainer">
                <Link2 size={20} />
                <div><strong>บันทึกครั้งเดียว เชื่อมโยงทุก Ledger</strong><span>เมื่อซื้อการลงทุน ระบบจะเพิ่มสินทรัพย์ในพอร์ตและบันทึกเงินออกในรายรับ–รายจ่ายให้อัตโนมัติ</span></div>
              </div>
            </section>
          )}

          {activeNav === 'assets' && (
            <section className="focus-page">
              <div className="link-explainer asset-explainer">
                <Link2 size={20} />
                <div><strong>ทะเบียนทรัพย์สินเชื่อมกับรายรับ–รายจ่าย</strong><span>เมื่อเพิ่มรายการซื้อทรัพย์สิน ระบบจะสร้างรายจ่ายหมวด “ซื้อทรัพย์สิน” ใน Ledger ให้อัตโนมัติ</span></div>
                <button className="secondary-button" onClick={() => setActiveNav('ledger')}>เปิดดู Ledger <ArrowUpRight size={14} /></button>
              </div>
              <div className="focus-stat-grid">
                <article><span>ทรัพย์สินทั้งหมด</span><strong>{assets.length}</strong><small>รายการในทะเบียน</small></article>
                <article><span>มูลค่ารวม</span><strong>{baht(assetRegistryTotal)}</strong><small>มูลค่าประมาณการ</small></article>
                <article><span>เอกสารที่จัดเก็บ</span><strong>{assets.reduce((sum, asset) => sum + asset.docs, 0)}</strong><small>PDF / รูปภาพ</small></article>
              </div>
              <article className="panel assets-panel assets-focus-panel">
                <div className="panel-heading asset-heading">
                  <div><span className="panel-kicker">ทะเบียนกลาง</span><h2>รายการทรัพย์สินทั้งหมด</h2></div>
                  <div className="asset-actions">
                    <button className="secondary-button" onClick={() => setShowUpload(true)}><Upload size={16} /> อัปโหลดเอกสาร</button>
                    <button className="primary-button" onClick={() => openEntryForm('asset')}><Plus size={16} /> ซื้อทรัพย์สิน</button>
                  </div>
                </div>
                <div className="asset-table">
                  <div className="asset-table-head"><span>รายการทรัพย์สิน</span><span>มูลค่าโดยประมาณ</span><span>อัปเดตล่าสุด</span><span>เอกสาร</span></div>
                  {assets.map((asset, index) => (
                    <div className={`asset-row ${index < customAssets[mode].length ? 'new-entry' : ''}`} key={`${asset.name}-${index}`}>
                      <div className="asset-name">
                        <span className="asset-emoji">{asset.icon}</span>
                        <div><strong>{asset.name}</strong><small>{asset.category}</small></div>
                      </div>
                      <strong>{asset.value}</strong>
                      <span>{asset.updated}</span>
                      <button className="doc-pill" onClick={() => setShowUpload(true)}><FolderOpen size={15} /> {asset.docs} ไฟล์</button>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          )}
        </div>
      </main>

      <nav className="mobile-nav" aria-label="เมนูมือถือ">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon
          return (
            <button
              className={activeNav === item.key ? 'active' : ''}
              key={item.key}
              onClick={() => setActiveNav(item.key)}
            >
              <Icon size={20} />
              <span>{item.key === 'overview' ? 'ภาพรวม' : item.key === 'tasks' ? 'งาน' : item.key === 'ledger' ? 'บัญชี' : item.key === 'investment' ? 'ลงทุน' : 'ทรัพย์สิน'}</span>
            </button>
          )
        })}
      </nav>

      {showUpload && (
        <div className="modal-backdrop" onMouseDown={() => setShowUpload(false)}>
          <section className="upload-modal" role="dialog" aria-modal="true" aria-labelledby="upload-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-heading">
              <div>
                <span className="panel-kicker">คลังเอกสารทรัพย์สิน</span>
                <h2 id="upload-title">อัปโหลดเอกสาร</h2>
                <p>เก็บโฉนด สัญญาซื้อขาย ใบเสร็จ หรือภาพถ่ายไว้กับรายการทรัพย์สิน</p>
              </div>
              <button className="icon-button" aria-label="ปิด" onClick={() => setShowUpload(false)}>
                <X size={20} />
              </button>
            </div>
            <label className="dropzone">
              <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={handleFiles} />
              <span className="upload-icon"><Upload size={24} /></span>
              <strong>ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์</strong>
              <small>รองรับ PDF, JPG และ PNG · สูงสุด 10 MB ต่อไฟล์</small>
              <span className="choose-file">เลือกไฟล์จากเครื่อง</span>
            </label>
            <div className="file-types">
              <div><FileText size={18} /><span><strong>PDF</strong><small>โฉนดและสัญญา</small></span></div>
              <div><Image size={18} /><span><strong>JPG / PNG</strong><small>ภาพทรัพย์สิน</small></span></div>
              <div><ShieldCheck size={18} /><span><strong>Private</strong><small>เฉพาะครอบครัว</small></span></div>
            </div>
            {files.length > 0 && (
              <div className="selected-files">
                <span>ไฟล์ที่เลือก ({files.length})</span>
                {files.map((selectedFile) => (
                  <div key={`${selectedFile.name}-${selectedFile.size}`}>
                    <File size={17} />
                    <strong>{selectedFile.name}</strong>
                    <small>{(selectedFile.size / 1024).toFixed(0)} KB</small>
                  </div>
                ))}
              </div>
            )}
            <div className="modal-actions">
              <button className="secondary-button" onClick={() => setShowUpload(false)}>ยกเลิก</button>
              <button className="primary-button" disabled={files.length === 0} onClick={() => setShowUpload(false)}>
                <Upload size={17} /> อัปโหลด {files.length > 0 ? `${files.length} ไฟล์` : ''}
              </button>
            </div>
          </section>
        </div>
      )}

      {showEntry && (
        <div className="modal-backdrop" onMouseDown={() => setShowEntry(false)}>
          <form
            className="upload-modal entry-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="entry-title"
            onMouseDown={(event) => event.stopPropagation()}
            onSubmit={(event) => {
              event.preventDefault()
              saveEntry()
            }}
          >
            <div className="modal-heading">
              <div>
                <span className="panel-kicker">บันทึกครั้งเดียว เชื่อมโยงอัตโนมัติ</span>
                <h2 id="entry-title">เพิ่มรายการใหม่</h2>
                <p>เลือกลักษณะรายการ ระบบจะส่งข้อมูลไปยัง Ledger ที่เกี่ยวข้องให้เอง</p>
              </div>
              <button type="button" className="icon-button" aria-label="ปิด" onClick={() => setShowEntry(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="entry-type-grid">
              {([
                ['expense', 'รายจ่าย', WalletCards],
                ['income', 'รายรับ', ArrowDownRight],
                ['asset', 'ซื้อทรัพย์สิน', Landmark],
                ['investment', 'ซื้อการลงทุน', TrendingUp],
              ] as const).map(([kind, label, Icon]) => (
                <button
                  type="button"
                  className={entryKind === kind ? 'active' : ''}
                  key={kind}
                  onClick={() => {
                    setEntryKind(kind)
                    setEntryCategory(kind === 'asset' ? 'อุปกรณ์' : kind === 'investment' ? 'กองทุนรวม' : 'ทั่วไป')
                  }}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {(entryKind === 'asset' || entryKind === 'investment') && (
              <div className="entry-link-preview">
                <Link2 size={18} />
                <div>
                  <strong>
                    จะบันทึก 2 ที่: {entryKind === 'asset' ? 'ทะเบียนทรัพย์สิน + รายจ่าย' : 'พอร์ตลงทุน + เงินออก'}
                  </strong>
                  <span>ข้อมูลทั้งสองส่วนจะอ้างอิงรายการเดียวกันและไม่ต้องกรอกซ้ำ</span>
                </div>
              </div>
            )}

            <div className="form-grid">
              <label className="form-field full">
                <span>{entryKind === 'asset' ? 'ชื่อทรัพย์สิน' : entryKind === 'investment' ? 'ชื่อหลักทรัพย์/กองทุน' : 'ชื่อรายการ'}</span>
                <input
                  autoFocus
                  required
                  value={entryName}
                  onChange={(event) => setEntryName(event.target.value)}
                  placeholder={entryKind === 'asset' ? 'เช่น กล้องถ่ายรูป Sony A7' : entryKind === 'investment' ? 'เช่น กองทุน Global Equity' : 'ระบุชื่อรายการ'}
                />
              </label>
              <label className="form-field">
                <span>จำนวนเงิน (บาท)</span>
                <input
                  required
                  min="1"
                  step="0.01"
                  type="number"
                  value={entryAmount}
                  onChange={(event) => setEntryAmount(event.target.value)}
                  placeholder="0.00"
                />
              </label>
              <label className="form-field">
                <span>หมวดหมู่</span>
                <select value={entryCategory} onChange={(event) => setEntryCategory(event.target.value)}>
                  {(entryKind === 'asset'
                    ? ['อุปกรณ์', 'ยานพาหนะ', 'อสังหาริมทรัพย์', 'ของใช้ในบ้าน']
                    : entryKind === 'investment'
                      ? ['กองทุนรวม', 'หุ้น', 'สินทรัพย์ดิจิทัล', 'เงินฝาก/สหกรณ์']
                      : entryKind === 'income'
                        ? ['เงินเดือน', 'บำนาญ', 'ปันผล', 'ดอกเบี้ย', 'ทั่วไป']
                        : ['อาหาร', 'เดินทาง', 'สุขภาพ', 'บ้าน', 'ทั่วไป']
                  ).map((category) => <option value={category} key={category}>{category}</option>)}
                </select>
              </label>
              <label className="form-field">
                <span>วันที่</span>
                <input type="date" defaultValue="2026-07-27" />
              </label>
              <label className="form-field">
                <span>บัญชีที่ชำระ</span>
                <select defaultValue="ธนาคารกรุงไทย">
                  <option>ธนาคารกรุงไทย</option>
                  <option>เงินสด</option>
                  <option>บัญชีสหกรณ์</option>
                </select>
              </label>
            </div>

            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setShowEntry(false)}>ยกเลิก</button>
              <button type="submit" className="primary-button" disabled={!entryName.trim() || !entryAmount}>
                <Save size={17} /> บันทึกรายการ
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default App
