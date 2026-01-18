/**
 * Case Switcher - Content Script
 * 
 * Full Unicode support with 10 transformation modes.
 * Acronyms are preserved unchanged in all transformations.
 * 
 * @module content
 * @license MIT
 */

"use strict";

// ============================================================================
// TEXT TRANSFORMATION (INLINE)
// ============================================================================

const MAX_TEXT_LENGTH = 102400;

const SMALL_WORDS = {
    en: new Set(["a", "an", "the", "and", "but", "or", "for", "nor", "so", "yet", "as", "at", "by", "in", "of", "on", "to", "up", "vs", "via", "if", "is", "it", "be", "no"]),
    pt: new Set(["a", "o", "as", "os", "um", "uma", "uns", "umas", "ao", "aos", "à", "às", "de", "da", "do", "das", "dos", "em", "na", "no", "nas", "nos", "por", "para", "com", "sem", "sob", "sobre", "entre", "até", "após", "ante", "contra", "dum", "duma", "num", "numa", "pelo", "pela", "pelos", "pelas", "e", "ou", "mas", "nem", "que", "se", "pois"]),
    es: new Set(["el", "la", "los", "las", "un", "una", "unos", "unas", "a", "al", "de", "del", "en", "con", "sin", "por", "para", "entre", "hacia", "hasta", "desde", "sobre", "bajo", "ante", "y", "e", "o", "u", "ni", "que", "si", "pero", "mas"]),
    fr: new Set(["le", "la", "les", "un", "une", "des", "du", "de", "l", "à", "au", "aux", "en", "par", "pour", "sur", "sous", "avec", "sans", "chez", "entre", "vers", "et", "ou", "ni", "mais", "que", "si"]),
    de: new Set(["der", "die", "das", "den", "dem", "des", "ein", "eine", "einer", "einem", "einen", "an", "auf", "aus", "bei", "in", "im", "mit", "nach", "von", "vom", "vor", "zu", "zur", "zum", "für", "über", "unter", "durch", "gegen", "ohne", "und", "oder", "aber", "denn", "wenn", "als", "ob"]),
    it: new Set(["il", "lo", "la", "i", "gli", "le", "un", "uno", "una", "a", "al", "allo", "alla", "ai", "agli", "alle", "da", "dal", "dallo", "dalla", "dai", "dagli", "dalle", "di", "del", "dello", "della", "dei", "degli", "delle", "in", "nel", "nello", "nella", "nei", "negli", "nelle", "su", "sul", "sullo", "sulla", "sui", "sugli", "sulle", "con", "per", "tra", "fra", "e", "ed", "o", "ma", "che", "se"])
};

const ACCENT_MAP = {
    "À": "A", "Á": "A", "Â": "A", "Ã": "A", "Ä": "A", "Å": "A", "Æ": "AE",
    "Ç": "C", "È": "E", "É": "E", "Ê": "E", "Ë": "E",
    "Ì": "I", "Í": "I", "Î": "I", "Ï": "I",
    "Ð": "D", "Ñ": "N", "Ò": "O", "Ó": "O", "Ô": "O", "Õ": "O", "Ö": "O", "Ø": "O",
    "Ù": "U", "Ú": "U", "Û": "U", "Ü": "U", "Ý": "Y",
    "Þ": "TH", "ß": "ss",
    "à": "a", "á": "a", "â": "a", "ã": "a", "ä": "a", "å": "a", "æ": "ae",
    "ç": "c", "è": "e", "é": "e", "ê": "e", "ë": "e",
    "ì": "i", "í": "i", "î": "i", "ï": "i",
    "ð": "d", "ñ": "n", "ò": "o", "ó": "o", "ô": "o", "õ": "o", "ö": "o", "ø": "o",
    "ù": "u", "ú": "u", "û": "u", "ü": "u", "ý": "y", "þ": "th", "ÿ": "y",
    "Œ": "OE", "œ": "oe", "Š": "S", "š": "s", "Ž": "Z", "ž": "z",
    "ƒ": "f", "Ğ": "G", "ğ": "g", "İ": "I", "ı": "i", "Ş": "S", "ş": "s"
};

