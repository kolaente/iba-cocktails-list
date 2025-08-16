import { scrapeCocktailLinks } from './get-cocktail-links.js';
import { scrapeIBACocktail } from './extract-cocktail.js';
import { writeFileSync, readFileSync, existsSync } from 'fs';

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
        
        // Step 2: Check existing cocktails and filter out already scraped ones
        console.log('📋 Checking existing cocktails...');
        let existingCocktails = [];
        let existingUrls = new Set();
        
        if (existsSync('cocktails.json')) {
            try {
                const existingData = JSON.parse(readFileSync('cocktails.json', 'utf8'));
                existingCocktails = existingData.cocktails || [];
                existingUrls = new Set(existingCocktails.map(cocktail => cocktail.url));
                console.log(`📄 Found existing file with ${existingCocktails.length} cocktails`);
            } catch (error) {
                console.log('⚠️  Could not read existing cocktails.json, starting fresh');
            }
        } else {
            console.log('📄 No existing cocktails.json found, starting fresh');
        }
        
        // Filter out already scraped URLs
        const newUrls = cocktailLinks.filter(url => !existingUrls.has(url));
        console.log(`🔍 Found ${newUrls.length} new cocktails to scrape (${cocktailLinks.length - newUrls.length} already exist)\n`);
        
        if (newUrls.length === 0) {
            console.log('✅ All cocktails are already scraped! Nothing to do.');
            return { 
                metadata: { 
                    totalCocktails: existingCocktails.length, 
                    totalNew: 0,
                    scrapedAt: new Date().toISOString() 
                }, 
                cocktails: existingCocktails 
            };
        }
        
        // Step 3: Extract details for new cocktails only
        console.log('🔍 Extracting new cocktail details...');
        const cocktails = [];
        const errors = [];
        
        for (let i = 0; i < newUrls.length; i++) {
            const url = newUrls[i];
            const progress = `${i + 1}/${newUrls.length}`;
            
            try {
                console.log(`[${progress}] Processing: ${url}`);
                
                const cocktailData = await scrapeIBACocktail(url);
                
                if (cocktailData && cocktailData.title) {
                    // Add the IBA URL to the cocktail data
                    const cocktailWithUrl = {
                        ...cocktailData,
                        url,
                    };
                    
                    cocktails.push(cocktailWithUrl);
                    console.log(`✅ [${progress}] Successfully extracted: ${cocktailData.title}`);
                } else {
                    console.log(`⚠️  [${progress}] No data extracted for: ${url}`);
                    errors.push({ url, error: 'No data extracted' });
                }
                
                // Small delay to be respectful to the server
                if (i < newUrls.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                
            } catch (error) {
                console.error(`❌ [${progress}] Error extracting ${url}:`, error.message);
                errors.push({ url, error: error.message });
            }
        }
        
        // Step 4: Merge new cocktails with existing ones and save
        console.log('\n💾 Merging and saving cocktails to file...');
        
        const allCocktails = [...existingCocktails, ...cocktails];
        
        const output = {
            metadata: {
                totalCocktails: allCocktails.length,
                totalNew: cocktails.length,
                totalErrors: errors.length,
                scrapedAt: new Date().toISOString(),
            },
            cocktails: allCocktails,
        };
        
        writeFileSync('cocktails.json', JSON.stringify(output, null, 2), 'utf8');
        
        // Summary
        console.log('\n🎉 Scraping completed!');
        console.log(`✅ Successfully scraped: ${cocktails.length} new cocktails`);
        console.log(`📊 Total cocktails in database: ${allCocktails.length}`);
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