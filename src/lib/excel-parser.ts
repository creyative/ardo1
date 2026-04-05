import * as XLSX from 'xlsx'

export interface WawasanQuestion {
  no: number
  pertanyaan: string
  pilihanA: string
  pilihanB: string
  pilihanC: string
  pilihanD: string
  pilihanE?: string
  jawabanBenar: string
  penjelasan?: string
  timer: number
}

export interface PsikotestQuestion {
  no: number
  pertanyaan: string
  pilihanA: string
  pilihanB: string
  pilihanC: string
  pilihanD: string
  pilihanE?: string
  pointA: number
  pointB: number
  pointC: number
  pointD: number
  pointE?: number
  timer: number
}

const optionKeys = ['A', 'B', 'C', 'D', 'E'] as const

function buildOptions(choices: Array<string | undefined>): Record<string, string> {
  return choices.reduce((options, choice, index) => {
    const key = optionKeys[index]
    const text = String(choice || '').trim()
    if (text) options[key] = text
    return options
  }, {} as Record<string, string>)
}

function buildPointMap(points: Array<number | undefined>): Record<string, number> {
  return points.reduce((map, point, index) => {
    const key = optionKeys[index]
    if (point !== undefined && !Number.isNaN(point)) map[key] = Number(point)
    return map
  }, {} as Record<string, number>)
}

export function parseWawasanExcel(buffer: Buffer): WawasanQuestion[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]

  const questions: WawasanQuestion[] = []
  for (let i = 1; i < data.length; i++) {
    const row = data[i]
    if (!row[0] || !row[1]) continue

    questions.push({
      no: Number(row[0]),
      pertanyaan: String(row[1] || ''),
      pilihanA: String(row[2] || ''),
      pilihanB: String(row[3] || ''),
      pilihanC: String(row[4] || ''),
      pilihanD: String(row[5] || ''),
      pilihanE: String(row[6] || '').trim() || undefined,
      jawabanBenar: String(row[7] || '').toUpperCase(),
      penjelasan: String(row[8] || '').trim() || undefined,
      timer: Number(row[9] || 60),
    })
  }
  return questions
}

export function parsePsikotestExcel(buffer: Buffer): PsikotestQuestion[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]

  const questions: PsikotestQuestion[] = []
  for (let i = 1; i < data.length; i++) {
    const row = data[i]
    if (!row[0] || !row[1]) continue

    questions.push({
      no: Number(row[0]),
      pertanyaan: String(row[1] || ''),
      pilihanA: String(row[2] || ''),
      pilihanB: String(row[3] || ''),
      pilihanC: String(row[4] || ''),
      pilihanD: String(row[5] || ''),
      pilihanE: String(row[6] || '').trim() || undefined,
      pointA: Number(row[7] || 0),
      pointB: Number(row[8] || 0),
      pointC: Number(row[9] || 0),
      pointD: Number(row[10] || 0),
      pointE: row[11] !== undefined ? Number(row[11]) : undefined,
      timer: Number(row[12] || 60),
    })
  }
  return questions
}

export function generateWawasanTemplate(): Buffer {
  const wb = XLSX.utils.book_new()
  const headers = ['No', 'Pertanyaan', 'Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D', 'Pilihan E (opsional)', 'Jawaban Benar', 'Penjelasan (opsional)', 'Timer (detik)']
  const example = [1, 'Contoh pertanyaan wawasan?', 'Jawaban A', 'Jawaban B', 'Jawaban C', 'Jawaban D', 'Jawaban E', 'A', 'Penjelasan jawaban yang benar', 60]
  const ws = XLSX.utils.aoa_to_sheet([headers, example])
  XLSX.utils.book_append_sheet(wb, ws, 'Soal Wawasan')
  return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }))
}

export function generatePsikotestTemplate(): Buffer {
  const wb = XLSX.utils.book_new()
  const headers = ['No', 'Pertanyaan', 'Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D', 'Pilihan E (opsional)', 'Point A', 'Point B', 'Point C', 'Point D', 'Point E (opsional)', 'Timer (detik)']
  const example = [1, 'Contoh pertanyaan psikotest?', 'Jawaban A', 'Jawaban B', 'Jawaban C', 'Jawaban D', 'Jawaban E', 4, 3, 2, 1, 0, 60]
  const ws = XLSX.utils.aoa_to_sheet([headers, example])
  XLSX.utils.book_append_sheet(wb, ws, 'Soal Psikotest')
  return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }))
}
