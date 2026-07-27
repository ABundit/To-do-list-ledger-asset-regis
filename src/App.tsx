import { useMemo, useState, type ChangeEvent } from 'react'
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
  ListTodo,
  MoreHorizontal,
  Plus,
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

const personalTransactions = [
  { title: 'เงินบำนาญ', date: '25 ก.ค. 2569', amount: '+฿24,500', tone: 'income', icon: Landmark },
  { title: 'ซื้อของใช้ในบ้าน', date: '24 ก.ค. 2569', amount: '−฿1,280', tone: 'expense', icon: WalletCards },
  { title: 'เงินปันผลกองทุนรวม', date: '23 ก.ค. 2569', amount: '+฿3,450', tone: 'income', icon: TrendingUp },
  { title: 'ดอกเบี้ยสหกรณ์', date: '22 ก.ค. 2569', amount: '+฿1,860', tone: 'income', icon: Landmark },
]

const workTransactions = [
  { title: 'เงินเดือนประจำเดือน', date: '25 ก.ค. 2569', amount: '+฿58,500', tone: 'income', icon: BriefcaseBusiness },
  { title: 'ค่าเดินทางหน้างาน', date: '24 ก.ค. 2569', amount: '−฿860', tone: 'expense', icon: WalletCards },
  { title: 'ค่าอุปกรณ์สำนักงาน', date: '23 ก.ค. 2569', amount: '−฿1,450', tone: 'expense', icon: FileText },
  { title: 'เบี้ยเลี้ยงโครงการ', date: '22 ก.ค. 2569', amount: '+฿2,400', tone: 'income', icon: BriefcaseBusiness },
]

const assetRows = [
  { icon: '🏠', name: 'บ้านพักอาศัย', category: 'อสังหาริมทรัพย์', value: '฿3,850,000', updated: '12 ก.ค. 2569', docs: 3 },
  { icon: '🚙', name: 'Toyota Corolla Cross', category: 'ยานพาหนะ', value: '฿890,000', updated: '4 มิ.ย. 2569', docs: 2 },
  { icon: '💻', name: 'MacBook Pro 14"', category: 'อุปกรณ์', value: '฿72,900', updated: '18 พ.ค. 2569', docs: 1 },
]

const workAssetRows = [
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
  const [files, setFiles] = useState<File[]>([])
  const [member, setMember] = useState('somchai')

  const isPersonal = mode === 'personal'
  const tasks = isPersonal ? personalTasks : workTasks
  const transactions = isPersonal ? personalTransactions : workTransactions
  const assets = isPersonal ? assetRows : workAssetRows
  const meta = navMeta[activeNav]

  const totals = useMemo(
    () =>
      isPersonal
        ? [
            { label: 'ทรัพย์สินสุทธิ', value: '฿5,482,350', trend: '+6.4%', type: 'up', note: 'จากเดือนที่แล้ว' },
            { label: 'รายรับเดือนนี้', value: '฿48,260', trend: '+8.2%', type: 'up', note: 'รวมทุกแหล่งรายได้' },
            { label: 'รายจ่ายเดือนนี้', value: '฿21,840', trend: '−3.1%', type: 'down', note: 'ต่ำกว่าเดือนที่แล้ว' },
            { label: 'งานที่ต้องทำ', value: '8 งาน', trend: '3', type: 'task', note: 'งานสำคัญวันนี้' },
          ]
        : [
            { label: 'รายรับจากงาน', value: '฿60,900', trend: '+4.1%', type: 'up', note: 'จากเดือนที่แล้ว' },
            { label: 'ค่าใช้จ่ายงาน', value: '฿12,640', trend: '−2.6%', type: 'down', note: 'อยู่ในงบประมาณ' },
            { label: 'งบโครงการคงเหลือ', value: '฿184,500', trend: '72%', type: 'up', note: 'ของงบโครงการ' },
            { label: 'งานที่ต้องทำ', value: '11 งาน', trend: '4', type: 'task', note: 'งานเร่งด่วนวันนี้' },
          ],
    [isPersonal],
  )

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files))
    }
  }

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode)
    setCompletedTasks([])
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
            <button className="primary-button" onClick={() => (activeNav === 'assets' ? setShowUpload(true) : undefined)}>
              <Plus size={18} />
              {activeNav === 'assets' ? 'เพิ่มทรัพย์สิน' : 'เพิ่มรายการใหม่'}
            </button>
          </section>

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
                  <strong>{isPersonal ? '฿1,247,830' : '฿684,250'}</strong>
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
    </div>
  )
}

export default App
