import { Tabs } from "@arco-design/web-react"
import { IconCommand, IconSkin, IconStorage } from "@arco-design/web-react/icon"
import { useStore } from "@nanostores/react"

import Appearance from "./Appearance"
import General from "./General"
import Hotkeys from "./Hotkeys"

import { polyglotState } from "@/hooks/useLanguage"
import useScreenWidth from "@/hooks/useScreenWidth"

import "./SettingsTabs.css"

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

const SettingsTabs = ({ activeTab, onTabChange }) => {
  const { polyglot } = useStore(polyglotState)
  const { isBelowMedium } = useScreenWidth()

  return (
    <div
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
              icon={<IconStorage style={{ fontSize: "20px" }} />}
              title={polyglot.t("settings.general")}
            />
          }
        >
          <General />
        </Tabs.TabPane>
        <Tabs.TabPane
          key="2"
          title={
            <CustomTabTitle
              icon={<IconSkin style={{ fontSize: "20px" }} />}
              title={polyglot.t("settings.appearance")}
            />
          }
        >
          <Appearance />
        </Tabs.TabPane>
        {!isBelowMedium && (
          <Tabs.TabPane
            key="3"
            title={
              <CustomTabTitle
                icon={<IconCommand style={{ fontSize: "20px" }} />}
                title={polyglot.t("settings.hotkeys")}
              />
            }
          >
            <Hotkeys />
          </Tabs.TabPane>
        )}
      </Tabs>
    </div>
  )
}

export default SettingsTabs
