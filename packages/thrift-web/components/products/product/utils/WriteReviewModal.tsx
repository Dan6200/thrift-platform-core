'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Ratings } from '../../utils/rating'
import { useAtom } from 'jotai'
import { userAtom } from '@/atoms'
import { createProductReview } from '@/lib/api/reviews/products'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { Spinner } from '@/components/ui/spinner'
import { findReviewableItem } from '@/lib/api/orders' // New API helper

interface WriteReviewModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  productId: number
  onReviewSubmitted: () => void // Callback to trigger review list re-fetch
}

export function WriteReviewModal({
  isOpen,
  onOpenChange,
  productId,
  onReviewSubmitted,
}: WriteReviewModalProps) {
  const [currentUser] = useAtom(userAtom)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reviewableOrderItemId, setReviewableOrderItemId] = useState<
    number | null
  >(null)

  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // When the modal opens, try to find a reviewable order item
    if (isOpen && currentUser) {
      setIsLoading(true)
      setError(null)
      findReviewableItem(productId)
        .then((data) => {
          if (data && data.order_item_id) {
            setReviewableOrderItemId(data.order_item_id)
          } else {
            setError('You can only review products you have purchased.')
          }
        })
        .catch(() => {
          setError('You can only review products you have purchased.')
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else if (isOpen && !currentUser) {
      setError('Please log in to write a review.')
    }
  }, [isOpen, productId, currentUser])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to write a review.',
        variant: 'destructive',
      })
      router.push('/auth/login')
      return
    }

    if (!reviewableOrderItemId) {
      toast({
        title: 'Cannot Submit Review',
        description:
          error || 'You must have a purchased item to leave a review.',
        variant: 'destructive',
      })
      return
    }

    if (rating === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please select a star rating for your review.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      await createProductReview(reviewableOrderItemId, {
        rating,
        customer_remark: comment,
      })
      toast({
        title: 'Review Submitted!',
        description: 'Thank you for your feedback.',
      })
      onOpenChange(false)
      setRating(0)
      setComment('')
      onReviewSubmitted() // Re-fetch reviews
    } catch (err) {
      console.error('Failed to submit review:', err)
      toast({
        title: 'Failed to Submit Review',
        description:
          'There was an error submitting your review. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your thoughts on this product.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <div className="text-center text-destructive-foreground p-4">
            {error}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Your Rating:</span>
              <Ratings
                average_rating={rating}
                onRatingChange={setRating}
                isInteractive={true}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="comment" className="text-sm font-medium">
                Comment (optional)
              </label>
              <Textarea
                id="comment"
                placeholder="Tell us about your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || rating === 0 || !!error}
            >
              {isLoading && <Spinner className="mr-2" />}
              Submit Review
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