const SENTENCE_BOUNDARY = /([.!?:;][\s\u00A0]*)/;

// Global acronym set - populated from settings
let acronymSet = new Set();

function validateInput(text) {
    if (typeof text !== "string" || text.length === 0) return { valid: false, text: "", truncated: false };
    if (text.length > MAX_TEXT_LENGTH) return { valid: true, text: text.substring(0, MAX_TEXT_LENGTH), truncated: true };
    return { valid: true, text, truncated: false };
}

function capitalizeFirst(str) {
    if (!str) return str;
    const chars = [...str];
    return chars[0].toLocaleUpperCase() + chars.slice(1).join("").toLocaleLowerCase();
}

function upperFirst(str) {
    if (!str) return str;
    const chars = [...str];
    return chars[0].toLocaleUpperCase() + chars.slice(1).join("");
}

function normalizeToSpaces(text) {
    return text.replace(/[-_]+/g, " ").replace(/\s+/g, " ");
}

// Helper: Check if a word is an acronym and should be preserved
function isAcronym(word) {
    return acronymSet.has(word.toUpperCase());
}

// Helper: Preserve acronyms in text, apply transformer to non-acronyms
function preserveAcronyms(text, transformer) {
    // Split by word boundaries while keeping separators
    const tokens = text.split(/(\s+|[^\p{L}\p{N}]+)/u);
    return tokens.map(token => {
        // If it's whitespace or punctuation, keep as-is
        if (/^[\s\p{P}]*$/u.test(token)) return token;
        // If it's an acronym, return uppercase
        if (isAcronym(token)) return token.toUpperCase();
        // Otherwise apply transformer
        return transformer(token);
    }).join("");
}

function toUpperCase(text, language = "en") {
    const { valid, text: sanitized, truncated } = validateInput(text);
    if (!valid) return { result: "", truncated: false };
    const normalized = normalizeToSpaces(sanitized);
    const result = preserveAcronyms(normalized, t => t.toLocaleUpperCase(language));
    return { result, truncated };
}

function toLowerCase(text, language = "en") {
    const { valid, text: sanitized, truncated } = validateInput(text);
    if (!valid) return { result: "", truncated: false };
    const normalized = normalizeToSpaces(sanitized);
    const result = preserveAcronyms(normalized, t => t.toLocaleLowerCase(language));
    return { result, truncated };
}

function capitalize(text, language = "en") {
    const { valid, text: sanitized, truncated } = validateInput(text);
    if (!valid) return { result: "", truncated: false };

    const normalized = normalizeToSpaces(sanitized);
    const parts = normalized.split(SENTENCE_BOUNDARY);
    let result = "";
    let capitalizeNext = true;

    for (const part of parts) {
        if (SENTENCE_BOUNDARY.test(part)) {
            result += part;
            capitalizeNext = true;
        } else if (capitalizeNext && part.length > 0) {
            const leadingSpace = part.match(/^[\s\u00A0]*/)[0];
            const content = part.substring(leadingSpace.length);
            if (content.length > 0) {
                result += leadingSpace + preserveAcronyms(content, capitalizeFirst);
            } else {
                result += part;
            }
            capitalizeNext = false;
        } else {
            result += preserveAcronyms(part, t => t.toLocaleLowerCase(language));
        }
    }
    return { result, truncated };
}

