#!/usr/bin/env bash
# Regenerates /etc/nginx/conf.d/geo-hu.conf from the free ipdeny.com country
# lists and reloads nginx. Installed on the VPS as /usr/local/bin/update-geo-hu,
# run monthly from /etc/cron.d/update-geo-hu. Keeps the old file if anything fails.
#
# The generated file defines $fw_geo_cookie, which the flintworks.hu server block
# sends as `Set-Cookie: fw_geo=HU|XX`. The frontend reads that cookie to pick
# Hungarian for Hungarian IPs and English for everyone else.
set -euo pipefail

OUT=/etc/nginx/conf.d/geo-hu.conf
TMP=$(mktemp)
trap 'rm -f "$TMP" "$TMP.v4" "$TMP.v6"' EXIT

curl -fsS -m 30 https://www.ipdeny.com/ipblocks/data/aggregated/hu-aggregated.zone >"$TMP.v4"
curl -fsS -m 30 https://www.ipdeny.com/ipv6/ipaddresses/aggregated/hu-aggregated.zone >"$TMP.v6"

# Sanity: only CIDR lines, and a plausible number of them.
grep -Eq '^[0-9.]+/[0-9]+$' "$TMP.v4" && [ "$(wc -l <"$TMP.v4")" -gt 100 ]
[ "$(grep -Evc '^[0-9.]+/[0-9]+$' "$TMP.v4")" -eq 0 ]
[ "$(grep -Evc '^[0-9a-fA-F:]+/[0-9]+$' "$TMP.v6")" -eq 0 ]

{
  echo "# Generated $(date -u +%F) by update-geo-hu.sh - do not edit"
  echo 'geo $fw_geo_hu {'
  echo '    default 0;'
  sed 's|^|    |; s|$| 1;|' "$TMP.v4"
  sed 's|^|    |; s|$| 1;|' "$TMP.v6"
  echo '}'
  echo 'map $fw_geo_hu $fw_geo_cookie {'
  echo '    1       "fw_geo=HU; Path=/; Max-Age=86400; SameSite=Lax";'
  echo '    default "fw_geo=XX; Path=/; Max-Age=86400; SameSite=Lax";'
  echo '}'
} >"$TMP"

[ -f "$OUT" ] && cp "$OUT" "$OUT.prev"
install -m 644 "$TMP" "$OUT"
if nginx -t 2>/dev/null; then
  systemctl reload nginx
  echo "geo-hu updated: $(wc -l <"$TMP.v4") v4 + $(wc -l <"$TMP.v6") v6 ranges"
else
  echo "nginx -t failed, restoring previous geo-hu.conf" >&2
  if [ -f "$OUT.prev" ]; then mv "$OUT.prev" "$OUT"; else rm -f "$OUT"; fi
  exit 1
fi
