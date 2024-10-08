import { computed, map } from "nanostores";
import { removeDuplicateEntries } from "../utils/deduplicate";
import { filterEntries } from "../utils/filter";
import { createSetter } from "../utils/nanostores";
import { dataState, hiddenFeedIdsState } from "./dataState";
import { getSettings, settingsState } from "./settingsState";

const defaultValue = {
  activeContent: null, // 当前打开的文章
  entries: [], // 接口返回的所有文章
  filterString: "", // 搜索文本
  filterType: "Title", // title | content | author
  infoFrom: getSettings("homePage"), // all | today | starred | history
  isArticleFocused: false, // 文章是否被聚焦
  isArticleListReady: false, // 文章列表是否加载完成
  loadMoreVisible: false, // 加载更多元素可见性
  offset: 0, // 文章分页参数
  total: 0, // 接口返回文章总数原始值，不受接口返回数据长度限制
};

export const contentState = map(defaultValue);

export const filteredEntriesState = computed(
  [contentState, dataState, hiddenFeedIdsState, settingsState],
  (content, data, hiddenFeedIds, settings) => {
    const { entries, filterString, filterType, infoFrom } = content;
    const filteredEntries = filterEntries(entries, filterType, filterString);

    const { isVersionAtLeast2_2_0 } = data;
    const { removeDuplicates, showAllFeeds } = settings;
    const isValidFilter = !["starred", "history"].includes(infoFrom);
    const isVisible = (entry) =>
      isVersionAtLeast2_2_0 ||
      showAllFeeds ||
      !hiddenFeedIds.includes(entry.feed.id);
    const visibleEntries = isValidFilter
      ? filteredEntries.filter(isVisible)
      : filteredEntries;

    if (
      removeDuplicates === "none" ||
      ["starred", "history"].includes(infoFrom)
    ) {
      return visibleEntries;
    }
    return removeDuplicateEntries(visibleEntries, removeDuplicates);
  },
);

export const activeEntryIndexState = computed(
  [contentState, filteredEntriesState],
  (content, filteredEntries) => {
    const { activeContent } = content;
    if (!activeContent) {
      return -1;
    }
    return filteredEntries.findIndex((entry) => entry.id === activeContent.id);
  },
);

export const setActiveContent = createSetter(contentState, "activeContent");
export const setEntries = createSetter(contentState, "entries");
export const setFilterString = createSetter(contentState, "filterString");
export const setFilterType = createSetter(contentState, "filterType");
export const setInfoFrom = createSetter(contentState, "infoFrom");
export const setIsArticleFocused = createSetter(
  contentState,
  "isArticleFocused",
);
export const setIsArticleListReady = createSetter(
  contentState,
  "isArticleListReady",
);
export const setLoadMoreVisible = createSetter(contentState, "loadMoreVisible");
export const setOffset = createSetter(contentState, "offset");
export const setTotal = createSetter(contentState, "total");
export const resetContent = () => contentState.set(defaultValue);
