import { scrapeCocktailLinks } from './get-cocktail-links.js';
import { scrapeIBACocktail } from './extract-cocktail.js';
import { writeFileSync } from 'fs';

async function scrapeAllCocktails() {
    try {
        console.log('🍸 Starting comprehensive IBA cocktails scraper...\n');
        
        // Step 1: Get all cocktail links
        console.log('📋 Collecting all cocktail links...');
        const cocktailLinks = await scrapeCocktailLinks();
        
        if (!cocktailLinks || cocktailLinks.length === 0) {
            console.error('❌ No cocktail links found. Exiting.');
            return;
        }
        
        console.log(`✅ Found ${cocktailLinks.length} cocktail links\n`);
        
        // Step 2: Extract details for each cocktail
        console.log('🔍 Extracting cocktail details...');
        const cocktails = [];
        const errors = [];
        
        for (let i = 0; i < cocktailLinks.length; i++) {
            const url = cocktailLinks[i];
            const progress = `${i + 1}/${cocktailLinks.length}`;
            
            try {
                console.log(`[${progress}] Processing: ${url}`);
                
                const cocktailData = await scrapeIBACocktail(url);
                
                if (cocktailData && cocktailData.title) {
                    // Add the IBA URL to the cocktail data
                    const cocktailWithUrl = {
                        ...cocktailData,
                        ibaUrl: url
                    };
                    
                    cocktails.push(cocktailWithUrl);
                    console.log(`✅ [${progress}] Successfully extracted: ${cocktailData.title}`);
                } else {
                    console.log(`⚠️  [${progress}] No data extracted for: ${url}`);
                    errors.push({ url, error: 'No data extracted' });
                }
                
                // Small delay to be respectful to the server
                if (i < cocktailLinks.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                
            } catch (error) {
                console.error(`❌ [${progress}] Error extracting ${url}:`, error.message);
                errors.push({ url, error: error.message });
            }
        }
        
        // Step 3: Save results to JSON file
        console.log('\n💾 Saving cocktails to file...');
        
        const output = {
            metadata: {
                totalCocktails: cocktails.length,
                totalErrors: errors.length,
                scrapedAt: new Date().toISOString(),
                source: 'IBA World Cocktails (https://iba-world.com)'
            },
            cocktails: cocktails,
            errors: errors
        };
        
        writeFileSync('cocktails.json', JSON.stringify(output, null, 2), 'utf8');
        
        // Summary
        console.log('\n🎉 Scraping completed!');
        console.log(`✅ Successfully scraped: ${cocktails.length} cocktails`);
        console.log(`❌ Failed to scrape: ${errors.length} cocktails`);
        console.log(`📄 Results saved to: cocktails.json`);
        
        if (errors.length > 0) {
            console.log('\n⚠️  Errors encountered:');
            errors.forEach(({ url, error }) => {
                console.log(`   - ${url}: ${error}`);
            });
        }
        
        return output;
        
    } catch (error) {
        console.error('💥 Fatal error in comprehensive scraper:', error);
        throw error;
    }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    scrapeAllCocktails().catch(error => {
        console.error('Error running comprehensive scraper:', error);
        process.exit(1);
    });
}

export { scrapeAllCocktails };