package urlfetcher

import (
	"context"
	"crypto/tls"
	"errors"
	"io"
	"net"
	"net/http"
	"net/netip"
	"net/url"
	"time"
)

const (
	MaxDownloadBytes = 10 << 20 // 10MB
	RequestTimeout   = 15 * time.Second
)

var blockedPrefixes = []netip.Prefix{
	netip.MustParsePrefix("127.0.0.0/8"),    // loopback
	netip.MustParsePrefix("10.0.0.0/8"),     // private
	netip.MustParsePrefix("172.16.0.0/12"),  // private
	netip.MustParsePrefix("192.168.0.0/16"), // private
	netip.MustParsePrefix("169.254.0.0/16"), // link-local
	netip.MustParsePrefix("0.0.0.0/8"),      // reserved
	netip.MustParsePrefix("224.0.0.0/4"),    // multicast
	netip.MustParsePrefix("240.0.0.0/4"),    // reserved
	netip.MustParsePrefix("::1/128"),        // IPv6 loopback
	netip.MustParsePrefix("fc00::/7"),       // IPv6 ULA
	netip.MustParsePrefix("fe80::/10"),      // IPv6 link-local
	netip.MustParsePrefix("ff00::/8"),       // IPv6 multicast
}

func isBlocked(addr netip.Addr) bool {
	for _, p := range blockedPrefixes {
		if p.Contains(addr) {
			return true
		}
	}
	return false
}

func validateURL(raw string) (*url.URL, []netip.Addr, error) {
	u, err := url.Parse(raw)
	if err != nil {
		return nil, nil, err
	}
	if u.Scheme != "http" && u.Scheme != "https" {
		return nil, nil, errors.New("only http/https allowed")
	}
	host := u.Hostname()
	if host == "" {
		return nil, nil, errors.New("empty host")
	}

	ips, err := net.DefaultResolver.LookupIP(context.Background(), "ip", host)
	if err != nil {
		return nil, nil, err
	}

	var out []netip.Addr
	for _, ip := range ips {
		if addr, ok := netip.AddrFromSlice(ip); ok && !isBlocked(addr) {
			out = append(out, addr)
		}
	}
	if len(out) == 0 {
		return nil, nil, errors.New("all IPs blocked")
	}
	return u, out, nil
}

func SafeFetchFile(ctx context.Context, rawURL string) ([]byte, string, error) {
	ctx, cancel := context.WithTimeout(ctx, RequestTimeout)
	defer cancel()

	u, ips, err := validateURL(rawURL)
	if err != nil {
		return nil, "", err
	}

	dialer := &net.Dialer{Timeout: 7 * time.Second}
	transport := &http.Transport{
		DisableKeepAlives: true,
		TLSClientConfig:   &tls.Config{ServerName: u.Hostname()},
		DialContext: func(ctx context.Context, network, address string) (net.Conn, error) {
			_, port, _ := net.SplitHostPort(address)
			if port == "" {
				if u.Scheme == "https" {
					port = "443"
				} else {
					port = "80"
				}
			}
			for _, ip := range ips {
				if isBlocked(ip) {
					continue
				}
				return dialer.DialContext(ctx, "tcp", net.JoinHostPort(ip.String(), port))
			}
			return nil, errors.New("no allowed IPs")
		},
	}

	client := &http.Client{Transport: transport}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, "", err
	}

	resp, err := client.Do(req)
	if err != nil {
		return nil, "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, "", errors.New("bad status: " + resp.Status)
	}

	lr := &io.LimitedReader{R: resp.Body, N: MaxDownloadBytes + 1}
	data, err := io.ReadAll(lr)
	if err != nil {
		return nil, "", err
	}
	if len(data) > MaxDownloadBytes {
		return nil, "", errors.New("file too large")
	}

	return data, resp.Header.Get("Content-Type"), nil
}
