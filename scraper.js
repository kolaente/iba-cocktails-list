import * as cheerio from 'cheerio';

async function scrapeIBACocktail(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);

        const title = $('.elementor-heading-title').first().text().trim() || $('h1').first().text().trim();
        
        const categoryElement = $('span.taxonomy.cocktail-category span[property="name"]');
        const category = categoryElement.text().trim() || 'The Unforgettables';

        const ingredients = [];
        // Try to find ingredients in specific content areas, avoiding navigation
        $('.entry-content li, .elementor-text-editor li, main li').each((_, element) => {
            const text = $(element).text().trim();
            const $element = $(element);
            // Skip if it's part of navigation or contains multiple newlines (likely menu items)
            if (text && !text.includes('\n\n') && !$element.closest('nav').length && 
                !$element.closest('.menu').length && !$element.closest('header').length) {
                ingredients.push(text);
            }
        });

        const methodSteps = [];
        // First try to find method in paragraphs (often quoted)
        $('p').each((_, element) => {
            const text = $(element).text().trim();
            if (text && text.length > 20 && 
                (text.includes('Pour') || text.includes('Stir') || text.includes('Strain') || 
                 text.includes('Mix') || text.includes('Shake') || text.includes('Add') ||
                 text.includes('glass') || text.includes('ice') || text.includes('cocktail shaker'))) {
                methodSteps.push(text.replace(/^["']|["']$/g, ''));
            }
        });
        // If no method found in paragraphs, try list items
        if (methodSteps.length === 0) {
            $('li').each((_, element) => {
                const text = $(element).text().trim();
                if (text && !text.includes('ml') && !text.includes('cl') && !text.includes('oz') && 
                    !text.includes('Tablespoon') && !text.includes('Teaspoon') &&
                    text.length > 20 && (text.includes('Pour') || text.includes('Stir') || 
                    text.includes('Strain') || text.includes('Mix') || text.includes('Shake') ||
                    text.includes('glass') || text.includes('ice'))) {
                    methodSteps.push(text);
                }
            });
        }
        const method = methodSteps.join(' ');

        let garnish = '';
        $('p').each((_, element) => {
            const text = $(element).text().trim();
            if (text && text.toLowerCase().includes('squeeze') && text.toLowerCase().includes('lemon') && text.length < 200) {
                garnish = text;
                return false;
            }
        });

        const imageElement = $('img[src*="cocktail"][src*=".webp"], img[src*="cocktail"][src*=".jpg"], img[src*="cocktail"][src*=".png"]');
        const image = imageElement.attr('src') || '';

        let video = '';
        const videoLink = $('a[href*="youtube.com"], a[href*="youtu.be"]').attr('href');
        if (videoLink) {
            video = videoLink;
        }

        return {
            title,
            category,
            ingredients,
            method,
            garnish,
            image: image ? (image.startsWith('http') ? image : `https://iba-world.com${image}`) : '',
            video
        };

    } catch (error) {
        console.error('Error scraping cocktail:', error);
        return null;
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    const url = process.argv[2];
    if (url && url.startsWith('http')) {
        scrapeIBACocktail(url).then(data => {
            console.log(JSON.stringify(data, null, 2));
        });
    } else {
        console.error('Please provide a valid url starting with http')
    }
}

export { scrapeIBACocktail };
