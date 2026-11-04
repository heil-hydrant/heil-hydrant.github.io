+++
title = "Minimal Black Theme Guide for Zola"
date = 2026-01-15
description = "How to configure and use the Zola port of Hugo Minimal Black, including Tera v2 components, dark mode, and search."

[taxonomies]
tags = ["zola", "theme", "minimal-black", "guide"]
categories = ["documentation"]

[extra]
mermaid = true
+++

## Overview

**Minimal Black** is a dark-mode-first theme featuring a true `#000000` background, subtle zinc borders, and purple (`#c084fc` / `#a855f7`) accents.

## Figure Component

{{ <figure src="/favicon.svg" style="width: 64px;" position="center" caption_position="center" caption="**Minimal Black Logo**" caption_style="font-style: bold;" /> }}

## GitHub-Style Alerts

{% <alert type="note"> %}
This is a **note** alert box styled with `.md-alert` and `.md-alert-note`.
{% </alert> %}

{% <alert type="tip"> %}
Press `Ctrl+K` (or `Cmd+K`) anywhere on the site to open the instant search modal.
{% </alert> %}

## GitHub Repository Card

{{ <github repo="getzola/zola" description="A fast static site generator in a single binary with everything built-in." /> }}

## Mermaid Diagrams

{% <mermaid> %}
graph LR
  A[Hugo Minimal Black] -->|Ported to| B[Zola Tera v2 Templates]
  B --> C[Fast Static Site]
{% </mermaid> %}
