import { useState } from 'react';
import { IcSvgEmptyHeart, IcSvgHeart } from '../icons';

export function FavoriteIcon() {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <button onClick={() => setIsFavorite(!isFavorite)}>
      {isFavorite ? (
        <IcSvgHeart
          width={22}
          height={22}
        />
      ) : (
        <IcSvgEmptyHeart
          width={22}
          height={22}
        />
      )}
    </button>
  );
}
