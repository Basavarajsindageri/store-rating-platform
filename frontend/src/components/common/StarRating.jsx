import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({
  value = 0,
  onChange,
  readOnly = true,
  size = 'md',
  showValue = false,
  ratingCount = null,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const currentVal = hoverRating || Number(value) || 0;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= currentVal;
          const isHalfFilled = !isFilled && star - 0.5 <= currentVal && readOnly;

          return (
            <button
              type="button"
              key={star}
              disabled={readOnly}
              onClick={() => !readOnly && onChange && onChange(star)}
              onMouseEnter={() => !readOnly && setHoverRating(star)}
              onMouseLeave={() => !readOnly && setHoverRating(0)}
              className={`transition-transform duration-100 ${
                readOnly
                  ? 'cursor-default'
                  : 'cursor-pointer hover:scale-125 focus:outline-none p-0.5'
              }`}
              title={readOnly ? `${value} out of 5 stars` : `Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <Star
                className={`${starSizes[size] || starSizes.md} ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400'
                    : isHalfFilled
                    ? 'text-amber-400 fill-amber-200'
                    : 'text-slate-300 fill-slate-100'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="text-sm font-semibold text-slate-800 ml-1">
          {Number(value) > 0 ? Number(value).toFixed(1) : 'No ratings'}
        </span>
      )}

      {ratingCount !== null && (
        <span className="text-xs text-slate-500">
          ({ratingCount} {ratingCount === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
};

export default StarRating;
