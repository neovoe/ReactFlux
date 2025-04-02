import { Message } from "@arco-design/web-react"
import { useStore } from "@nanostores/react"
import { createContext, useCallback, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router"

import { updateEntriesStatus } from "@/apis"
import useEntryActions from "@/hooks/useEntryActions"
import { polyglotState } from "@/hooks/useLanguage"
import { setActiveContent, setIsArticleLoading } from "@/store/contentState"
import { settingsState } from "@/store/settingsState"
import { ANIMATION_DURATION_MS } from "@/utils/constants"

const Context = createContext()

export const ContextProvider = ({ children }) => {
  const polyglot = useStore(polyglotState)
  const { markReadBy } = useStore(settingsState)
  const [isClickEntry, setIsClickEntry] = useState(false)

  const entryDetailRef = useRef(null)
  const entryListRef = useRef(null)
  const navigate = useNavigate()

  const { handleEntryStatusUpdate } = useEntryActions()

  const handleEntryClick = useCallback(
    async (entry) => {
      setIsClickEntry(true)

      // 获取当前路径并去掉 article 部分
      const basePath = window.location.pathname.split("/article/")[0]
      navigate(basePath + `/article/${entry.id}`)
    },
    [polyglot, handleEntryStatusUpdate],
  )

  const handleEntryActive = useCallback(
    async (entry) => {
      setIsArticleLoading(true)

      const shouldAutoMarkAsRead = markReadBy === "view"
      const updatedEntry = shouldAutoMarkAsRead ? { ...entry, status: "read" } : { ...entry }

      setActiveContent(updatedEntry)

      if (!isClickEntry) {
        setTimeout(() => {
          if (entryListRef.current) {
            const selectedCard = entryListRef.current.el.querySelector(".card-wrapper.selected")
            if (selectedCard) {
              selectedCard.scrollIntoView({
                behavior: "smooth",
                block: "center",
              })
            }
          }
        }, ANIMATION_DURATION_MS)
      }
      setIsClickEntry(false)

      setTimeout(() => {
        const articleContent = entryDetailRef.current
        if (articleContent) {
          const contentWrapper = articleContent.querySelector(".simplebar-content-wrapper")
          if (contentWrapper) {
            contentWrapper.scroll({ top: 0 })
          }
          articleContent.focus()
        }

        setIsArticleLoading(false)
        if (shouldAutoMarkAsRead && entry.status === "unread") {
          handleEntryStatusUpdate(entry, "read")
          updateEntriesStatus([entry.id], "read").catch(() => {
            Message.error(polyglot.t("content.mark_as_read_error"))
            // setActiveContent({ ...entry, status: "unread" })
            handleEntryStatusUpdate(entry, "unread")
          })
        }
      }, ANIMATION_DURATION_MS)
    },
    [polyglot, handleEntryStatusUpdate, markReadBy],
  )

  const value = useMemo(
    () => ({
      entryDetailRef,
      entryListRef,
      handleEntryClick,
      handleEntryActive,
      setActiveContent,
    }),
    [handleEntryClick, handleEntryActive],
  )

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export const ContentContext = Context
