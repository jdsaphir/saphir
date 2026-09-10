"""Local preview server that emulates the .htaccess clean-URL rules.

Only used for checking the site locally; it is not part of the deployed site.
Run: python .claude/serve.py [port]
"""
import http.server
import os
import posixpath
import socketserver
import sys
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def send_head(self):
        parts = urllib.parse.urlsplit(self.path)
        path = urllib.parse.unquote(parts.path)

        # /page.html -> /page   and   /index(.html) -> /
        stem = posixpath.basename(path)
        if stem in ('index.html', 'index'):
            return self._redirect('/', parts)
        if path.endswith('.html'):
            return self._redirect(path[: -len('.html')], parts)

        # /page/ -> /page (when not a real directory)
        if len(path) > 1 and path.endswith('/'):
            if not os.path.isdir(os.path.join(ROOT, path.strip('/'))):
                return self._redirect(path.rstrip('/'), parts)

        # /page -> page.html (internal rewrite)
        candidate = os.path.join(ROOT, path.lstrip('/') + '.html')
        if os.path.isfile(candidate):
            self.path = urllib.parse.urlunsplit(
                ('', '', path + '.html', parts.query, '')
            )
        return super().send_head()

    def _redirect(self, new_path, parts):
        target = urllib.parse.urlunsplit(('', '', new_path, parts.query, ''))
        self.send_response(301)
        self.send_header('Location', target)
        self.send_header('Content-Length', '0')
        self.end_headers()
        return None


class Server(socketserver.TCPServer):
    allow_reuse_address = True


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    with Server(('127.0.0.1', port), CleanURLHandler) as httpd:
        print('serving %s at http://127.0.0.1:%d' % (ROOT, port))
        httpd.serve_forever()
