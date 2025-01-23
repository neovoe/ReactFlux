import { Divider, Typography } from "@arco-design/web-react"
import { IconEmpty, IconLeft, IconRight } from "@arco-design/web-react/icon"
import { useStore } from "@nanostores/react"
import { AnimatePresence } from "framer-motion"
import { useCallback, useState } from "react"
import { useSwipeable } from "react-swipeable"

import ActionButtons from "@/components/Article/ActionButtons"
import ArticleDetail from "@/components/Article/ArticleDetail"
import FadeTransition from "@/components/ui/FadeTransition"
import useContentContext from "@/hooks/useContentContext"
import useKeyHandlers from "@/hooks/useKeyHandlers"
import useScreenWidth from "@/hooks/useScreenWidth"
import { contentState } from "@/store/contentState"

const Article = () => {
  const { activeContent, isArticleLoading } = useStore(contentState)
  const { entryDetailRef } = useContentContext()
  const [isSwipingLeft, setIsSwipingLeft] = useState(false)
  const [isSwipingRight, setIsSwipingRight] = useState(false)
  const { isBelowMedium } = useScreenWidth()

  const { navigateToNextArticle, navigateToPreviousArticle } = useKeyHandlers()

  const handleSwiping = (eventData) => {
    setIsSwipingLeft(eventData.dir === "Left")
    setIsSwipingRight(eventData.dir === "Right")
  }

  const handleSwiped = () => {
    setIsSwipingLeft(false)
    setIsSwipingRight(false)
  }

  const handleSwipeLeft = useCallback(() => navigateToNextArticle(), [navigateToNextArticle])

  const handleSwipeRight = useCallback(
    () => navigateToPreviousArticle(),
    [navigateToPreviousArticle],
  )

  const handlers = useSwipeable({
    onSwiping: handleSwiping,
    onSwiped: handleSwiped,
    onSwipedLeft: handleSwipeLeft,
    onSwipedRight: handleSwipeRight,
  })

  return activeContent ? (
    <div className="article-container content-wrapper">
      {!isBelowMedium && <ActionButtons />}
      {!isBelowMedium && <Divider style={{ margin: "0" }} />}
      {isArticleLoading ? (
        <div style={{ flex: 1 }} />
      ) : (
        <>
          <AnimatePresence>
            {isSwipingRight && (
              <FadeTransition key="swipe-hint-left" className="swipe-hint left">
                <IconLeft style={{ fontSize: 24 }} />
              </FadeTransition>
            )}
            {isSwipingLeft && (
              <FadeTransition key="swipe-hint-right" className="swipe-hint right">
                <IconRight style={{ fontSize: 24 }} />
              </FadeTransition>
            )}
          </AnimatePresence>
          <ArticleDetail ref={entryDetailRef} />
        </>
      )}
      {isBelowMedium && <ActionButtons />}
    </div>
  ) : (
    <div className="content-empty content-wrapper">
      <IconEmpty style={{ fontSize: "64px" }} />
      <Typography.Title heading={6} style={{ color: "var(--color-text-3)", marginTop: "10px" }}>
        ReactFlux
      </Typography.Title>
    </div>
  )
}

export default Article
