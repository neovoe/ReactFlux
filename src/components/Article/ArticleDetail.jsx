import { Divider, Tag, Typography } from "@arco-design/web-react"
import { useStore } from "@nanostores/react"
import ReactHtmlParser, { domToReact } from "html-react-parser"
import { littlefoot } from "littlefoot"
import { forwardRef, useEffect, useRef } from "react"
import { useNavigate } from "react-router"
import Lightbox from "yet-another-react-lightbox"
import Captions from "yet-another-react-lightbox/plugins/captions"
import Counter from "yet-another-react-lightbox/plugins/counter"
import Download from "yet-another-react-lightbox/plugins/download"
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen"
import Share from "yet-another-react-lightbox/plugins/share"
import Slideshow from "yet-another-react-lightbox/plugins/slideshow"
import Zoom from "yet-another-react-lightbox/plugins/zoom"
import "yet-another-react-lightbox/styles.css"
import "yet-another-react-lightbox/plugins/captions.css"
import "yet-another-react-lightbox/plugins/counter.css"
import "yet-another-react-lightbox/plugins/thumbnails.css"

import CodeBlock from "./CodeBlock"
import ImageLinkTag from "./ImageLinkTag"
import ImageOverlayButton from "./ImageOverlayButton"

import CustomLink from "@/components/ui/CustomLink"
import FadeTransition from "@/components/ui/FadeTransition"
import PlyrPlayer from "@/components/ui/PlyrPlayer"
import usePhotoSlider from "@/hooks/usePhotoSlider"
import useScreenWidth from "@/hooks/useScreenWidth"
import {
  contentState,
  setActiveContent,
  setFilterString,
  setFilterType,
} from "@/store/contentState"
import { settingsState } from "@/store/settingsState"
import { generateReadableDate } from "@/utils/date"
import { extractImageSources } from "@/utils/images"
import "./ArticleDetail.css"
import "./littlefoot.css"

const handleLinkWithImage = (node, imageSources, togglePhotoSlider) => {
  const imgNodes = node.children.filter((child) => child.type === "tag" && child.name === "img")

  if (imgNodes.length > 0) {
    // If there are multiple images, render them with link display
    if (imgNodes.length > 1) {
      return (
        <div className="image-wrapper">
          <div className="image-container">
            {imgNodes.map((imgNode, index) => (
              <div key={`link-img-${index}`}>
                {handleImage(imgNode, imageSources, togglePhotoSlider)}
              </div>
            ))}
            <ImageLinkTag href={node.attribs.href} />
          </div>
        </div>
      )
    }

    // Single image case
    const index = imageSources.findIndex((item) => item.src === imgNodes[0].attribs.src)

    return (
      <ImageOverlayButton
        index={index}
        isLinkWrapper={true}
        node={node}
        togglePhotoSlider={togglePhotoSlider}
      />
    )
  }
  return node
}

const handleBskyVideo = (node) => {
  const isBskyVideo = /video\.bsky\.app.*thumbnail\.jpg$/.test(node.attribs.src)
  if (isBskyVideo) {
    const thumbnailUrl = node.attribs.src
    const playlistUrl = thumbnailUrl.replace("thumbnail.jpg", "playlist.m3u8")

    return <PlyrPlayer poster={thumbnailUrl} src={playlistUrl} />
  }
  return null
}

const handleImage = (node, imageSources, togglePhotoSlider) => {
  const bskyVideoPlayer = handleBskyVideo(node)
  if (bskyVideoPlayer) {
    return bskyVideoPlayer
  }

  const index = imageSources.findIndex((item) => item.src === node.attribs.src)
  return <ImageOverlayButton index={index} node={node} togglePhotoSlider={togglePhotoSlider} />
}

const htmlEntities = {
  "&#39;": "'",
  "&quot;": '"',
  "&lt;": "<",
  "&gt;": ">",
  "&amp;": "&",
}

const decodeAndParseCodeContent = (preElement) => {
  return preElement.children
    .map((child) => {
      if (child.type === "tag" && child.name === "p") {
        return `${child.children[0]?.data ?? ""}\n`
      }
      if (child.type === "tag" && child.name === "strong") {
        return child.children[0]?.data ?? ""
      }
      return child.data ?? (child.name === "br" ? "\n" : "")
    })
    .join("")
    .replaceAll(
      new RegExp(Object.keys(htmlEntities).join("|"), "g"),
      (match) => htmlEntities[match],
    )
}

const handleTableBasedCode = (node) => {
  const tbody = node.children.find((child) => child.name === "tbody")
  if (!tbody) {
    return null
  }

  const tr = tbody.children.find((child) => child.name === "tr")
  if (!tr || tr.children.length !== 2) {
    return null
  }

  const [, codeTd] = tr.children

  const codePre = codeTd.children.find((child) => child.name === "pre")

  if (!codePre) {
    return null
  }

  return decodeAndParseCodeContent(codePre)
}

