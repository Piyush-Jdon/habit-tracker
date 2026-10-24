import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function GET(request: NextRequest) {
  // 1. Verify Authorization Header against CRON_SECRET
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized invocation' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()

    // Determine target date (evaluates yesterday's habits if run just after midnight)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const targetDate = yesterday.toISOString().split('T')[0]

    // 2. Trigger the batch evaluation procedure
    const { data, error } = await supabase.rpc('cron_evaluate_all_users', {
      p_target_date: targetDate,
    })

    if (error) {
      console.error('Cron RPC error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      target_date: targetDate,
      summary: data,
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error('Unhandled Cron Exception:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}