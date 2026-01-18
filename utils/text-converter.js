/**
 * Case Switcher - Text Converter Utility
 * 
 * Full Unicode support with advanced text intelligence.
 * 
 * @module text-converter
 * @license MIT
 */

"use strict";

const MAX_TEXT_LENGTH = 102400;

// ============================================================================
// SMALL WORDS BY LANGUAGE (comprehensive)
// ============================================================================

const SMALL_WORDS = {
    en: new Set([
        // Articles
        "a", "an", "the",
        // Conjunctions
        "and", "but", "or", "nor", "for", "yet", "so",
        // Prepositions (short)
        "as", "at", "by", "in", "of", "on", "to", "up", "vs", "via",
        // Others
        "if", "is", "it", "be", "no"
    ]),
    pt: new Set([
        // Artigos
        "a", "o", "as", "os", "um", "uma", "uns", "umas",
        // Preposições
        "a", "ao", "aos", "à", "às", "de", "da", "do", "das", "dos",
        "em", "na", "no", "nas", "nos", "por", "para", "com", "sem",
        "sob", "sobre", "entre", "até", "após", "ante", "contra",
        // Contrações
        "dum", "duma", "num", "numa", "pelo", "pela", "pelos", "pelas",
        // Conjunções
        "e", "ou", "mas", "nem", "que", "se", "pois"
    ]),
    es: new Set([
        // Artículos
        "el", "la", "los", "las", "un", "una", "unos", "unas",
        // Preposiciones
        "a", "al", "de", "del", "en", "con", "sin", "por", "para",
        "entre", "hacia", "hasta", "desde", "sobre", "bajo", "ante",
        // Conjunciones
        "y", "e", "o", "u", "ni", "que", "si", "pero", "mas"
    ]),
    fr: new Set([
        // Articles
        "le", "la", "les", "un", "une", "des", "du", "de", "l",
        // Prépositions
        "à", "au", "aux", "de", "en", "par", "pour", "sur", "sous",
        "avec", "sans", "chez", "entre", "vers",
        // Conjonctions
        "et", "ou", "ni", "mais", "que", "si"
    ]),
    de: new Set([
        // Artikel
        "der", "die", "das", "den", "dem", "des", "ein", "eine", "einer", "einem", "einen",
        // Präpositionen
        "an", "auf", "aus", "bei", "in", "im", "mit", "nach", "von", "vom", "vor",
        "zu", "zur", "zum", "für", "über", "unter", "durch", "gegen", "ohne",
        // Konjunktionen
        "und", "oder", "aber", "denn", "wenn", "als", "ob"
    ]),
    it: new Set([
        // Articoli
        "il", "lo", "la", "i", "gli", "le", "un", "uno", "una",
        // Preposizioni
        "a", "al", "allo", "alla", "ai", "agli", "alle",
        "da", "dal", "dallo", "dalla", "dai", "dagli", "dalle",
        "di", "del", "dello", "della", "dei", "degli", "delle",
        "in", "nel", "nello", "nella", "nei", "negli", "nelle",
        "su", "sul", "sullo", "sulla", "sui", "sugli", "sulle",
        "con", "per", "tra", "fra",
        // Congiunzioni
        "e", "ed", "o", "ma", "che", "se"
    ])
};

// ============================================================================
// ACCENT MAP FOR REMOVAL
// ============================================================================

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

// ============================================================================
// UTILITIES
// ============================================================================

