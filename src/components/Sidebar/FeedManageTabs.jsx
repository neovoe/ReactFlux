import { Tabs } from "@arco-design/web-react"
import { IconFile, IconFolder } from "@arco-design/web-react/icon"
import { useStore } from "@nanostores/react"
import SimpleBar from "simplebar-react"

import CategoryList from "./CategoryList"
import FeedList from "./FeedList"

import { polyglotState } from "@/hooks/useLanguage"

import "./FeedManageTabs.css"

const CustomTabTitle = ({ icon, title }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}
  >
    {icon}
    <div style={{ fontSize: "12px" }}>{title}</div>
  </div>
)

const FeedManageTabs = ({ activeTab, onTabChange }) => {
  const { polyglot } = useStore(polyglotState)

  return (
    <SimpleBar
      style={{
        maxHeight: "80vh",
        overflow: "auto",
        marginRight: "-20px",
        paddingRight: "20px",
      }}
    >
      <Tabs
        animation
        activeTab={activeTab}
        className="custom-tabs"
        tabPosition="top"
        onChange={onTabChange}
      >
        <Tabs.TabPane
          key="1"
          title={
            <CustomTabTitle
              icon={<IconFile style={{ fontSize: "20px" }} />}
              title={polyglot.t("settings.feeds")}
            />
          }
        >
          <FeedList />
        </Tabs.TabPane>
        <Tabs.TabPane
          key="2"
          title={
            <CustomTabTitle
              icon={<IconFolder style={{ fontSize: "20px" }} />}
              title={polyglot.t("settings.categories")}
            />
          }
        >
          <CategoryList />
        </Tabs.TabPane>
      </Tabs>
    </SimpleBar>
  )
}

export default FeedManageTabs
