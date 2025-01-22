import { useStore } from "@nanostores/react"
import { map } from "nanostores"

import createSetter from "@/utils/nanostores"

const state = map({
  addFeedModalVisible: false,
  feedManageVisible: false,
  feedManageTabsActiveTab: "1",
  settingsModalVisible: false,
  settingsTabsActiveTab: "1",
})

const setAddFeedModalVisible = createSetter(state, "addFeedModalVisible")
const setFeedManageVisible = createSetter(state, "feedManageVisible")
const setFeedManageTabsActiveTab = createSetter(state, "feedManageTabsActiveTab")
const setSettingsModalVisible = createSetter(state, "settingsModalVisible")
const setSettingsTabsActiveTab = createSetter(state, "settingsTabsActiveTab")

const useModalToggle = () => {
  const {
    addFeedModalVisible,
    feedManageVisible,
    feedManageTabsActiveTab,
    settingsModalVisible,
    settingsTabsActiveTab,
  } = useStore(state)

  return {
    addFeedModalVisible,
    setAddFeedModalVisible,
    feedManageVisible,
    setFeedManageVisible,
    feedManageTabsActiveTab,
    setFeedManageTabsActiveTab,
    settingsModalVisible,
    setSettingsModalVisible,
    settingsTabsActiveTab,
    setSettingsTabsActiveTab,
  }
}

export default useModalToggle
