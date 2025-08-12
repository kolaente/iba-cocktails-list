# IBA Cocktail Scraper

A Node.js script that scrapes cocktail information from IBA World (International Bartenders Association) website.

## Features

- Extracts complete cocktail data including title, category, ingredients, method, garnish, image, and video
- Uses native `fetch()` for HTTP requests
- DOM manipulation with Cheerio
- Works with any IBA cocktail URL
- Supports both ES modules and command line usage

## Installation

```bash
pnpm install
```

## Usage

### Command Line

```bash
# Scrape a specific cocktail
node scraper.js https://iba-world.com/iba-cocktail/dry-martini/

# Test with local HTML file (if available)
node scraper.js
```

### As a Module

```javascript
import { scrapeIBACocktail } from './scraper.js';

const cocktailData = await scrapeIBACocktail('https://iba-world.com/iba-cocktail/dry-martini/');
console.log(cocktailData);
```

## Output Format

The scraper returns a JSON object with the following structure:

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
  "video": "https://www.youtube.com/channel/UC15DUP0ALL_owc96pB9CN2g"
}
```

## Supported URL Format

The scraper works with IBA World cocktail URLs in the format:
```
https://iba-world.com/iba-cocktail/[cocktail-name]/
```

## Dependencies

- `cheerio`: HTML parsing and DOM manipulation

## Requirements

- Node.js 18+ (for native fetch support)
- ES modules support