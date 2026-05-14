# Parallel Text Browser: Rudolph Kühnapfel

A modern, responsive, and synchronized multi-language browser designed for exploring historical scripts.

## [Live Demo](https://majorbriggs.github.io/parallel-text-browser/)

## About this Project

This repository is an experimental showcase of modern AI-driven development workflows. It features the 1841 historical report on the case of **Rudolph Kühnapfel**, presented in its original German alongside Polish and French translations.

### Core Experiments

1.  **Agentic Coding**: The entire application (HTML/CSS/JS architecture, synchronization logic, and mobile responsiveness) was built through a pair-programming session with **Antigravity**, an agentic AI coding assistant.
2.  **Gothic Script Processing (Image-to-Text)**: The original 1841 source material was a German Gothic script (Fraktur) in PDF format. AI vision and OCR capabilities were used to transcribe this complex historical typography into clean Markdown.
3.  **Agentic Translation**: The transcribed German text was translated into Polish and French using **agentic translation techniques**. This ensured that nuanced historical context was preserved while maintaining strict paragraph-level synchronization (`[n]` markers) across all three versions.

## Features

-   **Synchronized Scrolling**: Click any paragraph in one language to automatically scroll and highlight the corresponding section in all visible languages.
-   **Historical Aesthetic**: A monochromatic, serif-based design optimized for long-form reading and manuscript digital preservation.
-   **Mobile-First Design**: Automatically switches to a tabbed interface on smartphones, allowing for seamless language "flipping" while staying on the same paragraph.
-   **Integrated PDF Viewer**: Toggle the original 1841 manuscript PDF side-by-side with the translated text.
-   **Full Synchronization**: Clicking any paragraph not only syncs the translations but also automatically jumps the PDF viewer to the corresponding page in the original document.
-   **Global Search**: Instant search across all languages with synchronized highlighting.
-   **Column Controls**: Toggle specific languages (DE, PL, FR) on and off to customize your comparison view.

## Source Material

The original 1841 report by C. Porsch is included in this repository as [kuhnapfel.pdf](kuhnapfel.pdf).

---
*Created as part of an exploration into Advanced Agentic Coding and AI-assisted digital humanities.*
