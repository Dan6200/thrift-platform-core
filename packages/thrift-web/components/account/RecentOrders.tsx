// components/account/RecentOrders.tsx
'use client'

import { useState, useEffect } from 'react'
import { Order } from '@/types/orders'
import { getAllOrders } from '@/lib/api/orders'
import { OrderCard } from '@/components/account/OrderCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        setIsLoading(true)
        // We fetch all orders and then slice the most recent ones
        const allOrders = await getAllOrders()
        setOrders(allOrders.slice(0, 3)) // Get the 3 most recent orders
      } catch (err) {
        console.error('Failed to fetch recent orders:', err)
        setError('Failed to load recent orders.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentOrders()
  }, [])

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Recent Orders</h2>
        <Link href="/account/orders" passHref>
          <Button variant="outline">View All Orders</Button>
        </Link>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {error && <p className="text-destructive-foreground">{error}</p>}

      {!isLoading && !error && orders.length === 0 && (
        <p className="text-muted-foreground">You have no recent orders.</p>
      )}

      {!isLoading && !error && orders.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <OrderCard key={order.order_id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
