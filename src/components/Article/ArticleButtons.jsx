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
      <CustomTooltip
        mini
        content={
          isUnread
            ? polyglot.t("article_card.mark_as_read_tooltip")
            : polyglot.t("article_card.mark_as_unread_tooltip")
        }
      >
        <Button
          icon={isUnread ? <IconMinusCircle /> : <IconRecord />}
          shape="circle"
          onClick={() => handleToggleStatus(entry)}
        />
      </CustomTooltip>
    ),
    star: (
      <CustomTooltip
        mini
        content={
          isStarred
            ? polyglot.t("article_card.unstar_tooltip")
            : polyglot.t("article_card.star_tooltip")
        }
      >
        <Button
          icon={isStarred ? <IconStarFill style={{ color: "#ffcd00" }} /> : <IconStar />}
          shape="circle"
          onClick={() => handleToggleStarred(entry)}
        />
      </CustomTooltip>
    ),
    saveTo: (
      <CustomTooltip mini content={polyglot.t("article_card.save_to_third_party_services_tooltip")}>
        <Button
          disabled={!hasIntegrations}
          icon={<IconSave />}
          shape="circle"
          onClick={handleSaveToThirdPartyServices}
        />
      </CustomTooltip>
    ),
    share: (
      <CustomTooltip mini content={polyglot.t("article_card.next_tooltip")}>
        <Button icon={<IconShareExternal />} shape="circle" onClick={handleShare} />
      </CustomTooltip>
    ),
    openLink: (
      <CustomTooltip mini content={polyglot.t("article_card.open_link_tooltip")}>
        <Button
          icon={<IconLaunch />}
          shape="circle"
          onClick={() => window.open(entry.url, "_blank")}
        />
      </CustomTooltip>
    ),
  }

  return (
    <div className={`action-buttons`}>
      <MobileButtons commonButtons={commonButtons} />
    </div>
  )
}

export default ArticleButtons
