import { Button, Notification } from "@arco-design/web-react"
import { useStore } from "@nanostores/react"
import { useEffect, useRef } from "react"
import { Outlet, useParams } from "react-router"

import FooterPanel from "./FooterPanel"

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
import Article from "@/pages/Article"
import { contentState, setActiveContent, setInfoFrom, setInfoId } from "@/store/contentState"
import { dataState } from "@/store/dataState"
import { duplicateHotkeysState } from "@/store/hotkeysState"
import { settingsState } from "@/store/settingsState"

import "./Content.css"

const Content = ({ info, getEntries, markAllAsRead }) => {
  const { articleId } = useParams()
  const { entries, activeContent, filterDate, infoFrom, isArticleLoading } = useStore(contentState)
  const { isAppDataReady } = useStore(dataState)
  const { orderBy, orderDirection, showStatus } = useStore(settingsState)
  const { polyglot } = useStore(polyglotState)
  const duplicateHotkeys = useStore(duplicateHotkeysState)

  const cardsRef = useRef(null)

  useDocumentTitle()

  const { entryListRef, handleEntryClick, handleEntryActive } = useContentContext()

  const { showHotkeysSettings } = useKeyHandlers()

  const { fetchAppData } = useAppData()
  const { fetchArticleList } = useArticleList(info, getEntries)
  const { isBelowMedium } = useScreenWidth()

  const refreshArticleList = async (getEntries) => {
    if (!isAppDataReady) {
      await fetchAppData()
    } else {
      await fetchArticleList(getEntries)
    }
  }

  const handleRefreshArticleList = () => {
    refreshArticleList(getEntries)
  }

  useContentHotkeys({ handleRefreshArticleList })

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
    const contactInfo = info.id ? `${info.from}/${info.id}` : info.from
    if (articleId || contactInfo === infoFrom) {
      return
    }
    setInfoFrom(contactInfo)
    setInfoId(info.id)
    if (activeContent) {
      setActiveContent(null)
      return
    }
    refreshArticleList(getEntries)
  }, [info])

  useEffect(() => {
    if (["starred", "history"].includes(info.from) || articleId) {
      return
    }
    refreshArticleList(getEntries)
  }, [orderBy])

  useEffect(() => {
    refreshArticleList(getEntries)
  }, [filterDate, orderDirection, showStatus])

  useEffect(() => {
    if (articleId && !activeContent) {
      const entry = entries.find((entry) => entry.id === Number.parseInt(articleId))
      if (entry) {
        handleEntryActive(entry)
      }
    }
  }, [entries])

  useEffect(() => {
    if (articleId) {
      const entry = entries.find((entry) => entry.id === Number.parseInt(articleId))
      if (entry && activeContent && activeContent.id !== articleId) {
        handleEntryActive(entry)
      }
    }
    if (!articleId && activeContent) {
      setActiveContent(null)
    }
  }, [articleId])

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
          refreshArticleList={() => refreshArticleList(getEntries)}
        />
      </div>
      <Article>
        <Outlet />
      </Article>
    </>
  )
}

export default Content
