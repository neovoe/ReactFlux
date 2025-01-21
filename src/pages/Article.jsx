import { AnimatePresence } from "framer-motion"
import { IconEmpty, IconLeft, IconRight } from "@arco-design/web-react/icon"
import { Typography } from "@arco-design/web-react"
import ActionButtons from "@/components/Article/ActionButtons.jsx"
import ArticleDetail from "@/components/Article/ArticleDetail.jsx"
import FadeTransition from "@/components/ui/FadeTransition.jsx"
import useScreenWidth from "@/hooks/useScreenWidth"
import useContentContext from "@/hooks/useContentContext"
import { useStore } from "@nanostores/react"

import { contentState } from "@/store/contentState"
import { useState } from "react"
import { useSwipeable } from "react-swipeable"

const Article = () => {
  const { activeContent, isArticleLoading } = useStore(contentState)
  const { entryDetailRef } = useContentContext()
  const [isSwipingLeft] = useState(false)
  const [isSwipingRight] = useState(false)
  const { isBelowMedium } = useScreenWidth()

  const handlers = useSwipeable({})

  return activeContent ? (
    <div className="article-container content-wrapper" {...handlers}>
      {!isBelowMedium && <ActionButtons />}
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