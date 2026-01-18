/**
 * Case Switcher - Options Page Logic
 * 
 * @module options
 * @license MIT
 */

"use strict";

const I18N = {
    en: {
        title: "Case Switcher",
        subtitle: "Configure your text transformation preferences",
        languageTitle: "Language",
        languageDesc: "Affects interface and how Title Case handles small words.",
        modesTitle: "Modes and Shortcuts",
        modesDesc: "Enable modes and customize keyboard shortcuts.",
        acronymsTitle: "Acronyms",
        acronymsDesc: "Words that remain unchanged in all transformations (one per line).",
        uppercase: "UPPERCASE",
        lowercase: "lowercase",
        capitalize: "Sentence Case",
        titleCase: "Title Case",
        camelCase: "camelCase",
        kebabCase: "kebab-case",
        snakeCase: "snake_case",
        trimSpaces: "Trim Spaces",
        removeAccents: "Remove Accents",
        slug: "URL Slug",
        restore: "Restore Defaults",
        saved: "Saved",
        restored: "Restored"
    },
    pt: {
        menuTitle: "Alternador de Caixa", // kept for safety, though only used in bg
        title: "Alternador de Caixa",
        subtitle: "Configure suas preferências de transformação de texto",
        languageTitle: "Idioma",
        languageDesc: "Afeta a interface e como o Título trata palavras pequenas.",
        modesTitle: "Modos e Atalhos",
        modesDesc: "Ative modos e personalize atalhos de teclado.",
        acronymsTitle: "Siglas",
        acronymsDesc: "Palavras que permanecem inalteradas em todas as transformações (uma por linha).",
        uppercase: "MAIÚSCULAS",
        lowercase: "minúsculas",
        capitalize: "Primeira Letra",
        titleCase: "Título",
        camelCase: "camelCase",
        kebabCase: "kebab-case",
        snakeCase: "snake_case",
        trimSpaces: "Ajustar Espaços",
        removeAccents: "Remover Acentos",
        slug: "URL Slug",
        restore: "Restaurar Padrões",
        saved: "Salvo",
        restored: "Restaurado"
    },
    es: {
        title: "Cambiar Mayúsculas",
        subtitle: "Configura tus preferencias de transformación de texto",
        languageTitle: "Idioma",
        languageDesc: "Afecta la interfaz y cómo Título maneja palabras pequeñas.",
        modesTitle: "Modos y Atajos",
        modesDesc: "Activa modos y personaliza atajos de teclado.",
        acronymsTitle: "Siglas",
        acronymsDesc: "Palabras que permanecen sin cambios en todas las transformaciones (una por línea).",
        uppercase: "MAYÚSCULAS",
        lowercase: "minúsculas",
        capitalize: "Primera Letra",
        titleCase: "Título",
        camelCase: "camelCase",
        kebabCase: "kebab-case",
        snakeCase: "snake_case",
        trimSpaces: "Ajustar Espacios",
        removeAccents: "Quitar Acentos",
        slug: "URL Slug",
        restore: "Restaurar",
        saved: "Guardado",
        restored: "Restaurado"
    },
    fr: {
        title: "Changeur de Casse",
        subtitle: "Configurez vos préférences de transformation de texte",
        languageTitle: "Langue",
        languageDesc: "Affecte l'interface et comment Titre gère les petits mots.",
        modesTitle: "Modes et Raccourcis",
        modesDesc: "Activez les modes et personnalisez les raccourcis clavier.",
        acronymsTitle: "Sigles",
        acronymsDesc: "Mots qui restent inchangés dans toutes les transformations (un par ligne).",
        uppercase: "MAJUSCULES",
        lowercase: "minuscules",
        capitalize: "Première Lettre",
        titleCase: "Titre",
        camelCase: "camelCase",
        kebabCase: "kebab-case",
        snakeCase: "snake_case",
        trimSpaces: "Ajuster Espaces",
        removeAccents: "Supprimer Accents",
        slug: "URL Slug",
        restore: "Restaurer",
        saved: "Enregistré",
        restored: "Restauré"
    },
    de: {
        title: "Groß-/Kleinschreibung",
        subtitle: "Konfigurieren Sie Ihre Texttransformationseinstellungen",
        languageTitle: "Sprache",
        languageDesc: "Beeinflusst die Oberfläche und wie Titel kleine Wörter behandelt.",
        modesTitle: "Modi und Tastenkürzel",
        modesDesc: "Aktivieren Sie Modi und passen Sie Tastenkürzel an.",
        acronymsTitle: "Akronyme",
        acronymsDesc: "Wörter, die bei allen Transformationen unverändert bleiben (eins pro Zeile).",
        uppercase: "GROSSBUCHSTABEN",
        lowercase: "kleinbuchstaben",
        capitalize: "Erster Buchstabe",
        titleCase: "Titel",
        camelCase: "camelCase",
        kebabCase: "kebab-case",
        snakeCase: "snake_case",
        trimSpaces: "Leerzeichen Anpassen",
        removeAccents: "Akzente Entfernen",
        slug: "URL Slug",
        restore: "Zurücksetzen",
        saved: "Gespeichert",
        restored: "Zurückgesetzt"
    },
    it: {
        title: "Cambia Maiuscole",
        subtitle: "Configura le tue preferenze di trasformazione del testo",
        languageTitle: "Lingua",
        languageDesc: "Influenza l'interfaccia e come Titolo gestisce le parole brevi.",
        modesTitle: "Modi e Scorciatoie",
        modesDesc: "Attiva i modi e personalizza le scorciatoie da tastiera.",
        acronymsTitle: "Acronimi",
        acronymsDesc: "Parole che rimangono invariate in tutte le trasformazioni (una per riga).",
        uppercase: "MAIUSCOLO",
        lowercase: "minuscolo",
        capitalize: "Prima Lettera",
        titleCase: "Titolo",
        camelCase: "camelCase",
        kebabCase: "kebab-case",
        snakeCase: "snake_case",
        trimSpaces: "Regola Spazi",
        removeAccents: "Rimuovi Accenti",
        slug: "URL Slug",
        restore: "Ripristina",
        saved: "Salvato",
        restored: "Ripristinato"
    }
};

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

