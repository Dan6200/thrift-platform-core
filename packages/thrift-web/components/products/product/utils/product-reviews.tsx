'use client'
import { Product } from '@/types/products'
import { Ratings } from '../../utils/rating'
import { Button } from '@/components/ui/button'

interface ProductReviewsProps {
  product_id: Product['product_id']
  average_rating: Product['average_rating']
  review_count: Product['review_count']
}

export function ProductReviews({
  product_id,
  average_rating,
  review_count,
}: ProductReviewsProps) {
  return (
    <div className="mt-8 pt-8">
      <h3 className="w-full mx-auto text-xl lg:text-2xl mb-6 font-bold text-center">
        Customer Reviews
      </h3>
      <div className="flex items-center justify-center mb-4">
        <Ratings average_rating={average_rating} review_count={review_count} />
        <span className="ml-2 text-lg font-semibold">
          {average_rating ? average_rating.toFixed(1) : 'N/A'}
        </span>
      </div>
      <p className="text-center text-sm text-muted-foreground mb-6">
        Based on {review_count} reviews
      </p>

      {/* Placeholder for actual reviews list */}
      <div className="space-y-4">
        {/* Example review item */}
        <div className="border p-4 rounded-md glass-effect">
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold">John Doe</p>
            <Ratings average_rating={4.5} review_count={1} />{' '}
            {/* Example rating */}
          </div>
          <p className="text-sm text-muted-foreground">
            &quot;Great product, highly recommend!&quot;
          </p>
        </div>
        {/* Add more review items here */}
      </div>

      <div className="mt-6 text-center">
        <Button variant="outline" className="glass-effect">
          Write a Review
        </Button>
      </div>
    </div>
  )
}
