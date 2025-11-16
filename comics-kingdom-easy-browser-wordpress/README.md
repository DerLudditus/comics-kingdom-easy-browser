# Comics Kingdom Easy Browser - WordPress Version

A web-based comic strip browser for Comics Kingdom comics designed to run on WordPress sites or any PHP-enabled web server.

## Features

- **20 Comic Strips** from ComicsKingdom.com
- **Grouped by category**: CLASSICS and MODERN
- **Three-panel layout**: Comic list (left), viewer (center), calendar (right)
- **Smart navigation**: Automatically skips days without comics
- **Calendar integration**: Visual date selection (two different calendar types; arrows and Home/End also work)
- **PHP-based proxy**: Works on any PHP server (WordPress, Apache, Nginx, etc.)
- **Automatic scaling for some comics**: Large images are scaled down for better viewing

## Installation on WordPress

### Option 2: Upload to WordPress Root (Recommended)
1. Create a folder in your WordPress root, say `/public_html/comics-kingdom/`
2. Upload all files to this folder
3. Set file permissions (if needed): files: 644, folder: 755
4. Access directly via: `https://yoursite.com/comics-kingdom/`

### Option 3:  WordPress Plugin Folder
1. Upload to something like `/wp-content/plugins/comics-kingdom/`
2. Access directly via URL (no need to activate as plugin)

## Files

- `index.html` - Main HTML page
- `styles.css` - Styling and layout
- `app.js` - Application logic
- `comics-data.js` - Comic definitions
- `fetch-comic.php` - PHP proxy script (handles CORS)
- `.htaccess` - Optional, for Apache, if the defaults are restrictive

## Requirements

- PHP 5.4 or higher
- cURL extension enabled (usually enabled by default)
- Web server (Apache, Nginx, etc.)

## Comic Strips Included

### CLASSICS
1. Beetle Bailey
2. Blondie
3. Crock
4. Dennis The Menace *
5. Hagar The Horrible
6. Hi and Lois
7. Pluggers *
8. Marvin
9. The Family Circus *

### MODERN
10. Bizarro *
11. The Brilliant Mind Of Edison Lee
12. Arctic Circle
13. Carpe Diem
14. Never Been Deader *
15. Dustin
16. Pardon My Planet *
17. Rhymes with Orange
18. Shoe
19. Tina's Groove
20. Zits

**Note**: Comics marked with * are automatically scaled to 50% when their dimensions exceed 1500px width AND 1800px height to improve readability.

## Scaled Comics

The following 6 comics have automatic scaling applied when they are very large:
- **Dennis The Menace**
- **Pluggers**
- **The Family Circus**
- **Bizarro**
- **Never Been Deader**
- **Pardon My Planet**

These comics are scaled to 50% of their original size only when both width > 1500px AND height > 1800px.

**Tip**: Otherwise, whenever the user encounters an image that's excessively high, the following workaround is recommended: unmaximize the browser, then reduce its width until the displayed image scales down.

## Navigation Buttons

- **First**: Go to the comic's earliest available date
- **Previous**: Go to previous available comic (searches up to 31 days back)
- **Next**: Go to next available comic (searches up to 31 days forward)
- **Today**: Go to today's comic
- **Random**: Jump to a random date

### Keyboard Shortcuts
- `←` (Left Arrow): Previous
- `→` (Right Arrow): Next
- `Home`: First
- `End`: Today

### Calendar Navigation
- Click month arrows to navigate months
- Click year buttons to jump years
- Use dropdowns to select exact date (Year, Month, Day)

## How It Works

The PHP proxy (`fetch-comic.php`) fetches comics from ComicsKingdom.com server-side, bypassing browser CORS restrictions. This is necessary because browsers block direct requests to external sites.

## Troubleshooting

### Comics not loading
- Check that PHP cURL extension is enabled: Create a file `test.php` with `<?php phpinfo(); ?>` and look for "cURL support: enabled" in the output
- Verify `fetch-comic.php` has proper permissions (644 or 755)
- Check server error logs for PHP errors

### 403 or 404 errors
- Ensure all files are uploaded correctly
- Check file permissions (should be 644)
- Verify the path to `fetch-comic.php` is correct

### Styling issues
- Clear browser cache
- Check that `styles.css` is loading correctly
- Verify Google Fonts can load (check Content Security Policy)

## Security Notes

- The PHP proxy only accepts URLs from comicskingdom.com
- CORS headers are set to allow cross-origin requests
- No user data is stored or transmitted

## License

This project is licensed under the MIT License.

This is a personal project for browsing publicly available comics from ComicsKingdom.com. All comic strips are property of their respective creators and copyright holders.
