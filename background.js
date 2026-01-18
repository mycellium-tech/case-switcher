/**
 * Case Switcher - Background Service Worker
 * 
 * Manages context menus, keyboard shortcuts, and extension lifecycle.
 * Shows keyboard shortcuts in context menu items.
 * 
 * @module background
 * @license MIT
 */

"use strict";

// ============================================================================
// INTERNATIONALIZATION
// ============================================================================

const I18N = {
    en: {
        menuTitle: "Case Switcher",
        settings: "Settings...",
        uppercase: "UPPERCASE",
        lowercase: "lowercase",
        capitalize: "Sentence Case",
        titleCase: "Title Case",
        camelCase: "camelCase",
        kebabCase: "kebab-case",
        snakeCase: "snake_case",
        trimSpaces: "Trim Spaces",
        removeAccents: "Remove Accents",
        slug: "URL Slug"
    },
    pt: {
        menuTitle: "Alternador de Caixa",
        settings: "Configurações...",
        uppercase: "MAIÚSCULAS",
        lowercase: "minúsculas",
        capitalize: "Primeira Letra",
        titleCase: "Título",
        camelCase: "camelCase",
        kebabCase: "kebab-case",
        snakeCase: "snake_case",
        trimSpaces: "Ajustar Espaços",
        removeAccents: "Remover Acentos",
        slug: "URL Slug"
    },
    es: {
        menuTitle: "Cambiar Mayúsculas",
        settings: "Configuración...",
        uppercase: "MAYÚSCULAS",
        lowercase: "minúsculas",
        capitalize: "Primera Letra",
        titleCase: "Título",
        camelCase: "camelCase",
        kebabCase: "kebab-case",
        snakeCase: "snake_case",
        trimSpaces: "Ajustar Espacios",
        removeAccents: "Quitar Acentos",
        slug: "URL Slug"
    },
    fr: {
        menuTitle: "Changeur de Casse",
        settings: "Paramètres...",
        uppercase: "MAJUSCULES",
        lowercase: "minuscules",
        capitalize: "Première Lettre",
        titleCase: "Titre",
        camelCase: "camelCase",
        kebabCase: "kebab-case",
        snakeCase: "snake_case",
        trimSpaces: "Ajuster Espaces",
        removeAccents: "Supprimer Accents",
        slug: "URL Slug"
    },
    de: {
        menuTitle: "Groß-/Kleinschreibung",
        settings: "Einstellungen...",
        uppercase: "GROSSBUCHSTABEN",
        lowercase: "kleinbuchstaben",
        capitalize: "Erster Buchstabe",
        titleCase: "Titel",
        camelCase: "camelCase",
        kebabCase: "kebab-case",
        snakeCase: "snake_case",
        trimSpaces: "Leerzeichen Anpassen",
        removeAccents: "Akzente Entfernen",
        slug: "URL Slug"
    },
    it: {
        menuTitle: "Cambia Maiuscole",
        settings: "Impostazioni...",
        uppercase: "MAIUSCOLO",
        lowercase: "minuscolo",
        capitalize: "Prima Letra",
        titleCase: "Titolo",
        camelCase: "camelCase",
        kebabCase: "kebab-case",
        snakeCase: "snake_case",
        trimSpaces: "Regola Spazi",
        removeAccents: "Rimuovi Accenti",
        slug: "URL Slug"
    }
};

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_SETTINGS = {
    language: "en",
    enabledModes: {
        uppercase: true,
        lowercase: true,
        capitalize: true,
        titleCase: true,
        camelCase: true,
        kebabCase: true,
        snakeCase: true,
        trimSpaces: true,
        removeAccents: true,
        slug: true
    },
    shortcuts: {
        uppercase: "1",
        lowercase: "2",
        capitalize: "3",
        titleCase: "4",
        camelCase: "5",
        kebabCase: "6",
        snakeCase: "7",
        trimSpaces: "8",
        removeAccents: "9",
        slug: "0"
    },
    acronyms: []
};

const MENU_ITEMS = [
    { id: "uppercase", shortcut: "1" },
    { id: "lowercase", shortcut: "2" },
    { id: "capitalize", shortcut: "3" },
    { id: "titleCase", shortcut: "4" },
    { id: "camelCase", shortcut: "5" },
    { id: "kebabCase", shortcut: "6" },
    { id: "snakeCase", shortcut: "7" },
    { id: "trimSpaces", shortcut: "8" },
    { id: "removeAccents", shortcut: "9" },
    { id: "slug", shortcut: "0" }
];