// Remove empty td elements from table-based layout content
const handleContentTable = (node) => {
  const tbody = node.children.find((child) => child.name === "tbody")
  if (!tbody) {
    return null
  }

  for (const tr of tbody.children) {
    if (tr.name === "tr") {
      tr.children = tr.children.filter(
        (td) =>
          td.name === "td" &&
          td.children?.length > 0 &&
          td.children.some((child) => child.data?.trim() || child.children?.length),
      )
    }
  }

  return node
}

// Helper function to process figcaption content
const processFigcaptionContent = (children) => {
  if (!children) {
    return null
  }

  return children.map((child, index) => {
    if (child.type === "text") {
      return child.data
    }
    if (child.type === "tag") {
      const Tag = child.name
      const props = child.attribs || {}

      if (child.name === "br") {
        return null
      }

      return (
        <Tag key={index} {...props}>
          {child.children ? processFigcaptionContent(child.children) : null}
        </Tag>
      )
    }
    return null
  })
}

const handleFigure = (node, imageSources, togglePhotoSlider, options) => {
  const firstChild = node.children[0]
  const hasImages = node.children.some((child) => child.name === "img")

  // Handle code blocks wrapped in figure
  if (firstChild?.name === "pre") {
    const codeContent = decodeAndParseCodeContent(firstChild)
    return codeContent ? <CodeBlock>{codeContent}</CodeBlock> : null
  }

  // Handle table-based code blocks with line numbers
  if (firstChild?.name === "table") {
    const codeContent = handleTableBasedCode(firstChild)
    return codeContent ? <CodeBlock>{codeContent}</CodeBlock> : null
  }

  // Handle multiple images in figure with figcaption support
  if (hasImages) {
    return (
      <figure>
        {node.children.map((child, index) => {
          if (child.name === "img") {
            return (
              <div key={`figure-img-${index}`}>
                {handleImage(child, imageSources, togglePhotoSlider)}
              </div>
            )
          }
          if (child.name === "figcaption") {
            return (
              <figcaption key={`figure-caption-${index}`}>
                {processFigcaptionContent(child.children)}
              </figcaption>
            )
          }
          return domToReact([child], options)
        })}
      </figure>
    )
  }

  return null
}

const handleCodeBlock = (node) => {
  // Remove line number text for code blocks in VuePress / VitePress
  let currentNode = node.next
  while (currentNode) {
    const nextNode = currentNode.next
    const isLineNumber = currentNode.type === "text" && /^\d+(<br>|\n)*/.test(currentNode.data)
    const isBreak = currentNode.type === "tag" && currentNode.name === "br"

    if (isLineNumber || isBreak) {
      currentNode.data = ""
      currentNode.type = "text"
    }
    currentNode = nextNode
  }

  // Extract code content
  const codeContent =
    node.children[0]?.name === "code"
      ? decodeAndParseCodeContent(node.children[0])
      : decodeAndParseCodeContent(node)

  return <CodeBlock>{codeContent}</CodeBlock>
}

const handleVideo = (node) => {
  const sourceNode = node.children?.find((child) => child.name === "source" && child.attribs?.src)

  const videoSrc = sourceNode?.attribs.src || node.attribs.src

  if (!videoSrc) {
    return node
  }

  return (
    <PlyrPlayer poster={node.attribs.poster} sourceType={sourceNode?.attribs.type} src={videoSrc} />
  )
}

const handleIframe = (node) => {
  const src = node.attribs?.src
  if (!src) {
    return node
  }

  // Check if it's a YouTube iframe
  const isYouTube = /youtube\.com|youtu\.be/i.test(src)

  // Create enhanced attributes
  const enhancedAttribs = {
    ...node.attribs,
    allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
    allowFullScreen: true,
    referrerPolicy: "strict-origin-when-cross-origin",
  }

  // For YouTube, ensure the src includes necessary parameters
  if (isYouTube) {
    const url = new URL(src)
    // Add enablejsapi parameter if not present
    if (!url.searchParams.has('enablejsapi')) {
      url.searchParams.set('enablejsapi', '1')
    }
    enhancedAttribs.src = url.toString()
  }

  return (
    <iframe
      {...enhancedAttribs}
    />
  )
}

const getHtmlParserOptions = (imageSources, togglePhotoSlider) => {
  const options = {
    replace: (node) => {
      if (node.type !== "tag") {
        return node
      }

      switch (node.name) {
        case "a": {
          return node.children.length > 0
            ? handleLinkWithImage(node, imageSources, togglePhotoSlider)
            : node
        }
        case "img": {
          return handleImage(node, imageSources, togglePhotoSlider)
        }
        case "pre": {
          return handleCodeBlock(node)
        }
        case "figure": {
          return handleFigure(node, imageSources, togglePhotoSlider, options)
        }
        case "video": {
          return handleVideo(node)
        }
        case "iframe": {
          return handleIframe(node)
        }
        case "table": {
          return handleContentTable(node)
        }
        default: {
          return node
        }
      }
    },
  }
  return options
}

