import { Button } from "@arco-design/web-react"
import {
  IconLaunch,
  IconMinusCircle,
  IconRecord,
  IconSave,
  IconShareExternal,
  IconStar,
  IconStarFill,
} from "@arco-design/web-react/icon"
import { useStore } from "@nanostores/react"
import { memo } from "react"

import CustomTooltip from "@/components/ui/CustomTooltip"
import useEntryActions from "@/hooks/useEntryActions"
import { polyglotState } from "@/hooks/useLanguage"
import { dataState } from "@/store/dataState"
import "./ArticleButtons.css"

const MobileButtons = memo(({ commonButtons }) => (
  <div className="mobile-buttons">
    {commonButtons.status}
    {commonButtons.star}
    {commonButtons.saveTo}
    {commonButtons.share}
    {commonButtons.openLink}
  </div>
))
MobileButtons.displayName = "MobileButtons"

const ArticleButtons = ({ entry }) => {
  const { hasIntegrations } = useStore(dataState)
  const { polyglot } = useStore(polyglotState)

  const { handleSaveToThirdPartyServices, handleToggleStarred, handleToggleStatus } =
    useEntryActions()

  const isUnread = entry.status === "unread"
  const isStarred = entry.starred

  const handleShare = async () => {
    if (!navigator.share) {
      console.error("Web Share API is not supported")
      return
    }

    const shareData = {
      title: entry.title,
      url: entry.url,
    }

    if (navigator.canShare && !navigator.canShare(shareData)) {
      console.error("This content cannot be shared")
      return
    }

    try {
      await navigator.share(shareData)
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error sharing article:", error)
      }
    }
  }

  const commonButtons = {
    status: (
      <Button
        icon={isUnread ? <IconMinusCircle /> : <IconRecord />}
        shape="square"
        onClick={() => handleToggleStatus(entry)}
      />
    ),
    star: (
      <Button
        icon={isStarred ? <IconStarFill style={{ color: "#ffcd00" }} /> : <IconStar />}
        shape="square"
        onClick={() => handleToggleStarred(entry)}
      />
    ),
    saveTo: (
      <Button
        disabled={!hasIntegrations}
        icon={<IconSave />}
        shape="square"
        onClick={handleSaveToThirdPartyServices}
      />
    ),
    share: <Button icon={<IconShareExternal />} shape="square" onClick={handleShare} />,
    openLink: (
      <Button
        icon={<IconLaunch />}
        shape="square"
        onClick={() => window.open(entry.url, "_blank")}
      />
    ),
  }

  return (
    <div className={`article-buttons`}>
      <MobileButtons commonButtons={commonButtons} />
    </div>
  )
}

export default ArticleButtons
