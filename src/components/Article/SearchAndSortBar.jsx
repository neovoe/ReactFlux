import {
  Button,
  DatePicker,
  Input,
  Modal,
  Select,
  Tooltip,
  Typography,
} from "@arco-design/web-react"
import {
  IconCalendar,
  IconQuestionCircle,
  IconSearch,
  IconSortAscending,
  IconSortDescending,
} from "@arco-design/web-react/icon"
import { useStore } from "@nanostores/react"
import { Fragment, memo, useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useParams } from "react-router"

import SidebarTrigger from "./SidebarTrigger.jsx"

import CustomTooltip from "@/components/ui/CustomTooltip"
import { polyglotState } from "@/hooks/useLanguage"
import useScreenWidth from "@/hooks/useScreenWidth"
import {
  contentState,
  dynamicCountState,
  setFilterDate,
  setFilterString,
  setFilterType,
} from "@/store/contentState"
import { categoriesState, feedsState } from "@/store/dataState"
import { settingsState, updateSettings } from "@/store/settingsState"
import { getStartOfToday } from "@/utils/date"
import { extractBasePath } from "@/utils/url"

import "./SearchAndSortBar.css"

const SearchModal = memo(({ initialValue, visible, onCancel, onConfirm }) => {
  const { filterType } = useStore(contentState)
  const { polyglot } = useStore(polyglotState)
  const tooltipLines = polyglot.t("search.tooltip").split("\n")

  const [inputValue, setInputValue] = useState(initialValue)

  useEffect(() => {
    if (visible) {
      setInputValue(initialValue)
    }
  }, [initialValue, visible])

  const handleFilterTypeChange = (value) => {
    setFilterType(value)
  }

  const handleConfirm = () => {
    onConfirm(inputValue)
  }

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleConfirm()
    }
  }

  return (
    <Modal
      className="search-modal"
      title={polyglot.t("search.search")}
      visible={visible}
      footer={
        <>
          <Button onClick={onCancel}>{polyglot.t("search.cancel")}</Button>
          <Button type="primary" onClick={handleConfirm}>
            {polyglot.t("search.confirm")}
          </Button>
        </>
      }
      onCancel={onCancel}
    >
      <div className="search-modal-content">
        <Input.Search
          allowClear
          placeholder={polyglot.t("search.placeholder")}
          value={inputValue}
          addBefore={
            <Select
              style={{ width: "auto" }}
              value={filterType}
              triggerProps={{
                autoAlignPopupWidth: false,
                autoAlignPopupMinWidth: true,
                position: "bl",
              }}
              onChange={handleFilterTypeChange}
            >
              <Select.Option value="title">{polyglot.t("search.type_title")}</Select.Option>
              <Select.Option value="content">{polyglot.t("search.type_content")}</Select.Option>
              <Select.Option value="author">{polyglot.t("search.type_author")}</Select.Option>
            </Select>
          }
          prefix={
            <Tooltip
              mini
              content={
                <div>
                  {tooltipLines.map((line, index) => (
                    <Fragment key={`tooltip-line-${index}`}>
                      {line}
                      {index < tooltipLines.length - 1 && <br />}
                    </Fragment>
                  ))}
                </div>
              }
            >
              <IconQuestionCircle />
            </Tooltip>
          }
          onChange={setInputValue}
          onKeyDown={handleKeyDown}
        />
      </div>
    </Modal>
  )
})
SearchModal.displayName = "SearchModal"

const ActiveButton = ({ active, icon, tooltip, onClick }) => (
  <CustomTooltip mini content={tooltip}>
    <Button
      icon={icon}
      shape="circle"
      size="small"
      style={{
        backgroundColor: active ? "rgb(var(--primary-6))" : "inherit",
      }}
      onClick={onClick}
    />
  </CustomTooltip>
)