function validateInput(text) {
    if (typeof text !== "string" || text.length === 0) {
        return { valid: false, text: "", truncated: false };
    }
    if (text.length > MAX_TEXT_LENGTH) {
        return { valid: true, text: text.substring(0, MAX_TEXT_LENGTH), truncated: true };
    }
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

/**
 * Normalizes text by converting hyphens/underscores to spaces
 * Used before transformations that expect word-separated input
 */
function normalizeToSpaces(text) {
    return text
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ");
}

// ============================================================================
// TRANSFORMATION FUNCTIONS
// ============================================================================

function toUpperCase(text, language = "en") {
    const { valid, text: sanitized, truncated } = validateInput(text);
    if (!valid) return { result: "", truncated: false };
    const normalized = normalizeToSpaces(sanitized);
    return { result: normalized.toLocaleUpperCase(language), truncated };
}

function toLowerCase(text, language = "en") {
    const { valid, text: sanitized, truncated } = validateInput(text);
    if (!valid) return { result: "", truncated: false };
    const normalized = normalizeToSpaces(sanitized);
    return { result: normalized.toLocaleLowerCase(language), truncated };
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
                result += leadingSpace + capitalizeFirst(content);
            } else {
                result += part;
            }
            capitalizeNext = false;
        } else {
            result += part.toLocaleLowerCase(language);
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
        const lowerWord = word.toLocaleLowerCase(language);

        let transformed;
        if (isFirstWord || afterColon || !smallWords.has(lowerWord)) {
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

    const words = sanitized
        .split(/[^\p{L}\p{N}]+/u)
        .filter(w => w.length > 0);

    if (words.length === 0) return { result: "", truncated };

    const result = words.map((word, index) => {
        const lower = word.toLocaleLowerCase(language);
        if (index === 0) return lower;
        return upperFirst(lower);
    }).join("");

    return { result, truncated };
}

function toKebabCase(text, language = "en") {
    const { valid, text: sanitized, truncated } = validateInput(text);
    if (!valid) return { result: "", truncated: false };

    const processed = sanitized
        .replace(/([\p{Ll}])([\p{Lu}])/gu, "$1-$2");

    const words = processed
        .split(/[^\p{L}\p{N}]+/u)
        .filter(w => w.length > 0)
        .map(w => w.toLocaleLowerCase(language));

    return { result: words.join("-"), truncated };
}

function toSnakeCase(text, language = "en") {
    const { valid, text: sanitized, truncated } = validateInput(text);
    if (!valid) return { result: "", truncated: false };

    const processed = sanitized
        .replace(/([\p{Ll}])([\p{Lu}])/gu, "$1_$2");

    const words = processed
        .split(/[^\p{L}\p{N}]+/u)
        .filter(w => w.length > 0)
        .map(w => w.toLocaleLowerCase(language));

    return { result: words.join("_"), truncated };
}

function trimSpaces(text, _language = "en") {
    const { valid, text: sanitized, truncated } = validateInput(text);
    if (!valid) return { result: "", truncated: false };

    const result = sanitized
        .replace(/[\t\r\n]+/g, " ")
        .replace(/ {2,}/g, " ")
        .replace(/^\s+|\s+$/g, "");

    return { result, truncated };
}

function removeAccents(text, _language = "en") {
    const { valid, text: sanitized, truncated } = validateInput(text);
    if (!valid) return { result: "", truncated: false };

    let result = "";
    for (const char of sanitized) {
        result += ACCENT_MAP[char] || char;
    }

    return { result, truncated };
}

function toSlug(text, language = "en") {
    const { valid, text: sanitized, truncated } = validateInput(text);
    if (!valid) return { result: "", truncated: false };

    // Remove accents
    let result = "";
    for (const char of sanitized) {
        result += ACCENT_MAP[char] || char;
    }

    // Convert to lowercase kebab
    result = result
        .toLocaleLowerCase(language)
        .replace(/[^\p{L}\p{N}\s-]/gu, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

    return { result, truncated };
}

// ============================================================================
// MAIN DISPATCHER
// ============================================================================

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
    if (!transformer) {
        return { result: text, truncated: false, error: `Unknown mode: ${mode}` };
    }

    try {
        return transformer(text, language);
    } catch (error) {
        console.error("[Case Switcher] Transform error:", error);
        return { result: text, truncated: false, error: error.message };
    }
}

// Export
if (typeof globalThis !== "undefined") {
    globalThis.CaseSwitcher = {
        transform,
        toUpperCase,
        toLowerCase,
        capitalize,
        toTitleCase,
        toCamelCase,
        toKebabCase,
        toSnakeCase,
        trimSpaces,
        removeAccents,
        toSlug,
        MAX_TEXT_LENGTH,
        SMALL_WORDS,
        ACCENT_MAP
    };
}