let currentSettings = { ...DEFAULT_SETTINGS };
let currentShortcuts = { ...DEFAULT_SETTINGS.shortcuts };

// ============================================================================
// HELPERS
// ============================================================================

function getTranslation(key) {
    const lang = currentSettings.language || "en";
    return I18N[lang]?.[key] || I18N.en[key] || key;
}

async function rebuildContextMenus() {
    try {
        await browser.contextMenus.removeAll();

        browser.contextMenus.create({
            id: "case-switcher-parent",
            title: getTranslation("menuTitle"),
            contexts: ["selection"]
        });

        const enabledModes = currentSettings.enabledModes || DEFAULT_SETTINGS.enabledModes;
        const shortcuts = currentSettings.shortcuts || DEFAULT_SETTINGS.shortcuts;

        for (const item of MENU_ITEMS) {
            if (enabledModes[item.id]) {
                const label = getTranslation(item.id);
                const shortcutKey = shortcuts[item.id] || item.shortcut;
                const title = shortcutKey ? `${label} (Alt+Shift+${shortcutKey})` : label;
                browser.contextMenus.create({
                    id: `transform-${item.id}`,
                    parentId: "case-switcher-parent",
                    title: title,
                    contexts: ["selection"]
                });
            }
        }

        browser.contextMenus.create({
            id: "case-switcher-separator",
            parentId: "case-switcher-parent",
            type: "separator",
            contexts: ["selection"]
        });

        browser.contextMenus.create({
            id: "case-switcher-options",
            parentId: "case-switcher-parent",
            title: getTranslation("settings"),
            contexts: ["selection"]
        });

        console.log("[Case Switcher] Context menus rebuilt");
    } catch (error) {
        console.error("[Case Switcher] Failed to rebuild menus:", error);
    }
}

// ============================================================================
// SETTINGS
// ============================================================================

async function loadSettings() {
    try {
        const stored = await browser.storage.sync.get(DEFAULT_SETTINGS);
        currentSettings = {
            language: stored.language || DEFAULT_SETTINGS.language,
            enabledModes: { ...DEFAULT_SETTINGS.enabledModes, ...stored.enabledModes },
            shortcuts: { ...DEFAULT_SETTINGS.shortcuts, ...stored.shortcuts },
            acronyms: stored.acronyms || []
        };
        return currentSettings;
    } catch (error) {
        console.error("[Case Switcher] Failed to load settings:", error);
        currentSettings = { ...DEFAULT_SETTINGS };
        return currentSettings;
    }
}

// ============================================================================
// TRANSFORMATION
// ============================================================================

async function executeTransformation(tabId, mode) {
    try {
        await browser.tabs.sendMessage(tabId, {
            action: "transform",
            mode: mode,
            language: currentSettings.language,
            acronyms: currentSettings.acronyms || []
        });
    } catch (error) {
        try {
            await browser.scripting.executeScript({
                target: { tabId },
                files: ["content.js"]
            });
            await browser.tabs.sendMessage(tabId, {
                action: "transform",
                mode: mode,
                language: currentSettings.language
            });
        } catch (retryError) {
            console.error("[Case Switcher] Transformation failed:", retryError);
        }
    }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

browser.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === "install") {
        await browser.storage.sync.set(DEFAULT_SETTINGS);
    }
    await loadSettings();
    await rebuildContextMenus();
});

browser.runtime.onStartup.addListener(async () => {
    await loadSettings();
    await rebuildContextMenus();
});

browser.storage.onChanged.addListener(async (changes, areaName) => {
    if (areaName !== "sync") return;
    if (changes.language) currentSettings.language = changes.language.newValue;
    if (changes.enabledModes) currentSettings.enabledModes = changes.enabledModes.newValue;
    if (changes.shortcuts) currentSettings.shortcuts = changes.shortcuts.newValue;
    if (changes.acronyms) currentSettings.acronyms = changes.acronyms.newValue;
    await rebuildContextMenus();
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "case-switcher-options") {
        browser.runtime.openOptionsPage();
        return;
    }
    if (info.menuItemId.startsWith("transform-")) {
        const mode = info.menuItemId.replace("transform-", "");
        await executeTransformation(tab.id, mode);
    }
});

browser.commands.onCommand.addListener(async (command) => {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) return;
    const mode = command.replace("transform-", "");
    await executeTransformation(tabs[0].id, mode);
});

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getSettings") {
        sendResponse(currentSettings);
        return true;
    }
    return false;
});

loadSettings().then(() => {
    console.log("[Case Switcher] Background initialized");
});
