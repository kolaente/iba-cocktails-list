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
        $('li').each((_, element) => {
            const text = $(element).text().trim();
            if (text && (text.includes('ml') || text.includes('cl') || text.includes('oz') || 
                        text.includes('dash') || text.includes('drop') || text.includes('part'))) {
                ingredients.push(text);
            }
        });

        const methodSteps = [];
        $('li').each((_, element) => {
            const text = $(element).text().trim();
            if (text && !text.includes('ml') && !text.includes('cl') && !text.includes('oz') && 
                text.length > 20 && (text.includes('Pour') || text.includes('Stir') || 
                text.includes('Strain') || text.includes('Mix') || text.includes('Shake') ||
                text.includes('glass') || text.includes('ice'))) {
                methodSteps.push(text);
            }
        });
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

async function testWithLocalFile() {
    try {
        const fs = await import('fs/promises');
        const html = await fs.readFile('/home/konrad/www/iba-cocktails-list/dry-martini.html', 'utf8');
        
        const cleanedHtml = html.replace(/view-source:/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
        
        const $ = cheerio.load(cleanedHtml);

        const title = $('.elementor-heading-title').first().text().trim() || $('h1').first().text().trim();
        
        const categoryElement = $('span.taxonomy.cocktail-category span[property="name"]');
        const category = categoryElement.text().trim() || 'The Unforgettables';

        const ingredients = [];
        $('li').each((_, element) => {
            const text = $(element).text().trim();
            if (text && (text.includes('ml') || text.includes('cl') || text.includes('oz') || 
                        text.includes('dash') || text.includes('drop') || text.includes('part'))) {
                ingredients.push(text);
            }
        });

        const methodSteps = [];
        $('li').each((_, element) => {
            const text = $(element).text().trim();
            if (text && !text.includes('ml') && !text.includes('cl') && !text.includes('oz') && 
                text.length > 20 && (text.includes('Pour') || text.includes('Stir') || 
                text.includes('Strain') || text.includes('Mix') || text.includes('Shake') ||
                text.includes('glass') || text.includes('ice'))) {
                methodSteps.push(text);
            }
        });
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
        console.error('Error reading local file:', error);
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
        testWithLocalFile().then(data => {
            console.log(JSON.stringify(data, null, 2));
        });
    }
}

export { scrapeIBACocktail };