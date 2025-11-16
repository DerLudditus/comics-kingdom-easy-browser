#!/usr/bin/env python3
"""
Simple proxy server for Comics Kingdom Easy Browser
This bypasses CORS restrictions by fetching comics server-side.

Usage:
    python3 proxy-server.py

Then open index.html and it will use this proxy automatically.
"""

from http.server import HTTPServer, SimpleHTTPRequestHandler
import urllib.request
import urllib.parse
import json
import re

def extract_comic_image(html):
    """Extract comic image URL from GoComics HTML - matches desktop app logic."""
    
    # Primary method: Look for meta og:image (same as desktop app)
    pattern = r'<meta[^>]*property=["\']og:image["\'][^>]*content=["\']([^"\']+)["\']'
    match = re.search(pattern, html)
    if match:
        return match.group(1)
    
    # Alternative pattern (content before property)
    pattern2 = r'<meta[^>]*content=["\']([^"\']+)["\'][^>]*property=["\']og:image["\']'
    match = re.search(pattern2, html)
    if match:
        return match.group(1)
    
    return None

def extract_comic_date(html, requested_url):
    """Extract the actual date of the comic from the page."""
    # Try to extract from the canonical URL or og:url
    pattern = r'<link[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']+)["\']'
    match = re.search(pattern, html)
    if match:
        url = match.group(1)
        # Extract date from URL like: .../comic-name/2024-10-30
        date_match = re.search(r'/(\d{4})-(\d{2})-(\d{2})', url)
        if date_match:
            return f"{date_match.group(1)}-{date_match.group(2)}-{date_match.group(3)}"
    
    # Fallback: extract from requested URL
    date_match = re.search(r'/(\d{4})-(\d{2})-(\d{2})', requested_url)
    if date_match:
        return f"{date_match.group(1)}-{date_match.group(2)}-{date_match.group(3)}"
    
    return None

class ProxyHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/fetch-comic?'):
            self.handle_fetch_comic()
        else:
            # Serve static files
            super().do_GET()
    
    def handle_fetch_comic(self):
        try:
            # Parse query parameters
            query = urllib.parse.urlparse(self.path).query
            params = urllib.parse.parse_qs(query)
            url = params.get('url', [None])[0]
            
            if not url:
                self.send_error(400, 'Missing url parameter')
                return
            
            # Fetch the page with proper headers
            req = urllib.request.Request(url)
            req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36')
            req.add_header('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
            req.add_header('Accept-Language', 'en-US,en;q=0.5')
            req.add_header('Connection', 'keep-alive')
            
            with urllib.request.urlopen(req) as response:
                html = response.read().decode('utf-8')
            
            # Debug: Save HTML to file for inspection
            print(f"Fetching: {url}")
            
            # Check if this is a 404 page (Comics Kingdom returns 200 status with 404 content)
            # Be very specific to avoid false positives
            if "404" in html and ("not found" in html.lower() or "page not found" in html.lower()):
                print(f"Comic not available (404 page detected)")
                self.send_response(404)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                response_data = {
                    'success': False,
                    'error': 'Comic not available for this date'
                }
                self.wfile.write(json.dumps(response_data).encode())
                return
            
            # Extract comic image URL and actual date
            img_url = extract_comic_image(html)
            comic_date = extract_comic_date(html, url)
            
            print(f"Extracted image URL: {img_url}")
            print(f"Extracted comic date: {comic_date}")
            
            if img_url:
                # Make URL absolute
                img_url = img_url
                if img_url.startswith('//'):
                    img_url = 'https:' + img_url
                elif img_url.startswith('/'):
                    img_url = 'https://www.gocomics.com' + img_url
                
                # Return JSON response
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                response_data = {
                    'success': True,
                    'imageUrl': img_url,
                    'comicDate': comic_date
                }
                self.wfile.write(json.dumps(response_data).encode())
            else:
                self.send_response(404)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                response_data = {
                    'success': False,
                    'error': 'Comic image not found'
                }
                self.wfile.write(json.dumps(response_data).encode())
                
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response_data = {
                'success': False,
                'error': str(e)
            }
            self.wfile.write(json.dumps(response_data).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def run_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, ProxyHandler)
    print(f'Starting proxy server on http://localhost:{port}')
    print(f'Open http://localhost:{port}/index.html in your browser')
    print('Press Ctrl+C to stop')
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()
