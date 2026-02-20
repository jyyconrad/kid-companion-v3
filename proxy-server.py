#!/usr/bin/env python3
import http.server
import socketserver
import urllib.request
import os

class ProxyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        target_url = f"http://localhost:81{self.path}"
        print(f"GET {self.path} -> {target_url}")
        
        try:
            response = urllib.request.urlopen(target_url)
            content = response.read()
            
            self.send_response(response.status)
            for header, value in response.headers.items():
                if header.lower() not in['content-encoding', 'transfer-encoding']:
                    self.send_header(header, value)
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            print(f"Error: {e}")
            self.send_error(502)
            self.end_headers()
            self.wfile.write(b"Proxy Error")

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        target_url = f"http://localhost:81{self.path}"
        print(f"POST {self.path} -> {target_url}")
        
        try:
            req = urllib.request.Request(target_url, data=post_data, method='POST')
            
            # 复制必要的headers
            for header, value in self.headers.items():
                if header.lower() not in ['host', 'content-length']:
                    req.add_header(header, value)
            
            response = urllib.request.urlopen(req)
            content = response.read()
            
            self.send_response(response.status)
            for header, value in response.headers.items():
                if header.lower() not in ['content-encoding', 'transfer-encoding']:
                    self.send_header(header, value)
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            print(f"Error: {e}")
            self.send_error(502)
            self.end_headers()
            self.wfile.write(b"Proxy Error")

def run():
    PORT = 8082
    handler = ProxyHTTPRequestHandler
    
    print(f"=")
    print(f"KidCompanion Web 代理服务器")
    print(f"=")
    print(f"端口: {PORT}")
    print(f"本地: http://localhost:{PORT}/kid-companion/")
    print(f"公网: http://14.103.212.209:{PORT}/kid-companion/")
    print(f"=")
    
    # 允许地址重用
    socketserver.TCPServer.allow_reuse_address = True
    
    with http.server.HTTPServer(("0.0.0.0", PORT), handler) as httpd:
        httpd.serve_forever()

if __name__ == "__main__":
    run()