const MODES = [
    "uppercase", "lowercase", "capitalize", "titleCase",
    "camelCase", "kebabCase", "snakeCase",
    "trimSpaces", "removeAccents", "slug"
];

const STATUS_DURATION = 1500;

const elements = {
    languageSelect: null,
    modeCheckboxes: {},
    shortcutInputs: {},
    acronymsInput: null,
    restoreButton: null,
    saveStatus: null
};

let currentLanguage = "en";

function debounce(fn, delay) {
    let timeoutId = null;
    return function (...args) {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}

function getTranslation(key) {
    return I18N[currentLanguage]?.[key] || I18N.en[key] || key;
}

function updateUILanguage() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        const translation = getTranslation(key);
        if (translation) el.textContent = translation;
    });
    document.documentElement.lang = currentLanguage;
}

function showStatus(messageKey) {
    if (!elements.saveStatus) return;
    elements.saveStatus.textContent = getTranslation(messageKey);
    elements.saveStatus.classList.add("visible");
    setTimeout(() => elements.saveStatus.classList.remove("visible"), STATUS_DURATION);
}

async function loadSettings() {
    try {
        const stored = await browser.storage.sync.get(DEFAULT_SETTINGS);
        currentLanguage = stored.language || DEFAULT_SETTINGS.language;

        if (elements.languageSelect) {
            elements.languageSelect.value = currentLanguage;
        }

        const enabledModes = { ...DEFAULT_SETTINGS.enabledModes, ...stored.enabledModes };
        const shortcuts = { ...DEFAULT_SETTINGS.shortcuts, ...stored.shortcuts };

        for (const mode of MODES) {
            if (elements.modeCheckboxes[mode]) {
                elements.modeCheckboxes[mode].checked = enabledModes[mode] ?? true;
            }
            if (elements.shortcutInputs[mode]) {
                elements.shortcutInputs[mode].value = shortcuts[mode] || "";
            }
        }

        if (elements.acronymsInput) {
            const acronyms = stored.acronyms || [];
            elements.acronymsInput.value = acronyms.join("\n");
        }

        updateUILanguage();
    } catch (error) {
        console.error("[Case Switcher] Failed to load settings:", error);
    }
}

async function saveSettings() {
    try {
        const settings = {
            language: elements.languageSelect?.value || DEFAULT_SETTINGS.language,
            enabledModes: {},
            shortcuts: {},
            acronyms: []
        };

        for (const mode of MODES) {
            settings.enabledModes[mode] = elements.modeCheckboxes[mode]?.checked ?? true;
            settings.shortcuts[mode] = elements.shortcutInputs[mode]?.value.trim() || "";
        }

        const hasEnabled = Object.values(settings.enabledModes).some(v => v);
        if (!hasEnabled) {
            settings.enabledModes.uppercase = true;
            if (elements.modeCheckboxes.uppercase) {
                elements.modeCheckboxes.uppercase.checked = true;
            }
        }

        if (elements.acronymsInput) {
            settings.acronyms = elements.acronymsInput.value
                .split("\n")
                .map(s => s.trim().toUpperCase())
                .filter(s => s.length > 0);
        }

        await browser.storage.sync.set(settings);
        showStatus("saved");
    } catch (error) {
        console.error("[Case Switcher] Failed to save settings:", error);
    }
}

async function restoreDefaults() {
    try {
        await browser.storage.sync.set(DEFAULT_SETTINGS);
        currentLanguage = DEFAULT_SETTINGS.language;
        await loadSettings();
        showStatus("restored");
    } catch (error) {
        console.error("[Case Switcher] Failed to restore defaults:", error);
    }
}

const debouncedSave = debounce(saveSettings, 400);

function onLanguageChange() {
    currentLanguage = elements.languageSelect?.value || "en";
    updateUILanguage();
    debouncedSave();
}

function onSettingChange() {
    debouncedSave();
}

function init() {
    elements.languageSelect = document.getElementById("language-select");
    elements.restoreButton = document.getElementById("btn-restore");
    elements.saveStatus = document.getElementById("save-status");
    elements.acronymsInput = document.getElementById("acronyms-input");

    for (const mode of MODES) {
        elements.modeCheckboxes[mode] = document.getElementById(`mode-${mode}`);
        elements.shortcutInputs[mode] = document.querySelector(`.shortcut-input[data-mode="${mode}"]`);
    }

    elements.languageSelect?.addEventListener("change", onLanguageChange);
    elements.restoreButton?.addEventListener("click", restoreDefaults);
    elements.acronymsInput?.addEventListener("input", debouncedSave);

    for (const mode of MODES) {
        elements.modeCheckboxes[mode]?.addEventListener("change", onSettingChange);
        elements.shortcutInputs[mode]?.addEventListener("input", onSettingChange);
    }

    loadSettings();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
