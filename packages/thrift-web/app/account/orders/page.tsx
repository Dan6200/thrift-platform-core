// app/account/orders/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Order } from '@/types/orders'
import { getAllOrders } from '@/lib/api/orders'
import { OrderCard } from '@/components/account/OrderCard'
import { Skeleton } from '@/components/ui/skeleton'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        const data = await getAllOrders()
        setOrders(data)
      } catch (err) {
        console.error('Failed to fetch orders:', err)
        setError('Failed to load your orders. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [])

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 border-b pb-4">My Orders</h1>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {error && (
        <div className="text-center py-10">
          <p className="text-destructive-foreground bg-destructive p-4 rounded-md">
            {error}
          </p>
        </div>
      )}

      {!isLoading && !error && orders.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            You have not placed any orders yet.
          </p>
        </div>
      )}

      {!isLoading && !error && orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <OrderCard key={order.order_id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
