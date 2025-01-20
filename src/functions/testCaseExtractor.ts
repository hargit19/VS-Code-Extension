import { TestCase } from './types';

export function extractTestCases(content: string): TestCase[] {
    const inputOutputPairs: TestCase[] = [];
    const inputRegex = /Input:\s*([\s\S]*?)\n/g;
    const outputRegex = /Output:\s*([\s\S]*?)\n/g;

    let inputMatch, outputMatch;
    while ((inputMatch = inputRegex.exec(content)) && (outputMatch = outputRegex.exec(content))) {
        const input = cleanInput(inputMatch[1].trim());
        const output = cleanOutput(outputMatch[1].trim());

        inputOutputPairs.push({ input, output });
    }
    return inputOutputPairs;
}

function cleanInput(input: string): string {
    let cleaned = input.replace(/<\/?[^>]+(>|$)/g, '').trim();
    cleaned = cleaned.replace(/&quot;/g, '').trim();
    cleaned = cleaned.replace(/\b\w+\s*=\s*/g, '').trim();

    let result = '';
    const arrayMatch = cleaned.match(/\[(.*?)\]/);
    const remaining = cleaned.replace(/\[.*?\]/, '').trim();

    if (arrayMatch) {
        const arrayElements = arrayMatch[1].split(/[,\s]+/).filter(Boolean);
        const arraySize = arrayElements.length;
        result += `${arraySize}\n${arrayElements.join(' ')}\n`;
    }

    if (remaining) {
        const otherParts = remaining.split(/[\s,]+/).filter(Boolean);
        for (const part of otherParts) {
            if (!isNaN(Number(part))) {
                result += `${part}\n`;
            } else if (part.length === 1) {
                result += `${part}\n`;
            } else {
                result += `${part.length}\n${part}\n`;
            }
        }
    }

    return result.trim();
}

function cleanOutput(output: string): string {
    let cleaned = output.replace(/<\/?[^>]+(>|$)/g, '').trim();
    cleaned = cleaned.replace(/[\[\],]/g, ' ').trim();
    cleaned = cleaned.replace(/&quot;/g, '').trim();
    return cleaned;
}