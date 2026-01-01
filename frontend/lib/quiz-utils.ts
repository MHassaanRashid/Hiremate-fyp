export interface ParsedQuestion {
    narrative: string;
    code: string | null;
    language: string | null;
}

export function parseQuestionContent(text: string): ParsedQuestion {
    if (!text) {
        return { narrative: "", code: null, language: null };
    }

    // 1. Try Triple Backticks (Block Code) - capturing multiple blocks
    // Regex: ```language? ... content ... ```
    const blockRegex = /```(\w+)?\s*([\s\S]*?)```/g;
    let match;
    let narrative = text;
    const codeBlocks: string[] = [];
    let language = null;

    // Use a loop to find all block matches
    while ((match = blockRegex.exec(text)) !== null) {
        if (!language) language = match[1]; // Capture language from the first block
        codeBlocks.push(match[2].trim());
        // Remove the block from narrative
        narrative = narrative.replace(match[0], "").trim();
    }

    if (codeBlocks.length > 0) {
        return {
            narrative: narrative.replace(/\n{3,}/g, "\n\n").trim(),
            code: codeBlocks.join("\n\n"),
            language: language || 'text'
        };
    }

    // 2. Try Single Backticks (Inline Code)
    // Only if no blocks found. Captures `code`
    const inlineRegex = /`([^`]+)`/g;
    const inlineMatches = [...text.matchAll(inlineRegex)];

    if (inlineMatches.length > 0) {
        // Heuristic: If it looks like a significant code snippet (e.g. detailed class defs), extract it.
        // If it's just "Press `Enter`", keep it in text?
        // User request implies extracting definitions like `class A: pass`.
        // We will extract all of them.

        const codeParts = inlineMatches.map(m => m[1]);
        const extractedCode = codeParts.join("\n");

        // For narrative, we remove the code blocks. 
        // NOTE: This can leave disjointed text like "Consider , ."
        // We attempt a simple cleanup of punctuation.
        inlineMatches.forEach(m => {
            narrative = narrative.replace(m[0], "").trim();
        });

        // Cleanup multiple commas/spaces left behind
        narrative = narrative
            .replace(/,\s*,/g, ",")
            .replace(/,\s*\./g, ".")
            .replace(/\s{2,}/g, " ")
            .trim();

        return {
            narrative,
            code: extractedCode,
            language: 'python' // Default to python/text for these types of questions
        };
    }

    return {
        narrative: text,
        code: null,
        language: null
    };
}
