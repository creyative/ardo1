import { NextRequest, NextResponse } from 'next/server'
import { generateWawasanTemplate, generatePsikotestTemplate } from '@/lib/excel-parser'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'wawasan'

  const buffer = type === 'wawasan' ? generateWawasanTemplate() : generatePsikotestTemplate()
  const filename = type === 'wawasan' ? 'template-wawasan.xlsx' : 'template-psikotest.xlsx'

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
