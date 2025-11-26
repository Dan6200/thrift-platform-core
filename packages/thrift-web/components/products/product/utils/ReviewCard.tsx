import { Ratings } from '@/components/products/utils/rating'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { format } from 'date-fns'

interface ReviewCardProps {
  reviewerName: string
  rating: number
  comment: string | null
  createdAt: string
}

export function ReviewCard({
  reviewerName,
  rating,
  comment,
  createdAt,
}: ReviewCardProps) {
  return (
    <Card className="border p-4 rounded-md shadow-sm bg-card text-card-foreground">
      <CardContent>
        <div className="flex justify-between items-center mb-2">
          <p className="font-semibold text-lg">{reviewerName}</p>
          <Ratings average_rating={rating} review_count={1} />
        </div>
        {comment && (
          <p className="text-sm text-muted-foreground mb-2">
            &quot;{comment}&quot;
          </p>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-gray-500 text-right">
          Reviewed on {format(new Date(createdAt), 'PPP')}
        </p>
      </CardFooter>
    </Card>
  )
}
