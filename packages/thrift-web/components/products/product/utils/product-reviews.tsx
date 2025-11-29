'use client'
import React, { useState, useEffect } from 'react'
import { Product } from '@/types/products'
import { Ratings } from '../../utils/rating'
import { Button } from '@/components/ui/button'
import { getProductReviewsByProductId } from '@/lib/api/reviews/products'
import { ReviewCard } from './ReviewCard'
import { WriteReviewModal } from './WriteReviewModal'
import { Skeleton } from '@/components/ui/skeleton' // Import Skeleton

interface ProductReviewsProps {
  product_id: Product['product_id']
  average_rating: Product['average_rating']
  review_count: Product['review_count']
}

interface Review {
  order_item_id: number
  rating: number
  customer_remark: string | null
  created_at: string
  first_name: string
  last_name: string
}

export function ProductReviews({
  product_id,
  average_rating,
  review_count,
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [reviewFetchCount, setReviewFetchCount] = useState(0)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true)
        const data = await getProductReviewsByProductId(product_id)
        setReviews(data)
      } catch (err) {
        console.error('Failed to fetch product reviews:', err)
        setError('Failed to load reviews.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [product_id, reviewFetchCount])

  const refetchReviews = () => {
    setReviewFetchCount((count) => count + 1)
  }

  return (
    <div className="sm:my-8 my-16">
      <h3 className="w-full mx-auto text-xl lg:text-2xl mb-8 sm:mb-16 font-bold">
        Customer Reviews
      </h3>
      <div className="flex items-center w-2/3 justify-start mb-4">
        <Ratings average_rating={average_rating} review_count={review_count} />
        <span className="ml-2 text-sm font-semibold">
          {average_rating ? average_rating.toFixed(1) : 'N/A'}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Based on {review_count} reviews
      </p>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {error && <p className="text-destructive-foreground">{error}</p>}

      {!isLoading && !error && reviews.length === 0 && (
        <p className="text-muted-foreground">
          No reviews yet. Be the first to write one!
        </p>
      )}

      {!isLoading && !error && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.order_item_id} // Assuming order_item_id is unique per review
              reviewerName={`${review.first_name} ${review.last_name[0]}.`}
              rating={review.rating}
              comment={review.customer_remark}
              createdAt={review.created_at}
            />
          ))}
        </div>
      )}

      <div className="mt-6">
        <Button
          variant="outline"
          className="glass-effect"
          onClick={() => setIsModalOpen(true)}
        >
          Write a Review
        </Button>
      </div>

      <WriteReviewModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        productId={product_id}
        onReviewSubmitted={refetchReviews}
      />
    </div>
  )
}
