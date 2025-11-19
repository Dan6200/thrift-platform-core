import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ProductPerformance as ProductPerformanceType } from '@/types/analytics'

interface ProductPerformanceProps {
  products: ProductPerformanceType[]
  isLoading?: boolean
}

export function ProductPerformance({
  products,
  isLoading,
}: ProductPerformanceProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getConversionRate = (conversions: number, views: number | null) => {
    if (views === null || views === 0) return 'N/A'
    return ((conversions / views) * 100).toFixed(1) + '%'
  }

  const topPerformingProducts = [...products].sort(
    (a, b) => b.purchases - a.purchases,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Performance</CardTitle>
        <CardDescription>
          Products ranked by purchases and views
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Purchases</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Conversion Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topPerformingProducts.map((product) => (
              <TableRow key={product.productId}>
                <TableCell className="font-medium">
                  {product.productTitle}
                </TableCell>
                <TableCell>{product.purchases}</TableCell>
                <TableCell>{product.views ?? 'N/A'}</TableCell>
                <TableCell>
                  {getConversionRate(product.purchases, product.views)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
