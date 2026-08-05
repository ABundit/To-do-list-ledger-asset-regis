import { useState, type ChangeEvent, useEffect, useRef } from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
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
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskTag, setNewTaskTag] = useState('ทั่วไป')
  const [newTaskUrgent, setNewTaskUrgent] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [member, setMember] = useState('somchai')
  const [entryKind, setEntryKind] = useState<EntryKind>('expense')
  const [entryName, setEntryName] = useState('')
  const [entryAmount, setEntryAmount] = useState('')
  const [entryCategory, setEntryCategory] = useState('ทั่วไป')
  const [savedMessage, setSavedMessage] = useState('')
  const [period, setPeriod] = useState<'monthly' | '6m' | 'annual'>('6m')
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [ledgerFilter, setLedgerFilter] = useState<'all' | 'income' | 'expense' | 'linked'>('all')
  const [showReport, setShowReport] = useState(false)
  const [showTxDetail, setShowTxDetail] = useState(false)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [showAssetDetail, setShowAssetDetail] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<AssetRow | null>(null)
  const [showExport, setShowExport] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showDocViewer, setShowDocViewer] = useState(false)
  const [selectedDocAsset, setSelectedDocAsset] = useState<AssetRow | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

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
  const [customTasks, setCustomTasks] = useState<Record<Mode, { id: number; title: string; meta: string; tag: string; urgent: boolean }[]>>({
    personal: [],
    work: [],
  })

  const allPersonalTasks = [...customTasks.personal, ...personalTasks]
  const allWorkTasks = [...customTasks.work, ...workTasks]

  const isPersonal = mode === 'personal'
  const tasks = isPersonal ? allPersonalTasks : allWorkTasks
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

  const generatePDF = async (elementId: string, filename: string) => {
    console.log('PDF button clicked')
    const element = document.getElementById(elementId)
    if (!element) {
      console.error('Element not found for PDF generation:', elementId)
      setSavedMessage('ไม่พบเนื้อหาที่ต้องการส่งออก')
      return
    }
    try {
      console.log('Starting PDF generation...')
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: true,
      })
      const imgData = canvas.toDataURL('image/jpeg', 0.98)
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight)
      const finalWidth = imgWidth * ratio
      const finalHeight = imgHeight * ratio
      pdf.addImage(imgData, 'JPEG', 0, 0, finalWidth, finalHeight)
      pdf.save(filename)
      console.log('PDF generated successfully')
      setSavedMessage('ส่งออก PDF เรียบร้อยแล้ว')
    } catch (error) {
      console.error('PDF generation failed:', error)
      setSavedMessage('เกิดข้อผิดพลาดในการส่งออก PDF')
    }
  }

  const generateAssetPDF = (asset: AssetRow) => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      pdf.setFontSize(16)
      pdf.text('รายละเอียดทรัพย์สิน', 14, 20)
      pdf.setFontSize(11)
      pdf.text(`ชื่อ: ${asset.name}`, 14, 35)
      pdf.text(`หมวดหมู่: ${asset.category}`, 14, 45)
      pdf.text(`มูลค่า: ${asset.value}`, 14, 55)
      pdf.text(`อัปเดตล่าสุด: ${asset.updated}`, 14, 65)
      pdf.text(`เอกสาร: ${asset.docs} ไฟล์`, 14, 75)
      pdf.save(`${asset.name}-รายละเอียด.pdf`)
      setSavedMessage('ส่งออก PDF เรียบร้อยแล้ว')
    } catch (error) {
      console.error('Asset PDF generation failed:', error)
      setSavedMessage('เกิดข้อผิดพลาดในการส่งออก PDF')
    }
  }

  const generateIncomePDF = () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      pdf.setFontSize(16)
      pdf.text('รายงานรายรับ', 14, 20)
      pdf.setFontSize(11)
      const incomeTxns = transactions.filter((t) => t.tone === 'income')
      let y = 35
      incomeTxns.forEach((t) => {
        pdf.text(`${t.date}  ${t.title}  ${t.amount}`, 14, y)
        y += 10
      })
      pdf.setFontSize(12)
      pdf.text(`รวมรายรับ: ${baht(currentTotals.income)}`, 14, y + 5)
      pdf.save('รายรับ.pdf')
      setSavedMessage('ส่งออก PDF เรียบร้อยแล้ว')
    } catch (error) {
      console.error('Income PDF generation failed:', error)
      setSavedMessage('เกิดข้อผิดพลาดในการส่งออก PDF')
    }
  }

  const generateExpensePDF = () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      pdf.setFontSize(16)
      pdf.text('รายงานรายจ่าย', 14, 20)
      pdf.setFontSize(11)
      const expenseTxns = transactions.filter((t) => t.tone === 'expense')
      let y = 35
      expenseTxns.forEach((t) => {
        pdf.text(`${t.date}  ${t.title}  ${t.amount}`, 14, y)
        y += 10
      })
      pdf.setFontSize(12)
      pdf.text(`รวมรายจ่าย: ${baht(currentTotals.expense)}`, 14, y + 5)
      pdf.save('รายจ่าย.pdf')
      setSavedMessage('ส่งออก PDF เรียบร้อยแล้ว')
    } catch (error) {
      console.error('Expense PDF generation failed:', error)
      setSavedMessage('เกิดข้อผิดพลาดในการส่งออก PDF')
    }
  }

  const generateAssetRegistryPDF = () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      pdf.setFontSize(16)
      pdf.text('ทะเบียนทรัพย์สิน', 14, 20)
      pdf.setFontSize(11)
      let y = 35
      assets.forEach((asset) => {
        pdf.text(`${asset.icon} ${asset.name}  ${asset.category}  ${asset.value}  อัปเดต: ${asset.updated}`, 14, y)
        y += 10
      })
      pdf.setFontSize(12)
      pdf.text(`มูลค่ารวม: ${baht(assetRegistryTotal)}`, 14, y + 5)
      pdf.save('ทะเบียนทรัพย์สิน.pdf')
      setSavedMessage('ส่งออก PDF เรียบร้อยแล้ว')
    } catch (error) {
      console.error('Asset registry PDF generation failed:', error)
      setSavedMessage('เกิดข้อผิดพลาดในการส่งออก PDF')
    }
  }

  const generateLinkedPDF = () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      pdf.setFontSize(16)
      pdf.text('รายการที่เชื่อมโยง', 14, 20)
      pdf.setFontSize(11)
      const linkedTxns = transactions.filter((t) => t.linkedTo)
      let y = 35
      linkedTxns.forEach((t) => {
        pdf.text(`${t.date}  ${t.title}  ${t.amount}  ${t.linkedTo === 'asset' ? 'ทะเบียนทรัพย์สิน' : 'พอร์ตลงทุน'}`, 14, y)
        y += 10
      })
      pdf.setFontSize(12)
      pdf.text(`รวมที่เชื่อมโยง: ${baht(currentTotals.linked)}`, 14, y + 5)
      pdf.save('รายการที่เชื่อมโยง.pdf')
      setSavedMessage('ส่งออก PDF เรียบร้อยแล้ว')
    } catch (error) {
      console.error('Linked PDF generation failed:', error)
      setSavedMessage('เกิดข้อผิดพลาดในการส่งออก PDF')
    }
  }

  const generateInvestmentPDF = () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      pdf.setFontSize(16)
      pdf.text('พอร์ตการลงทุน', 14, 20)
      pdf.setFontSize(11)
      let y = 35
      const allInvestments = [...customInvestments[mode]]
      const defaultInvestments = isPersonal
        ? [['Bitcoin', 'สินทรัพย์ดิจิทัล', '฿523,800'], ['กองทุน SET50', 'กองทุนรวม', '฿349,390'], ['หุ้นสหกรณ์', 'เงินฝาก/สหกรณ์', '฿249,560']]
        : [['PTT', 'หุ้นไทย', '฿259,500'], ['Global Equity', 'หุ้นต่างประเทศ', '฿184,750'], ['กองทุน RMF', 'กองทุนรวม', '฿171,060']]
      allInvestments.forEach((item) => {
        pdf.text(`${item.name}  ${item.category}  ${item.amount}  ${item.date}`, 14, y)
        y += 10
      })
      defaultInvestments.forEach(([name, category, amount]) => {
        pdf.text(`${name}  ${category}  ${amount}`, 14, y)
        y += 10
      })
      pdf.setFontSize(12)
      pdf.text(`มูลค่าพอร์ตรวม: ${baht(investmentTotal)}`, 14, y + 5)
      pdf.save('พอร์ตการลงทุน.pdf')
      setSavedMessage('ส่งออก PDF เรียบร้อยแล้ว')
    } catch (error) {
      console.error('Investment PDF generation failed:', error)
      setSavedMessage('เกิดข้อผิดพลาดในการส่งออก PDF')
    }
  }

  const periodChartData = {
    monthly: {
      labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.'],
      income: [42000, 45000, 48000, 47000, 50000, 48260, 48260],
      expense: [18000, 19500, 21000, 20500, 22000, 21840, 21840],
    },
    '6m': {
      labels: ['ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.'],
      income: [228000, 235000, 240000, 245000, 242000, 241300],
      expense: [115000, 118000, 120000, 122000, 121000, 120000],
    },
    annual: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      income: [700000, 750000, 780000, 800000],
      expense: [450000, 470000, 460000, 480000],
    },
  }

  const currentChart = periodChartData[period]
  const maxChartValue = Math.max(...currentChart.income, ...currentChart.expense)

  const linkedTransactions = transactions.filter((t) => t.linkedTo)
  const linkedTotal = linkedTransactions.reduce((sum, t) => sum + (t.rawAmount ?? 0), 0)

  const periodTotals = {
    monthly: { income: monthlyIncome, expense: monthlyExpense, linked: linkedTotal },
    '6m': { income: monthlyIncome * 6, expense: monthlyExpense * 6, linked: linkedTotal * 6 },
    annual: { income: monthlyIncome * 12, expense: monthlyExpense * 12, linked: linkedTotal * 12 },
  }
  const currentTotals = periodTotals[period]

  const totals = isPersonal
    ? [
            { label: 'ทรัพย์สินสุทธิ', value: baht(5_482_350 + customAssetTotal + customInvestmentTotal), trend: '+6.4%', type: 'up', note: 'จากเดือนที่แล้ว' },
            { label: 'รายรับ', value: baht(currentTotals.income), trend: '+8.2%', type: 'up', note: `${period === 'monthly' ? 'รายเดือน' : period === '6m' ? '6 เดือน' : 'รายปี'}` },
            { label: 'รายจ่าย', value: baht(currentTotals.expense), trend: '−3.1%', type: 'down', note: 'รวมรายการเชื่อมโยง' },
            { label: 'เชื่อมโยง', value: baht(currentTotals.linked), trend: 'ลิงก์', type: 'up', note: 'ทรัพย์สิน/การลงทุน' },
          ]
    : [
            { label: 'รายรับจากงาน', value: baht(currentTotals.income), trend: '+4.1%', type: 'up', note: `${period === 'monthly' ? 'รายเดือน' : period === '6m' ? '6 เดือน' : 'รายปี'}` },
            { label: 'ค่าใช้จ่ายงาน', value: baht(currentTotals.expense), trend: '−2.6%', type: 'down', note: 'รวมรายการเชื่อมโยง' },
            { label: 'เชื่อมโยง', value: baht(currentTotals.linked), trend: 'ลิงก์', type: 'up', note: 'ทรัพย์สิน/การลงทุน' },
            { label: 'งบโครงการคงเหลือ', value: '฿184,500', trend: '72%', type: 'up', note: 'ของงบโครงการ' },
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

  const saveTask = () => {
    if (!newTaskTitle.trim()) return
    const newTask = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      meta: 'วันนี้ · ยังไม่กำหนดเวลา',
      tag: newTaskTag,
      urgent: newTaskUrgent,
    }
    setCustomTasks((current) => ({
      ...current,
      [mode]: [newTask, ...current[mode]],
    }))
    setNewTaskTitle('')
    setNewTaskTag('ทั่วไป')
    setNewTaskUrgent(false)
    setShowTaskForm(false)
    setSavedMessage(`เพิ่มงานใหม่ “${newTaskTitle.trim()}” แล้ว`)
  }

  return (
    <div className="app-shell" ref={menuRef}>
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
            {totals.map((stat, index) => {
                const getNavForStat = (label: string) => {
                  if (label.includes('ทรัพย์สิน')) return 'assets'
                  if (label.includes('รายรับ')) return 'ledger'
                  if (label.includes('รายจ่าย')) return 'ledger'
                  if (label.includes('เชื่อม')) return 'investment'
                  if (label.includes('งบ')) return 'tasks'
                  return 'overview'
                }
                const exportStatPDF = (label: string) => {
                  if (label.includes('ทรัพย์สิน')) generateAssetRegistryPDF()
                  else if (label.includes('รายรับ')) generateIncomePDF()
                  else if (label.includes('รายจ่าย')) generateExpensePDF()
                  else if (label.includes('เชื่อม')) generateLinkedPDF()
                  else generateAssetRegistryPDF()
                }
                return (
                  <article className={`stat-card stat-${index + 1}`} key={stat.label}>
                    <div className="stat-card-top">
                      <span>{stat.label}</span>
                      <div className="dropdown">
                        <button aria-label={`ตัวเลือก${stat.label}`} onClick={() => setOpenMenu(openMenu === `stat-${index}` ? null : `stat-${index}`)}>
                          <MoreHorizontal size={18} />
                        </button>
                        {openMenu === `stat-${index}` && (
                          <div className="dropdown-menu">
                            <button className="dropdown-item" onClick={() => { setOpenMenu(null); setActiveNav(getNavForStat(stat.label)) }}>ดูรายละเอียด</button>
                            <button className="dropdown-item" onClick={() => { setOpenMenu(null); exportStatPDF(stat.label) }}>ส่งออก PDF</button>
                            <button className="dropdown-item" onClick={() => { setOpenMenu(null); setShowShare(true) }}>แชร์</button>
                          </div>
                        )}
                      </div>
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
             );
             })}
          </section>

          <section className="dashboard-grid">
            <article className="panel cashflow-panel">
              <div className="panel-heading">
                <div>
                  <span className="panel-kicker">กระแสเงินสด</span>
                  <h2>รายรับและรายจ่าย</h2>
                </div>
                <div className="dropdown">
                  <button className="period-button" onClick={() => setOpenMenu(openMenu === 'period' ? null : 'period')}>
                    {period === 'monthly' ? 'รายเดือน' : period === '6m' ? '6 เดือนล่าสุด' : 'รายปี'} <ChevronDown size={14} />
                  </button>
                  {openMenu === 'period' && (
                    <div className="dropdown-menu">
                      {(['monthly', '6m', 'annual'] as const).map((p) => (
                        <button
                          key={p}
                          className={`dropdown-item ${period === p ? 'active' : ''}`}
                          onClick={() => { setPeriod(p); setOpenMenu(null) }}
                        >
                          {p === 'monthly' ? 'รายเดือน' : p === '6m' ? '6 เดือน' : 'รายปี'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="cash-summary">
                <div>
                  <span className="dot income-dot" />
                  <small>รายรับทั้งหมด</small>
                  <strong>{baht(currentTotals.income)}</strong>
                </div>
                <div>
                  <span className="dot expense-dot" />
                  <small>รายจ่ายทั้งหมด</small>
                  <strong>{baht(currentTotals.expense)}</strong>
                </div>
                <div>
                  <span className="dot" style={{ background: '#a26925' }} />
                  <small>เชื่อมโยง</small>
                  <strong>{baht(currentTotals.linked)}</strong>
                </div>
                <div className="net-badge">
                  <TrendingUp size={15} /> สุทธิ {baht(currentTotals.income - currentTotals.expense)}
                </div>
              </div>
              <div className="chart" aria-label={`กราฟรายรับรายจ่าย ${period === 'monthly' ? 'รายเดือน' : period === '6m' ? '6 เดือน' : 'รายปี'}`}>
                {currentChart.labels.map((label, index) => {
                  const incomeHeight = Math.max(10, (currentChart.income[index] / maxChartValue) * 100)
                  const expenseHeight = Math.max(10, (currentChart.expense[index] / maxChartValue) * 100)
                  return (
                    <div className="chart-month" key={label}>
                      <div className="bar-group">
                        <span className="bar income-bar" style={{ height: `${incomeHeight}%` }} />
                        <span className="bar expense-bar" style={{ height: `${expenseHeight}%` }} />
                      </div>
                      <small>{label}</small>
                    </div>
                  )
                })}
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
              <button className="add-task" onClick={() => setShowTaskForm(true)}>
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
                <button className="text-button" onClick={() => setActiveNav('ledger')}>
                  ดูทั้งหมด <ArrowUpRight size={15} />
                </button>
              </div>
               <div className="transaction-list">
                 {transactions.map((transaction) => {
                   const Icon = transaction.icon
                   return (
                     <div
                       className="transaction-row clickable"
                       key={transaction.title}
                       onClick={() => { setSelectedTx(transaction); setShowTxDetail(true) }}
                     >
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
                <div className="dropdown">
                  <button className="icon-button subtle" aria-label="ตัวเลือกการลงทุน" onClick={() => setOpenMenu(openMenu === 'investment' ? null : 'investment')}>
                    <MoreHorizontal size={18} />
                  </button>
{openMenu === 'investment' && (
                       <div className="dropdown-menu">
                         <button className="dropdown-item" onClick={() => { setOpenMenu(null); setActiveNav('investment') }}>ดูพอร์ตเต็ม</button>
                         <button className="dropdown-item" onClick={() => { setOpenMenu(null); openEntryForm('investment') }}>เพิ่มการลงทุน</button>
                         <button className="dropdown-item" onClick={() => { setOpenMenu(null); generateInvestmentPDF() }}>ส่งออก PDF</button>
                       </div>
                   )}
                </div>
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
                <div className="dropdown">
                  <button className="icon-button subtle" aria-label="ตัวเลือกทรัพย์สิน" onClick={() => setOpenMenu(openMenu === 'assets' ? null : 'assets')}>
                    <MoreHorizontal size={18} />
                  </button>
{openMenu === 'assets' && (
                       <div className="dropdown-menu">
                         <button className="dropdown-item" onClick={() => { setOpenMenu(null); setActiveNav('assets') }}>ดูรีพอร์ต</button>
                         <button className="dropdown-item" onClick={() => { setOpenMenu(null); generateAssetRegistryPDF() }}>ส่งออก PDF</button>
                         <button className="dropdown-item" onClick={() => { setOpenMenu(null); openEntryForm('asset') }}>เพิ่มทรัพย์สิน</button>
                       </div>
                   )}
                </div>
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
                  <div
                    className="asset-row clickable"
                    key={asset.name}
                    onClick={() => { setSelectedAsset(asset); setShowAssetDetail(true) }}
                  >
                    <div className="asset-name">
                      <span className="asset-emoji">{asset.icon}</span>
                      <div>
                        <strong>{asset.name}</strong>
                        <small>{asset.category}</small>
                      </div>
                      <div className="dropdown">
                        <button className="icon-button subtle" aria-label="ตัวเลือกทรัพย์สิน" onClick={(event) => { event.stopPropagation(); setOpenMenu(openMenu === `asset-${asset.name}` ? null : `asset-${asset.name}`) }}>
                          <MoreHorizontal size={16} />
                        </button>
                        {openMenu === `asset-${asset.name}` && (
                          <div className="dropdown-menu">
                            <button className="dropdown-item" onClick={(event) => { event.stopPropagation(); setOpenMenu(null); setSelectedAsset(asset); setShowAssetDetail(true) }}>รายละเอียด</button>
                            <button className="dropdown-item" onClick={(event) => { event.stopPropagation(); setOpenMenu(null); generateAssetPDF(asset) }}>ส่งออก PDF</button>
                            <button className="dropdown-item" onClick={(event) => { event.stopPropagation(); setOpenMenu(null); setSelectedDocAsset(asset); setShowDocViewer(true) }}>เอกสาร</button>
                          </div>
                        )}
                      </div>
                    </div>
                   <strong>{asset.value}</strong>
                   <span>{asset.updated}</span>
                   <button className="doc-pill" onClick={(event) => { event.stopPropagation(); setSelectedDocAsset(asset); setShowDocViewer(true) }}>
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
                <article><span>งานทั้งหมด</span><strong>{tasks.length}</strong><small>รายการ</small></article>
                <article><span>เสร็จแล้ววันนี้</span><strong>{completedTasks.length}</strong><small>จาก {tasks.length} งานวันนี้</small></article>
                <article><span>งานเร่งด่วน</span><strong>{tasks.filter((task) => task.urgent).length}</strong><small>ควรจัดการก่อน</small></article>
              </div>
              <article className="panel focus-panel task-focus-panel">
                <div className="panel-heading">
                  <div>
                    <span className="panel-kicker">{isPersonal ? 'งานส่วนตัว' : 'งานที่ทำงาน'}</span>
                    <h2>รายการสิ่งที่ต้องทำวันนี้</h2>
                  </div>
                  <button className="primary-button" onClick={() => setShowTaskForm(true)}><Plus size={17} /> เพิ่มงาน</button>
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
              {(() => {
                const filteredIncomes = transactions.filter((t) => t.tone === 'income')
                const filteredExpenses = transactions.filter((t) => t.tone === 'expense')
                const linkedTransactions = transactions.filter((t) => t.linkedTo)
                const totalIncome = filteredIncomes.reduce((sum, t) => sum + (t.rawAmount ?? 0), 0)
                const totalExpense = filteredExpenses.reduce((sum, t) => sum + (t.rawAmount ?? 0), 0)
                const totalLinked = linkedTransactions.reduce((sum, t) => sum + (t.rawAmount ?? 0), 0)
                const displayTransactions = ledgerFilter === 'income' ? filteredIncomes : ledgerFilter === 'expense' ? filteredExpenses : ledgerFilter === 'linked' ? linkedTransactions : transactions
                return (
                  <>
              <div className="focus-stat-grid ledger-stats">
                <article><span>รายรับ</span><strong className="income">{baht(totalIncome)}</strong><small>รวมทุกแหล่งรายได้</small></article>
                <article><span>รายจ่าย</span><strong className="expense">{baht(totalExpense)}</strong><small>รวมรายการเชื่อมโยง</small></article>
                <article><span>เชื่อมโยง</span><strong>{baht(totalLinked)}</strong><small>รายการที่เชื่อมกับทรัพย์สิน/การลงทุน</small></article>
                <article><span>สุทธิ</span><strong className="income">{baht(totalIncome - totalExpense)}</strong><small>กระแสเงินสด</small></article>
              </div>
              <div className="ledger-toolbar">
                <div className="ledger-tabs">
                  <button className={ledgerFilter === 'all' ? 'active' : ''} onClick={() => setLedgerFilter('all')}>ทั้งหมด</button>
                  <button className={ledgerFilter === 'income' ? 'active' : ''} onClick={() => setLedgerFilter('income')}>รายรับ</button>
                  <button className={ledgerFilter === 'expense' ? 'active' : ''} onClick={() => setLedgerFilter('expense')}>รายจ่าย</button>
                  <button className={ledgerFilter === 'linked' ? 'active' : ''} onClick={() => setLedgerFilter('linked')}>เชื่อมโยง</button>
                </div>
                <button className="primary-button" onClick={() => openEntryForm()}><Plus size={15} /> เพิ่มรายการ</button>
              </div>
              <article className="panel ledger-panel">
                <div className="ledger-table-head">
                  <span>วันที่</span><span>รายการ</span><span>หมวดหมู่</span><span>เชื่อมโยง</span><span>จำนวนเงิน</span>
                </div>
                {displayTransactions.map((transaction, index) => {
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
                  </>
                )
              })()}
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
                        <div className="dropdown">
                          <button className="icon-button subtle" aria-label="ตัวเลือกทรัพย์สิน" onClick={(event) => { event.stopPropagation(); setOpenMenu(openMenu === `asset-${asset.name}` ? null : `asset-${asset.name}`) }}>
                            <MoreHorizontal size={16} />
                          </button>
                          {openMenu === `asset-${asset.name}` && (
                            <div className="dropdown-menu">
                              <button className="dropdown-item" onClick={(event) => { event.stopPropagation(); setOpenMenu(null); setSelectedAsset(asset); setShowAssetDetail(true) }}>รายละเอียด</button>
                              <button className="dropdown-item" onClick={(event) => { event.stopPropagation(); setOpenMenu(null); generateAssetPDF(asset) }}>ส่งออก PDF</button>
                              <button className="dropdown-item" onClick={(event) => { event.stopPropagation(); setOpenMenu(null); setSelectedDocAsset(asset); setShowDocViewer(true) }}>เอกสาร</button>
                            </div>
                          )}
                        </div>
                      </div>
                      <strong>{asset.value}</strong>
                      <span>{asset.updated}</span>
                      <button className="doc-pill" onClick={(event) => { event.stopPropagation(); setSelectedDocAsset(asset); setShowDocViewer(true) }}><FolderOpen size={15} /> {asset.docs} ไฟล์</button>
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

       {showTaskForm && (
         <div className="modal-backdrop" onMouseDown={() => setShowTaskForm(false)}>
           <section className="upload-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
             <div className="modal-heading">
               <div>
                 <span className="panel-kicker">งานใหม่</span>
                 <h2>เพิ่มสิ่งที่ต้องทำ</h2>
                 <p>กรอกข้อมูลงานที่ต้องจัดการ</p>
               </div>
               <button className="icon-button" aria-label="ปิด" onClick={() => setShowTaskForm(false)}>
                 <X size={20} />
               </button>
             </div>
             <div className="form-grid">
               <label className="form-field full">
                 <span>ชื่องาน</span>
                 <input
                   autoFocus
                   required
                   value={newTaskTitle}
                   onChange={(event) => setNewTaskTitle(event.target.value)}
                   placeholder="เช่น จ่ายค่าไฟประจำเดือน"
                 />
               </label>
               <label className="form-field">
                 <span>หมวดหมู่</span>
                 <select value={newTaskTag} onChange={(event) => setNewTaskTag(event.target.value)}>
                   <option>ทั่วไป</option>
                   <option>บ้าน</option>
                   <option>การลงทุน</option>
                   <option>สุขภาพ</option>
                   <option>งาน</option>
                   <option>ประชุม</option>
                   <option>เอกสาร</option>
                 </select>
               </label>
               <label className="form-field">
                 <span>เร่งด่วน</span>
                 <select value={newTaskUrgent ? 'yes' : 'no'} onChange={(event) => setNewTaskUrgent(event.target.value === 'yes')}>
                   <option value="no">ไม่เร่งด่วน</option>
                   <option value="yes">เร่งด่วน</option>
                 </select>
               </label>
             </div>
             <div className="modal-actions">
               <button className="secondary-button" onClick={() => setShowTaskForm(false)}>ยกเลิก</button>
               <button className="primary-button" onClick={saveTask} disabled={!newTaskTitle.trim()}>
                 <Check size={17} /> บันทึกงาน
               </button>
             </div>
           </section>
         </div>
       )}

       {showReport && (
         <div className="modal-backdrop" onMouseDown={() => setShowReport(false)}>
           <section className="upload-modal report-modal" id="report-content" role="dialog" aria-modal="true" aria-labelledby="report-title" onMouseDown={(event) => event.stopPropagation()}>
             <div className="modal-heading">
               <div>
                 <span className="panel-kicker">รีพอร์ตกระแสเงินสด</span>
                 <h2 id="report-title">
                   {period === 'monthly' ? 'รายเดือน' : period === '6m' ? 'ราย 6 เดือน' : 'รายปี'}
                 </h2>
                 <p>สรุปรายรับ รายจ่าย และยอดคงเหลือ</p>
               </div>
               <button className="icon-button" aria-label="ปิด" onClick={() => setShowReport(false)}>
                 <X size={20} />
               </button>
             </div>
             <div className="report-summary">
               <div>
                 <span>รายรับรวม</span>
                 <strong className="income">{baht(period === 'monthly' ? 48260 : period === '6m' ? 284650 : 3200000)}</strong>
               </div>
               <div>
                 <span>รายจ่ายรวม</span>
                 <strong className="expense">{baht(period === 'monthly' ? 21840 : period === '6m' ? 132480 : 1500000)}</strong>
               </div>
               <div>
                 <span>สุทธิ</span>
                 <strong className="income">{baht(period === 'monthly' ? 26420 : period === '6m' ? 152170 : 1700000)}</strong>
               </div>
             </div>
             <div className="report-table">
               <div className="report-table-head">
                 <span>งวด</span>
                 <span>รายรับ</span>
                 <span>รายจ่าย</span>
                 <span>สุทธิ</span>
               </div>
               {(period === 'monthly'
                 ? [['ม.ค.', 42000, 18000, 24000], ['ก.พ.', 45000, 19500, 25500], ['มี.ค.', 48000, 21000, 27000], ['เม.ย.', 47000, 20500, 26500], ['พ.ค.', 50000, 22000, 28000], ['มิ.ย.', 48260, 21840, 26420]]
                 : period === '6m'
                   ? [['ก.พ.', 228000, 115000, 113000], ['มี.ค.', 235000, 118000, 117000], ['เม.ย.', 240000, 120000, 120000], ['พ.ค.', 245000, 122000, 123000], ['มิ.ย.', 242000, 121000, 121000], ['ก.ค.', 241300, 120000, 121300]]
                   : [['Q1', 700000, 450000, 250000], ['Q2', 750000, 470000, 280000], ['Q3', 780000, 460000, 320000], ['Q4', 800000, 480000, 320000]]
               ).map(([label, income, expense, net]) => {
                   const inc = Number(income)
                   const exp = Number(expense)
                   const n = Number(net)
                   return (
                     <div className="report-row" key={label}>
                       <span>{label}</span>
                       <span className="income">{baht(inc)}</span>
                       <span className="expense">{baht(exp)}</span>
                       <span className={n >= 0 ? 'income' : 'expense'}>{baht(n)}</span>
                     </div>
                   )
                 })}
             </div>
             <div className="modal-actions">
               <button className="secondary-button" onClick={() => setShowReport(false)}>ปิด</button>
               <button className="primary-button" onClick={async () => { await generatePDF('report-content', 'รายรับ-รายจ่าย.pdf'); setShowReport(false) }}>
                 <FileText size={17} /> ส่งออก PDF
               </button>
             </div>
           </section>
         </div>
       )}

       {showTxDetail && selectedTx && (
         <div className="modal-backdrop" onMouseDown={() => setShowTxDetail(false)}>
           <section className="upload-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
             <div className="modal-heading">
               <div>
                 <span className="panel-kicker">รายละเอียดรายการ</span>
                 <h2>{selectedTx.title}</h2>
               </div>
               <button className="icon-button" aria-label="ปิด" onClick={() => setShowTxDetail(false)}>
                 <X size={20} />
               </button>
             </div>
             <div className="tx-detail-grid">
               <div><span>วันที่</span><strong>{selectedTx.date}</strong></div>
               <div><span>จำนวน</span><strong className={selectedTx.tone}>{selectedTx.amount}</strong></div>
               <div><span>หมวดหมู่</span><strong>{selectedTx.category ?? (selectedTx.tone === 'income' ? 'รายรับ' : 'ค่าใช้จ่าย')}</strong></div>
               {selectedTx.linkedTo && (
                 <div>
                   <span>เชื่อมโยง</span>
                   <button className="linked-pill" onClick={() => { setShowTxDetail(false); setActiveNav(selectedTx.linkedTo === 'asset' ? 'assets' : 'investment') }}>
                     <Link2 size={12} /> {selectedTx.linkedTo === 'asset' ? 'ทะเบียนทรัพย์สิน' : 'พอร์ตลงทุน'}
                   </button>
                 </div>
               )}
             </div>
             <div className="modal-actions">
               <button className="secondary-button" onClick={() => setShowTxDetail(false)}>ปิด</button>
             </div>
           </section>
         </div>
       )}

       {showAssetDetail && selectedAsset && (
         <div className="modal-backdrop" onMouseDown={() => setShowAssetDetail(false)}>
           <section className="upload-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
             <div className="modal-heading">
               <div>
                 <span className="panel-kicker">รายละเอียดทรัพย์สิน</span>
                 <h2>{selectedAsset.name}</h2>
               </div>
               <button className="icon-button" aria-label="ปิด" onClick={() => setShowAssetDetail(false)}>
                 <X size={20} />
               </button>
             </div>
             <div className="tx-detail-grid">
               <div><span>หมวดหมู่</span><strong>{selectedAsset.category}</strong></div>
               <div><span>มูลค่า</span><strong>{selectedAsset.value}</strong></div>
               <div><span>อัปเดตล่าสุด</span><strong>{selectedAsset.updated}</strong></div>
               <div><span>เอกสาร</span><strong>{selectedAsset.docs} ไฟล์</strong></div>
             </div>
             <div className="modal-actions">
               <button className="secondary-button" onClick={() => setShowAssetDetail(false)}>ปิด</button>
             </div>
           </section>
         </div>
       )}

       {showExport && (
         <div className="modal-backdrop" onMouseDown={() => setShowExport(false)}>
           <section className="upload-modal" id="export-content" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
             <div className="modal-heading">
               <div>
                 <span className="panel-kicker">ส่งออกข้อมูล</span>
                 <h2>ส่งออก PDF</h2>
                 <p>เลือกช่วงเวลาและประเภทข้อมูลที่ต้องการส่งออก</p>
               </div>
               <button className="icon-button" aria-label="ปิด" onClick={() => setShowExport(false)}>
                 <X size={20} />
               </button>
             </div>
             <div className="export-options">
               <label className="form-field">
                 <span>ประเภทข้อมูล</span>
                 <select defaultValue="all">
                   <option value="all">ทั้งหมด</option>
                   <option value="ledger">รายรับ–รายจ่าย</option>
                   <option value="assets">ทรัพย์สิน</option>
                   <option value="investment">การลงทุน</option>
                   <option value="tasks">สิ่งที่ต้องทำ</option>
                 </select>
               </label>
               <label className="form-field">
                 <span>ช่วงเวลา</span>
                 <select defaultValue="monthly">
                   <option value="monthly">รายเดือน</option>
                   <option value="6m">ราย 6 เดือน</option>
                   <option value="annual">รายปี</option>
                 </select>
               </label>
             </div>
             <div className="modal-actions">
               <button className="secondary-button" onClick={() => setShowExport(false)}>ยกเลิก</button>
               <button className="primary-button" onClick={async () => { await generatePDF('export-content', 'รายงาน.pdf'); setShowExport(false) }}>
                 <FileText size={17} /> ส่งออก
               </button>
             </div>
           </section>
         </div>
       )}

       {showShare && (
         <div className="modal-backdrop" onMouseDown={() => setShowShare(false)}>
           <section className="upload-modal" id="share-content" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
             <div className="modal-heading">
               <div>
                 <span className="panel-kicker">แชร์ข้อมูล</span>
                 <h2>แชร์รายงาน</h2>
                 <p>เลือกวิธีการแชร์ข้อมูล</p>
               </div>
               <button className="icon-button" aria-label="ปิด" onClick={() => setShowShare(false)}>
                 <X size={20} />
               </button>
             </div>
             <div className="share-options">
               <button className="share-option" onClick={() => { setShowShare(false); window.open('mailto:?subject=รายงาน BaanBalance&body=เรียนเพื่อน/สมาชิก ขอแชร์รายงาน BaanBalance ดังนี้ครับ/ค่ะ', '_blank') }}>
                 <span className="share-icon">📧</span>
                 <div><strong>อีเมล</strong><small>ส่งไปยังผู้รับ</small></div>
               </button>
               <button className="share-option" onClick={async () => { setShowShare(false); try { await navigator.clipboard.writeText(window.location.href); setSavedMessage('คัดลอกลิงก์เรียบร้อยแล้ว') } catch { setSavedMessage('ไม่สามารถคัดลอกลิงก์ได้') } }}>
                 <span className="share-icon">🔗</span>
                 <div><strong>ลิงก์</strong><small>คัดลอกลิงก์แชร์</small></div>
               </button>
               <button className="share-option" onClick={async () => { await generatePDF('share-content', 'รายงาน BaanBalance.pdf'); setShowShare(false) }}>
                 <span className="share-icon">💾</span>
                 <div><strong>บันทึกไฟล์</strong><small>ดาวน์โหลดเป็น PDF</small></div>
               </button>
             </div>
             <div className="modal-actions">
               <button className="secondary-button" onClick={() => setShowShare(false)}>ปิด</button>
             </div>
           </section>
         </div>
       )}

       {showDocViewer && selectedDocAsset && (
         <div className="modal-backdrop" onMouseDown={() => setShowDocViewer(false)}>
           <section className="upload-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
             <div className="modal-heading">
               <div>
                 <span className="panel-kicker">เอกสารแนบ</span>
                 <h2>{selectedDocAsset.name}</h2>
                 <p>{selectedDocAsset.docs} ไฟล์ · อัปเดต {selectedDocAsset.updated}</p>
               </div>
               <button className="icon-button" aria-label="ปิด" onClick={() => setShowDocViewer(false)}>
                 <X size={20} />
               </button>
             </div>
             <div className="doc-grid">
               {Array.from({ length: selectedDocAsset.docs }).map((_, i) => (
                 <div className="doc-card" key={i}>
                   <div className="doc-icon">
                     {selectedDocAsset.category === 'อสังหาริมทรัพย์' ? '🏠' : selectedDocAsset.category === 'ยานพาหนะ' ? '🚙' : '📄'}
                   </div>
                   <div>
                     <strong>เอกสาร #{i + 1}</strong>
                     <small>{selectedDocAsset.category} · PDF</small>
                   </div>
                   <button className="secondary-button" onClick={() => setSavedMessage('ดาวน์โหลดเอกสารแล้ว')}>ดาวน์โหลด</button>
                 </div>
               ))}
             </div>
             <div className="modal-actions">
               <button className="secondary-button" onClick={() => setShowDocViewer(false)}>ปิด</button>
             </div>
           </section>
         </div>
       )}
     </div>
   )
 }

export default App
