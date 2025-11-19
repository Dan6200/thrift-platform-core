'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import type { LowStockProducts } from '@/types/analytics'

interface InventoryAlertsProps {
  products: LowStockProducts[]
  isLoading?: boolean
}

export function InventoryAlerts({ products, isLoading }: InventoryAlertsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventory Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Alerts</CardTitle>
        <CardDescription>Products with low stock levels</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.productId}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex-1">
                <h4 className="font-medium">{product.productTitle}</h4>
                <p className="text-sm text-muted-foreground">
                  {product.quantityAvailable} units remaining
                </p>
              </div>
              <div className="w-24">
                <Progress
                  value={(product.quantityAvailable / 100) * 100} // Assuming max stock is 100 for progress bar visualization
                  className="h-2"
                />
              </div>
              <Badge
                variant={
                  product.quantityAvailable < 20 ? 'destructive' : 'secondary'
                }
                className="ml-3"
              >
                {product.quantityAvailable < 20 ? 'Critical' : 'Low'}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