function toTitleCase(text, language = "en") {
    const { valid, text: sanitized, truncated } = validateInput(text);
    if (!valid) return { result: "", truncated: false };

    const normalized = normalizeToSpaces(sanitized);
    const smallWords = SMALL_WORDS[language] || SMALL_WORDS.en;
    const tokens = normalized.split(/(\s+)/);

    let isFirstWord = true;
    let afterColon = false;

    const resultTokens = tokens.map((token) => {
        if (/^\s+$/.test(token)) return token;

        const match = token.match(/^([^\p{L}]*)([\p{L}]+)([^\p{L}]*)$/u);
        if (!match) {
            if (token.includes(":")) afterColon = true;
            return token;
        }

        const [, prefix, word, suffix] = match;
        const upperWord = word.toUpperCase();
        const lowerWord = word.toLocaleLowerCase(language);

        let transformed;
        if (isAcronym(word)) {
            transformed = upperWord;
        } else if (isFirstWord || afterColon || !smallWords.has(lowerWord)) {
            transformed = upperFirst(lowerWord);
        } else {
            transformed = lowerWord;
        }

        isFirstWord = false;
        afterColon = suffix.includes(":");
        return prefix + transformed + suffix;
    });

    return { result: resultTokens.join(""), truncated };
}

function toCamelCase(text, language = "en") {
    const { valid, text: sanitized, truncated } = validateInput(text);
    if (!valid) return { result: "", truncated: false };

    const words = sanitized.split(/[^\p{L}\p{N}]+/u).filter(w => w.length > 0);
    if (words.length === 0) return { result: "", truncated };

    const result = words.map((word, i) => {
        if (isAcronym(word)) return word.toUpperCase();
        const lower = word.toLocaleLowerCase(language);
        return i === 0 ? lower : upperFirst(lower);
    }).join("");

    return { result, truncated };
}

function toKebabCase(text, language = "en") {
    const { valid, text: sanitized, truncated } = validateInput(text);
    if (!valid) return { result: "", truncated: false };

    const words = sanitized
        .replace(/([\p{Ll}])([\p{Lu}])/gu, "$1-$2")
        .split(/[^\p{L}\p{N}]+/u)
        .filter(w => w.length > 0)
        .map(w => isAcronym(w) ? w.toUpperCase() : w.toLocaleLowerCase(language));

    return { result: words.join("-"), truncated };
}

function toSnakeCase(text, language = "en") {
    const { valid, text: sanitized, truncated } = validateInput(text);
    if (!valid) return { result: "", truncated: false };

    const words = sanitized
        .replace(/([\p{Ll}])([\p{Lu}])/gu, "$1_$2")
        .split(/[^\p{L}\p{N}]+/u)
        .filter(w => w.length > 0)
        .map(w => isAcronym(w) ? w.toUpperCase() : w.toLocaleLowerCase(language));

    return { result: words.join("_"), truncated };
}

function trimSpaces(text) {
    const { valid, text: sanitized, truncated } = validateInput(text);
    if (!valid) return { result: "", truncated: false };

    const result = sanitized
        .replace(/[\t\r\n]+/g, " ")
        .replace(/ {2,}/g, " ")
        .replace(/^\s+|\s+$/g, "");

    return { result, truncated };
}

function removeAccents(text) {
    const { valid, text: sanitized, truncated } = validateInput(text);
    if (!valid) return { result: "", truncated: false };

    // For acronyms, preserve them as-is (no accent removal)
    const tokens = sanitized.split(/(\s+|[^\p{L}\p{N}]+)/u);
    const result = tokens.map(token => {
        if (/^[\s\p{P}]*$/u.test(token)) return token;
        if (isAcronym(token)) return token.toUpperCase();
        let processed = "";
        for (const char of token) {
            processed += ACCENT_MAP[char] || char;
        }
        return processed;
    }).join("");

    return { result, truncated };
}

function toSlug(text, language = "en") {
    const { valid, text: sanitized, truncated } = validateInput(text);
    if (!valid) return { result: "", truncated: false };

    // Split into words, preserve acronyms
    const words = sanitized.split(/[^\p{L}\p{N}]+/u).filter(w => w.length > 0);

    const result = words.map(word => {
        if (isAcronym(word)) return word.toUpperCase();
        // Remove accents
        let processed = "";
        for (const char of word) {
            processed += ACCENT_MAP[char] || char;
        }
        return processed.toLocaleLowerCase(language);
    }).join("-");

    return { result, truncated };
}