const SearchAndSortBar = () => {
  const { filterDate, filterString, infoFrom, isArticleListReady } = useStore(contentState)
  const { orderDirection, showStatus } = useStore(settingsState)
  const { polyglot } = useStore(polyglotState)
  const feeds = useStore(feedsState)
  const categories = useStore(categoriesState)
  const dynamicCount = useStore(dynamicCountState)

  const location = useLocation()
  const { id } = useParams()
  const { isBelowMedium } = useScreenWidth()

  const [calendarVisible, setCalendarVisible] = useState(false)
  const [searchModalVisible, setSearchModalVisible] = useState(false)
  const [modalInputValue, setModalInputValue] = useState("")

  const prevBasePathRef = useRef()

  const { title, count } = useMemo(() => {
    if (id) {
      if (infoFrom === "category") {
        const category = categories.find((c) => c.id === Number(id))
        return { title: category?.title, count: dynamicCount }
      }
      if (infoFrom === "feed") {
        const feed = feeds.find((f) => f.id === Number(id))
        return { title: feed?.title, count: dynamicCount }
      }
    }

    const infoMap = {
      all: { key: "sidebar.all", count: dynamicCount },
      today: { key: "sidebar.today", count: dynamicCount },
      starred: { key: "sidebar.starred", count: dynamicCount },
      history: { key: "sidebar.history", count: dynamicCount },
    }

    const info = infoMap[infoFrom] || { key: "", count: 0 }
    return { title: info.key ? polyglot.t(info.key) : "", count: info.count }
  }, [infoFrom, id, categories, feeds, dynamicCount, polyglot])

  const toggleOrderDirection = () => {
    const newOrderDirection = orderDirection === "desc" ? "asc" : "desc"
    updateSettings({ orderDirection: newOrderDirection })
  }

  const openSearchModal = () => {
    setModalInputValue(filterString)
    setSearchModalVisible(true)
  }

  const closeSearchModal = () => {
    setSearchModalVisible(false)
  }

  const handleConfirmSearch = (value) => {
    setFilterString(value)
    closeSearchModal()
  }

  const handleSetToday = () => {
    setFilterDate(getStartOfToday())
    setCalendarVisible(false)
  }

  const handleClearDate = () => {
    setFilterDate(null)
    setCalendarVisible(false)
  }

  useEffect(() => {
    const currentBasePath = extractBasePath(location.pathname)

    if (prevBasePathRef?.current !== currentBasePath) {
      setFilterDate(null)
      setFilterType("title")
      setFilterString("")
    }

    prevBasePathRef.current = currentBasePath
  }, [location.pathname, showStatus])

  return (
    <div className="search-and-sort-bar" style={{ width: isBelowMedium ? "100%" : 370 }}>
      <SidebarTrigger />
      <div className="page-info">
        <div className="title-container">
          {title ? (
            <Typography.Ellipsis
              expandable={false}
              showTooltip={!isBelowMedium}
              style={{ fontWeight: 500 }}
            >
              {title}
            </Typography.Ellipsis>
          ) : (
            <div className="placeholder-title"></div>
          )}
        </div>
        {isArticleListReady && count > 0 && (
          <Typography.Text className="count-label">({count})</Typography.Text>
        )}
      </div>
      <div className="button-group">
        <ActiveButton
          active={!!filterString}
          icon={<IconSearch />}
          tooltip={polyglot.t("search.search")}
          onClick={openSearchModal}
        />
        <DatePicker
          popupVisible={calendarVisible}
          position="bottom"
          showNowBtn={false}
          value={filterDate}
          extra={
            <div className="calendar-actions">
              <Button long size="mini" type="primary" onClick={handleSetToday}>
                {polyglot.t("search.today")}
              </Button>
              <Button long size="mini" onClick={handleClearDate}>
                {polyglot.t("search.clear_date")}
              </Button>
            </div>
          }
          triggerElement={
            <CustomTooltip mini content={polyglot.t("search.select_date")}>
              <Button
                icon={<IconCalendar />}
                shape="circle"
                size="small"
                style={{
                  backgroundColor: filterDate ? "rgb(var(--primary-6))" : "inherit",
                }}
              />
            </CustomTooltip>
          }
          onChange={(v) => setFilterDate(v)}
          onVisibleChange={setCalendarVisible}
        />
        <CustomTooltip
          mini
          content={
            orderDirection === "desc"
              ? polyglot.t("article_list.sort_direction_desc")
              : polyglot.t("article_list.sort_direction_asc")
          }
        >
          <Button
            icon={orderDirection === "desc" ? <IconSortDescending /> : <IconSortAscending />}
            shape="circle"
            size="small"
            onClick={toggleOrderDirection}
          />
        </CustomTooltip>
      </div>
      <SearchModal
        initialValue={modalInputValue}
        visible={searchModalVisible}
        onCancel={closeSearchModal}
        onConfirm={handleConfirmSearch}
      />
    </div>
  )
}

export default SearchAndSortBar
