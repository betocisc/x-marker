# x-marker

So simple client-side markdown parser which parses MD text into HTML elements. It's written in JS.

## How to use it

It's a js file, so you can include it in your HTML files. Functions are documented in that file. A little example is in demo directory.

# Supported MD features

## Headings

`# Heading content` creates a heading level 1. Heading level is indicated by the number of `#` at the begin of the line.

To define heading's id use `{#heading-id}` in the same line.

## Unordered and ordered lists

`+`, `-` and `*` can be used to define unordered elements. A number followed by `.` can be used to define ordered elements.

The first element of the list defines the list's type, so you can mix unordered and ordered elements but the way they're rendered is determined by the first one.

## Blockquotes

Starts with `>>` and finishes in an empty line.

## Code

Lines starting with tab or 4 spaces are parsed into code elements.

## Horizontal rules

Three consecutive `-`, `_` or `*` at the beginning of the line generates a horizontal rule (hr, separators).

## Paragraphs

Text plain lines are parsed as paragraph elements (p).

## Bold

Text between `**` or `__` is parsed as bolds. It must be in the same line

## Italics

Text between `*` or `_` is parsed as italics. It must be in the same line.

## Strikethrough

Text between `-` is parsed as strikethrough text. It must be in the same line.

## Link

To insert links use this structure: `[Link](url)`

## Images

To insert images use this structure: `![Img's footer](Image url)`. It must be in the same line.

## Inline code

Text between ``` is parsed as code. It must be in the same line.

## Breaklines

Two consecutives spaces creates a breakline.
