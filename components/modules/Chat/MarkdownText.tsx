import React from 'react';
import { Text, TextStyle } from 'react-native';

interface MarkdownTextProps {
    text: string;
    className?: string;
    style?: TextStyle;
}

type TextSegment = {
    text: string;
    bold?: boolean;
    italic?: boolean;
    code?: boolean;
};

export function MarkdownText({ text, className, style }: MarkdownTextProps) {
    const parseMarkdown = (input: string): TextSegment[] => {
        const segments: TextSegment[] = [];
        let remaining = input;

        // Regex patterns for markdown
        const patterns = [
            { regex: /\*\*\*(.+?)\*\*\*/g, type: 'boldItalic' }, // ***text***
            { regex: /\*\*(.+?)\*\*/g, type: 'bold' },           // **text**
            { regex: /\*(.+?)\*/g, type: 'bold' },               // *text*
            { regex: /__(.+?)__/g, type: 'italic' },             // __text__
            { regex: /_(.+?)_/g, type: 'italic' },               // _text_
            { regex: /`(.+?)`/g, type: 'code' },                 // `text`
        ];

        let lastIndex = 0;
        const matches: { start: number; end: number; text: string; type: string }[] = [];

        // Find all matches
        patterns.forEach(({ regex, type }) => {
            const re = new RegExp(regex.source, 'g');
            let match;
            while ((match = re.exec(input)) !== null) {
                matches.push({
                    start: match.index,
                    end: match.index + match[0].length,
                    text: match[1],
                    type,
                });
            }
        });

        // Sort matches by position
        matches.sort((a, b) => a.start - b.start);

        // Filter overlapping matches (keep first match)
        const filteredMatches: any = matches.filter((match, index) => {
            if (index === 0) return true;
            const prevMatch = filteredMatches[filteredMatches.length - 1];
            return match.start >= prevMatch.end;
        });

        // Build segments
        filteredMatches.forEach((match: any) => {
            // Add text before match
            if (match.start > lastIndex) {
                segments.push({ text: input.slice(lastIndex, match.start) });
            }

            // Add formatted text
            if (match.type === 'boldItalic') {
                segments.push({ text: match.text, bold: true, italic: true });
            } else if (match.type === 'bold') {
                segments.push({ text: match.text, bold: true });
            } else if (match.type === 'italic') {
                segments.push({ text: match.text, italic: true });
            } else if (match.type === 'code') {
                segments.push({ text: match.text, code: true });
            }

            lastIndex = match.end;
        });

        // Add remaining text
        if (lastIndex < input.length) {
            segments.push({ text: input.slice(lastIndex) });
        }

        return segments.length > 0 ? segments : [{ text: input }];
    };

    const segments = parseMarkdown(text);

    return (
        <Text className={className} style={style}>
            {segments.map((segment, index) => {
                const textStyle: TextStyle = {};

                if (segment.bold) {
                    textStyle.fontWeight = 'bold';
                }
                if (segment.italic) {
                    textStyle.fontStyle = 'italic';
                }
                if (segment.code) {
                    textStyle.fontFamily = 'poppins';
                    textStyle.backgroundColor = '#f3f4f6';
                    textStyle.paddingHorizontal = 4;
                    textStyle.paddingVertical = 2;
                    textStyle.borderRadius = 4;
                }

                return (
                    <Text key={index} style={textStyle}>
                        {segment.text}
                    </Text>
                );
            })}
        </Text>
    );
}
