import { Button, Notification, Typography } from "@arco-design/web-react"
import { IconEmpty } from "@arco-design/web-react/icon"
import { useStore } from "@nanostores/react"
import { useEffect, useRef } from "react"
import { useLocation } from "react-router"

import FooterPanel from "./FooterPanel"

import ActionButtons from "@/components/Article/ActionButtons"
import ArticleDetail from "@/components/Article/ArticleDetail"
import ArticleList from "@/components/Article/ArticleList"
import SearchAndSortBar from "@/components/Article/SearchAndSortBar"
import useAppData from "@/hooks/useAppData"
import useArticleList from "@/hooks/useArticleList"
import useContentContext from "@/hooks/useContentContext"
import useContentHotkeys from "@/hooks/useContentHotkeys"
import useDocumentTitle from "@/hooks/useDocumentTitle"
import useKeyHandlers from "@/hooks/useKeyHandlers"
import { polyglotState } from "@/hooks/useLanguage"
import useScreenWidth from "@/hooks/useScreenWidth"
import { contentState, setActiveContent, setInfoFrom, setInfoId } from "@/store/contentState"
import { dataState } from "@/store/dataState"
import { duplicateHotkeysState } from "@/store/hotkeysState"
import { settingsState } from "@/store/settingsState"

import "./Content.css"

const Content = ({ info, getEntries, markAllAsRead }) => {
  const { activeContent, filterDate, isArticleLoading } = useStore(contentState)
  const { isAppDataReady } = useStore(dataState)
  const { orderBy, orderDirection, showStatus } = useStore(settingsState)
  const { polyglot } = useStore(polyglotState)
  const duplicateHotkeys = useStore(duplicateHotkeysState)

  const cardsRef = useRef(null)

  const location = useLocation()

  useDocumentTitle()

  const { entryDetailRef, entryListRef, handleEntryClick } = useContentContext()

  const { showHotkeysSettings } = useKeyHandlers()

  const { fetchAppData, fetchFeedRelatedData } = useAppData()
  const { fetchArticleList } = useArticleList(info, getEntries)
  const { isBelowMedium } = useScreenWidth()

  const fetchArticleListOnly = async () => {
    if (!isAppDataReady) {
      await fetchAppData()
    } else {
      await fetchArticleList(getEntries)
    }
  }

  const fetchArticleListWithRelatedData = async () => {
    if (!isAppDataReady) {
      await fetchAppData()
    } else {
      await Promise.all([fetchArticleList(getEntries), fetchFeedRelatedData()])
    }
  }

  useContentHotkeys({ handleRefreshArticleList: fetchArticleListWithRelatedData })

  useEffect(() => {
    if (duplicateHotkeys.length > 0) {
      const id = "duplicate-hotkeys"
      Notification.error({
        id,
        title: polyglot.t("settings.duplicate_hotkeys"),
        duration: 0,
        btn: (
          <span>
            <Button
              size="small"
              style={{ marginRight: 8 }}
              type="secondary"
              onClick={() => Notification.remove(id)}
            >
              {polyglot.t("actions.dismiss")}
            </Button>
            <Button
              size="small"
              type="primary"
              onClick={() => {
                showHotkeysSettings()
                Notification.remove(id)
              }}
            >
              {polyglot.t("actions.check")}
            </Button>
          </span>
        ),
      })
    }
  }, [duplicateHotkeys, polyglot, showHotkeysSettings])

  useEffect(() => {
    setInfoFrom(info.from)
    setInfoId(info.id)
    if (activeContent) {
      setActiveContent(null)
    }
    if (info.from === "category") {
      fetchArticleListWithRelatedData()
    } else {
      fetchArticleListOnly()
    }
  }, [info])

  useEffect(() => {
    if (["starred", "history"].includes(info.from)) {
      return
    }
    fetchArticleListOnly()
  }, [orderBy])

  useEffect(() => {
    fetchArticleListOnly()
  }, [filterDate, orderDirection, showStatus])

  useEffect(() => {
    if (isBelowMedium && activeContent) {
      setActiveContent(null)
    }
  }, [location.pathname])

  return (
    <>
      <div
        className="entry-col"
        style={{
          opacity: isBelowMedium && isArticleLoading ? 0 : 1,
        }}
      >
        <SearchAndSortBar info={info} />
        <ArticleList
          ref={entryListRef}
          cardsRef={cardsRef}
          getEntries={getEntries}
          handleEntryClick={handleEntryClick}
        />
        <FooterPanel
          info={info}
          markAllAsRead={markAllAsRead}
          refreshArticleList={fetchArticleListWithRelatedData}
        />
      </div>
      {activeContent ? (
        <div className="article-container content-wrapper">
          {!isBelowMedium && <ActionButtons />}
          {isArticleLoading ? (
            <div style={{ flex: 1 }} />
          ) : (
            <>
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
      )}
    </>
  )
}

export default Content
