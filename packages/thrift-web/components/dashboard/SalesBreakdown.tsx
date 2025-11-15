import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  PieLabelRenderProps,
} from 'recharts'
import { SalesData, SalesByCategory } from '@/types/analytics'

interface SalesBreakdownProps {
  data: SalesData
  isLoading?: boolean
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--hero-primary))',
  'hsl(var(--hero-secondary))',
  'hsl(var(--accent))',
]

export function SalesBreakdown({ data, isLoading }: SalesBreakdownProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Category Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Channel Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Sales by Category</CardTitle>
          <CardDescription>
            Revenue breakdown by product category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.byCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ payload, percent }: PieLabelRenderProps) => {
                    const category = payload as SalesByCategory
                    const categoryName = category?.categoryName
                    if (typeof percent !== 'number') {
                      if (typeof percent === 'string') {
                        percent = Number(percent)
                      } else return null
                    }
                    const percentage = ((percent as number) * 100).toFixed(0)
                    return `${categoryName} ${percentage}%`
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="totalRevenue"
                >
                  {data.byCategory.map((entry, index) => (
                    <Cell
                      key={entry.categoryId}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/*<Card>
        <CardHeader>
          <CardTitle>Sales Channel Performance</CardTitle>
          <CardDescription>Revenue by sales channel</CardDescription>
        </CardHeader>
				<CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byChannel}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="channelName"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={formatCurrency}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Bar
                  dataKey="totalRevenue"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>*/}
    </div>
  )
}
