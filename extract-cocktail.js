import * as cheerio from 'cheerio';

async function scrapeIBACocktail(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);

        const title = $('.elementor-heading-title').first().text().trim() || $('h1').first().text().trim();

        const categoryElement = $('.taxonomy.cocktail-category span[property="name"]');
        let category = categoryElement.text().trim() || null;

        // Find the main content container that contains Ingredients, Method, and Garnish
        let ingredients = [];
        let method = '';
        let garnish = '';

        // Find the specific container with ingredients, method, and garnish
        // Based on the HTML structure, look for h4 elements with these titles
        const ingredientsHeader = $('h4:contains("Ingredients")');
        const methodHeader = $('h4:contains("Method")');
        const garnishHeader = $('h4:contains("Garnish")');

        if (ingredientsHeader.length > 0) {
            // Extract ingredients - find the next elementor element with shortcode content
            const ingredientsContent = ingredientsHeader.closest('.elementor-element').next('.elementor-element').find('.elementor-shortcode ul li');
            ingredientsContent.each((_, element) => {
                const text = $(element).text().trim();
                if (text) {
                    ingredients.push(text);
                }
            });
        }

        if (methodHeader.length > 0) {
            // Extract method
            const methodSteps = [];
            const methodContent = methodHeader.closest('.elementor-element').next('.elementor-element').find('.elementor-shortcode p');
            methodContent.each((_, element) => {
                const text = $(element).text().trim();
                if (text) {
                    methodSteps.push(text);
                }
            });
            method = methodSteps.join(' ');
        }

        if (garnishHeader.length > 0) {
            // Extract garnish
            const garnishContent = garnishHeader.closest('.elementor-element').next('.elementor-element').find('.elementor-shortcode p');
            garnish = garnishContent.first().text().trim();
        }


        const imageElement = $('img[src*="cocktail"][src*=".webp"], img[src*="cocktail"][src*=".jpg"], img[src*="cocktail"][src*=".png"]');
        const image = imageElement.attr('src') || '';

        let video = '';
        const videoLink = $('a[href*="youtube.com\/watch"], a[href*="youtu.be"]').attr('href');
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