function transform(text, mode, language = "en") {
    const transformers = {
        uppercase: toUpperCase,
        lowercase: toLowerCase,
        capitalize: capitalize,
        titleCase: toTitleCase,
        camelCase: toCamelCase,
        kebabCase: toKebabCase,
        snakeCase: toSnakeCase,
        trimSpaces: trimSpaces,
        removeAccents: removeAccents,
        slug: toSlug
    };

    const transformer = transformers[mode];
    if (!transformer) return { result: text, truncated: false, error: `Unknown mode: ${mode}` };

    try {
        return transformer(text, language);
    } catch (error) {
        console.error("[Case Switcher] Transform error:", error);
        return { result: text, truncated: false, error: error.message };
    }
}

// ============================================================================
// VISUAL FEEDBACK
// ============================================================================

function showFeedback(element, type = "success") {
    if (!element || typeof element.animate !== "function") return;
    const colors = {
        success: { from: "rgba(74, 222, 128, 0.4)", to: "transparent" },
        warning: { from: "rgba(251, 191, 36, 0.4)", to: "transparent" }
    };
    const color = colors[type] || colors.success;

    try {
        element.animate([
            { boxShadow: `0 0 0 2px ${color.from}`, offset: 0 },
            { boxShadow: `0 0 0 4px ${color.from}`, offset: 0.3 },
            { boxShadow: `0 0 0 2px ${color.to}`, offset: 1 }
        ], { duration: 400, easing: "ease-out" });
    } catch (e) { }
}

// ============================================================================
// DEBOUNCE
// ============================================================================

function debounce(fn, delay) {
    let timeoutId = null;
    return function (...args) {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => { fn.apply(this, args); timeoutId = null; }, delay);
    };
}

// ============================================================================
// TEXT REPLACEMENT
// ============================================================================

function replaceInputText(element, newText) {
    const start = element.selectionStart;
    const end = element.selectionEnd;
    if (start === end) return false;

    element.focus();
    const success = document.execCommand("insertText", false, newText);

    if (!success) {
        const before = element.value.substring(0, start);
        const after = element.value.substring(end);
        element.value = before + newText + after;
        element.setSelectionRange(start, start + newText.length);
    }
    return true;
}

function replaceContentEditableText(selection, newText) {
    if (selection.rangeCount === 0) return false;

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const textNode = document.createTextNode(newText);
    range.insertNode(textNode);

    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);
    return true;
}

function handleTransformation(mode, language, acronyms = []) {
    // Update global acronym set
    acronymSet = new Set(acronyms.map(a => a.toUpperCase()));

    const selection = window.getSelection();
    const selectedText = selection.toString();

    if (!selectedText || selectedText.trim().length === 0) {
        console.log("[Case Switcher] No text selected");
        return;
    }

    const { result, truncated, error } = transform(selectedText, mode, language);
    if (error) {
        console.error("[Case Switcher]", error);
        return;
    }

    const activeElement = document.activeElement;
    let feedbackElement = activeElement;
    let success = false;

    if (activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA")) {
        success = replaceInputText(activeElement, result);
    } else if (activeElement && activeElement.isContentEditable) {
        success = replaceContentEditableText(selection, result);
    } else {
        const editableParent = selection.anchorNode?.parentElement?.closest("[contenteditable='true']");
        if (editableParent) {
            success = replaceContentEditableText(selection, result);
            feedbackElement = editableParent;
        } else {
            console.log("[Case Switcher] Selected text is not in an editable field");
            return;
        }
    }

    if (success) {
        showFeedback(feedbackElement, truncated ? "warning" : "success");
        console.log(`[Case Switcher] Transformed to ${mode}${truncated ? " (truncated)" : ""}`);
    }
}

const debouncedTransformation = debounce(handleTransformation, 300);

// ============================================================================
// MESSAGE LISTENER
// ============================================================================

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "transform") {
        debouncedTransformation(message.mode, message.language, message.acronyms || []);
        sendResponse({ success: true });
        return true;
    }
    return false;
});

console.log("[Case Switcher] Content script loaded");
