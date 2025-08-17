import * as cheerio from 'cheerio';

async function scrapeCocktailLinks() {
    const allCocktailLinks = [];
    let currentPage = 1;

    console.log('Starting to scrape cocktail links from IBA website...');

    while (true) {
        const pageUrl = `https://iba-world.com/cocktails/all-cocktails/page/${currentPage}/`;
        console.log(`Scraping page ${currentPage}: ${pageUrl}`);

        try {
            const response = await fetch(pageUrl);

            if (response.status === 404) {
                console.log(`Page ${currentPage} returned 404. Stopping scraping.`);
                break;
            }

            if (!response.ok) {
                console.error(`Error fetching page ${currentPage}: ${response.status} ${response.statusText}`);
                break;
            }

            const html = await response.text();
            const $ = cheerio.load(html);

            const cocktailLinks = [];
            $('a[href*="iba-cocktail"]').each((_, element) => {
                const href = $(element).attr('href');
                if (href && href.startsWith('https://iba-world.com/iba-cocktail/')) {
                    cocktailLinks.push(href);
                }
            });

            if (cocktailLinks.length === 0) {
                console.log(`No cocktail links found on page ${currentPage}. Stopping scraping.`);
                break;
            }

            console.log(`Found ${cocktailLinks.length} cocktail links on page ${currentPage}`);
            allCocktailLinks.push(...cocktailLinks);

            currentPage++;

        } catch (error) {
            console.error(`Error scraping page ${currentPage}:`, error);
            break;
        }
    }

    const uniqueLinks = [...new Set(allCocktailLinks)];
    console.log(`\nTotal unique cocktail links found: ${uniqueLinks.length}`);
    console.log('\nAll cocktail links:');
    uniqueLinks.forEach(link => console.log(link));

    return uniqueLinks;
}

if (import.meta.url === `file://${process.argv[1]}`) {
    scrapeCocktailLinks().catch(error => {
        console.error('Error running scraper:', error);
        process.exit(1);
    });
}

export { scrapeCocktailLinks };