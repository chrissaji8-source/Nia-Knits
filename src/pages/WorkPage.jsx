import ShowcaseSection from '../components/Showcase/ShowcaseSection'
import defaultWorks from '../data/works.json'

export default function WorkPage({
  works = defaultWorks,
  likes = {},
  likedPieces = [],
  onToggleLike,
  highestLikes = 1,
  likesAvailable = true,
  updatingLikeIds = [],
  userLikeCount,
  onInquire,
}) {
  return (
    <div className="page-work pb-24">
      <ShowcaseSection
        works={works}
        likes={likes}
        likedPieces={likedPieces}
        onToggleLike={onToggleLike}
        highestLikes={highestLikes}
        likesAvailable={likesAvailable}
        updatingLikeIds={updatingLikeIds}
        userLikeCount={userLikeCount}
        onInquire={onInquire}
      />
    </div>
  )
}
