import { persistentAtom } from "@nanostores/persistent"

import { getBrowserLanguage } from "@/utils/locales"

const defaultValue = {
  articleWidth: 75,
  coverDisplayMode: "auto",
  edgeToEdgeImages: false,
  fontFamily: "Inter, --apple-system, 'Noto Sans SC', system-ui, sans-serif",
  fontSize: 1.05,
  homePage: "all",
  language: getBrowserLanguage(),
  markReadBy: "view",
  markReadOnScroll: false,
  orderBy: "created_at",
  orderDirection: "desc",
  pageSize: 100,
  removeDuplicates: "none",
  showDetailedRelativeTime: false,
  showEstimatedReadingTime: false,
  showFeedIcon: true,
  showHiddenFeeds: false,
  showStatus: "unread",
  showUnreadFeedsOnly: false,
  themeColor: "Orange",
  themeMode: "system",
  titleAlignment: "center",
  updateContentOnFetch: false,
}

export const settingsState = persistentAtom("settings", defaultValue, {
  encode: (value) => {
    const filteredValue = Object.keys(value).reduce((acc, key) => {
      if (key in defaultValue) {
        acc[key] = value[key]
      }
      return acc
    }, {})
    return JSON.stringify(filteredValue)
  },
  decode: (str) => {
    const storedValue = JSON.parse(str)
    return { ...defaultValue, ...storedValue }
  },
})

export const getSettings = (key) => settingsState.get()[key]

export const updateSettings = (settingsChanges) =>
  settingsState.set({ ...settingsState.get(), ...settingsChanges })

export const resetSettings = () => settingsState.set(defaultValue)
