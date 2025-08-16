# IBA Cocktails List

A comprehensive Node.js toolkit for scraping and managing cocktail data from the International Bartenders Association (IBA) World website. This project provides tools to extract complete cocktail information including recipes, images, and preparation methods from the official IBA catalog.

## Features

### 🍸 Complete Cocktail Database
- **all official IBA cocktails** scraped and stored in JSON format
- Extracts complete cocktail data: title, category, ingredients, method, garnish, images, and videos
- Includes all IBA categories: The Unforgettables, Contemporary Classics, and New Era Drinks

### 🔧 Multiple Scraping Tools
- **Individual cocktail scraper** (`extract-cocktail.js`) - Extract single cocktail data
- **Link discovery** (`get-cocktail-links.js`) - Find all cocktail URLs from IBA website
- **Bulk scraper** (`scrape-all.js`) - Complete database generation with smart deduplication
- **Incremental updates** - Only scrapes new cocktails, preserves existing data

### 🚀 Technical Features
- DOM manipulation with Cheerio
- ES modules support
- Respectful scraping with delays
- Error handling and recovery
- Command line and module interfaces

## Installation

```bash
pnpm install
```

## Usage

### Quick Start - Get All Cocktails

```bash
# Generate complete cocktails database
node scrape-all.js
```

This creates `cocktails.json` with all IBA cocktails and metadata.

### Individual Cocktail Extraction

```bash
# Extract specific cocktail
node extract-cocktail.js https://iba-world.com/iba-cocktail/dry-martini/
```

### Find All Cocktail URLs

```bash
# Discover all cocktail links
node get-cocktail-links.js
```

### As ES Modules

```javascript
import { scrapeAllCocktails } from './scrape-all.js';
import { scrapeIBACocktail } from './extract-cocktail.js';
import { scrapeCocktailLinks } from './get-cocktail-links.js';

// Get complete database
const database = await scrapeAllCocktails();

// Extract single cocktail
const cocktail = await scrapeIBACocktail('https://iba-world.com/iba-cocktail/dry-martini/');

// Find all URLs
const urls = await scrapeCocktailLinks();
```

## Data Structure

### Individual Cocktail Format

```json
{
  "title": "Dry Martini",
  "category": "The Unforgettables",
  "ingredients": [
    "60 ml Gin",
    "10 ml Dry Vermouth"
  ],
  "method": "Pour all ingredients into mixing glass with ice cubes. Stir well. Strain into chilled martini cocktail glass.",
  "garnish": "Squeeze oil from lemon peel onto the drink, or garnish with a green olives if requested.",
  "image": "https://iba-world.com/wp-content/uploads/2024/07/iba-cocktail-the-unforgettables-dry-martini-6694910fb500c.webp",
  "video": "https://www.youtube.com/channel/UC15DUP0ALL_owc96pB9CN2g",
  "url": "https://iba-world.com/iba-cocktail/dry-martini/"
}
```

### Complete Database Format (`cocktails.json`)

```json
{
  "metadata": {
    "totalCocktails": 102,
    "scrapedAt": "2025-08-16T13:37:18.576Z"
  },
  "cocktails": [
    // Array of cocktail objects...
  ]
}
```

## Project Structure

```
iba-cocktails-list/
├── extract-cocktail.js    # Single cocktail extraction
├── get-cocktail-links.js  # URL discovery from IBA website
├── scrape-all.js         # Complete database generation
├── cocktails.json        # Generated database (102 cocktails)
├── package.json          # Dependencies and configuration
└── README.md            # This file
```

## IBA Cocktail Categories

The scraper extracts cocktails from all official IBA categories:

- **The Unforgettables** - Classic cocktails that defined mixology
- **Contemporary Classics** - Modern standards from recent decades
- **New Era Drinks** - Latest additions to the official list

## Dependencies

- `cheerio`: HTML parsing and DOM manipulation

## Requirements

- Node.js 18+ (for native fetch support)
- ES modules support (`"type": "module"` in package.json)
- Internet connection for scraping

## Data Source

All cocktail data is sourced from the official [IBA World](https://iba-world.com) website, specifically from URLs matching:
```
https://iba-world.com/iba-cocktail/[cocktail-name]/
```

## Smart Features

- **Incremental Updates**: Re-running `scrape-all.js` only fetches new cocktails
- **Deduplication**: Prevents duplicate entries in the database
- **Error Recovery**: Continues scraping if individual cocktails fail
- **Rate Limiting**: 1-second delays between requests to be respectful
