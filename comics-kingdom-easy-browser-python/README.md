# Comics Kingdom Easy Browser - Python Version

A web-based comic strip browser for Comics Kingdom comics with Python proxy server.

## Features

- **20 Comic Strips** from ComicsKingdom.com
- **Grouped by category**: CLASSICS and MODERN
- **Three-panel layout**: Comic list (left), viewer (center), calendar (right)
- **Smart navigation**: Automatically skips days without comics
- **Calendar integration**: Visual date selection (two different calendar types; arrows and Home/End also work)
- **Automatic scaling for some comics**: Large images are scaled down for better viewing
- **No installation required**: Just open the HTML file in a browser (a local proxy server must run!)

## Prerequisites

Python 3 must be installed.

## Quick Start

**Linux/Mac:**

```bash
./start.sh
```

Or manually:
```bash
python3 proxy-server.py
```

**Windows:**
```
start.bat
```

Then open your browser to: `http://localhost:8000/index.html`

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
13. Carpe Diem *
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
- **Carpe Diem**
- **Never Been Deader**
- **Pardon My Planet**

These comics are scaled to 50% of their original size only when both width > 1500px AND height > 1800px.

**Tip**: Otherwise, whenever the user encounters an image that's excessively high, the following workaround is recommended: unmaximize the browser, then reduce its width until the displayed image scales down.

## Navigation

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

The Python proxy server fetches comics from ComicsKingdom.com server-side, bypassing browser CORS restrictions. The proxy extracts the comic image URL and date from the page, then returns it to the frontend.

## License

This project is licensed under the MIT License.

This is a personal project for browsing publicly available comics from ComicsKingdom.com. All comic strips are property of their respective creators and copyright holders.