const ArticleDetail = forwardRef((_, ref) => {
  const navigate = useNavigate()
  const { isBelowMedium } = useScreenWidth()

  const { activeContent } = useStore(contentState)
  const {
    articleWidth,
    edgeToEdgeImages,
    fontFamily,
    fontSize,
    lightboxSlideAnimation,
    titleAlignment,
  } = useStore(settingsState)
  const scrollContainerRef = useRef(null)

  const { isPhotoSliderVisible, setIsPhotoSliderVisible, selectedIndex, setSelectedIndex } =
    usePhotoSlider()

  const handleAuthorFilter = () => {
    setFilterType("author")
    setFilterString(activeContent.author)
    if (isBelowMedium) {
      setActiveContent(null)
    }
  }

  const togglePhotoSlider = (index) => {
    setSelectedIndex(index)
    setIsPhotoSliderVisible((prev) => !prev)
  }

  const getLightboxAnimationConfig = () => {
    return lightboxSlideAnimation ? { fade: 250 } : { fade: 250, navigation: 0 }
  }

  const imageSources = extractImageSources(activeContent.content)
  const htmlParserOptions = getHtmlParserOptions(imageSources, togglePhotoSlider)

  const parsedHtml = ReactHtmlParser(activeContent.content, htmlParserOptions)
  const { id: categoryId, title: categoryTitle } = activeContent.feed.category
  const { id: feedId, title: feedTitle } = activeContent.feed

  const { coverSource, mediaPlayerEnclosure, isMedia } = activeContent

  const getResponsiveMaxWidth = () => {
    if (isBelowMedium) {
      return "90%"
    }
    return `${articleWidth}ch`
  }

  // pretty footnotes
  useEffect(() => {
    littlefoot()
  }, [])

  // Focus the scrollable area when activeContent changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      const scrollElement = scrollContainerRef.current.getScrollElement()
      scrollElement?.focus()
    }
  }, [activeContent.id])

  return (
    <div className="article-scroll-container">
      <article
        ref={ref}
        className={`article-content ${edgeToEdgeImages ? "edge-to-edge" : ""}`}
        tabIndex={-1}
      >
        <FadeTransition y={20}>
          <div
            className="article-header"
            style={{ maxWidth: getResponsiveMaxWidth(), textAlign: titleAlignment }}
          >
            <Typography.Title
              className="article-title"
              heading={3}
              style={{ fontFamily: fontFamily }}
            >
              <a href={activeContent.url} rel="noopener noreferrer" target="_blank">
                {activeContent.title}
              </a>
            </Typography.Title>
            <div className="article-meta">
              <Typography.Text>
                <CustomLink text={feedTitle} url={`/feed/${feedId}`} />
              </Typography.Text>
              {activeContent.author && (
                <Typography.Text style={{ cursor: "pointer" }} onClick={handleAuthorFilter}>
                  {` - ${activeContent.author}`}
                </Typography.Text>
              )}
              <Typography.Text>
                <Tag
                  size="small"
                  style={{ marginLeft: "10px", cursor: "pointer" }}
                  onClick={() => navigate(`/category/${categoryId}`)}
                >
                  {categoryTitle}
                </Tag>
              </Typography.Text>
            </div>
            <Typography.Text className="article-date">
              {generateReadableDate(activeContent.published_at)}
            </Typography.Text>
            <Divider />
          </div>
          <div
            key={activeContent.id}
            className="article-body"
            style={{
              fontSize: `${fontSize}rem`,
              maxWidth: getResponsiveMaxWidth(),
              fontFamily: fontFamily,
              "--article-width": articleWidth,
            }}
          >
            {isMedia && mediaPlayerEnclosure && (
              <PlyrPlayer
                enclosure={mediaPlayerEnclosure}
                poster={coverSource}
                src={mediaPlayerEnclosure.url}
                style={{
                  maxWidth: mediaPlayerEnclosure.mime_type.startsWith("video/") ? "100%" : "400px",
                }}
              />
            )}
            {parsedHtml}
            <Lightbox
              animation={getLightboxAnimationConfig()}
              carousel={{ finite: true, padding: 0 }}
              close={() => setIsPhotoSliderVisible(false)}
              controller={{ closeOnPullDown: true, closeOnBackdropClick: true }}
              index={selectedIndex}
              open={isPhotoSliderVisible}
              slides={imageSources}
              captions={{
                showToggle: true,
                descriptionTextAlign: "center",
                descriptionMaxLines: 5,
              }}
              on={{
                view: ({ index }) => setSelectedIndex(index),
              }}
              plugins={
                isBelowMedium
                  ? [Captions, Zoom, Fullscreen, Slideshow, Download, Share, Counter]
                  : [Captions, Zoom, Slideshow, Download, Share, Counter]
              }
              render={
                isBelowMedium
                  ? {
                      // 隐藏 Zoom In / Zoom Out 按钮
                      buttonZoom: () => null,
                      // 若仅隐藏图标，也可以逐一返回 null
                      iconZoomIn: () => null,
                      iconZoomOut: () => null,
                    }
                  : {}
              }
            />
          </div>
        </FadeTransition>
      </article>
    </div>
  )
})
ArticleDetail.displayName = "ArticleDetail"

export default ArticleDetail
