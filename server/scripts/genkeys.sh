#!/bin/sh

set -e

if ! command -v dotenv; then
  printf 'Missing "dotenv". Please run "npm install"\n' >&2 && exit 1
fi

if [ "$(dotenv -p PRIVATE_KEY)" ] && [ "$(dotenv -p PUBLIC_KEY)" ]; then
  printf 'Public and private keys are already defined. Exiting...\n' >&2 && exit 0
fi

# Generate PEM-encoded PKCS#8 private key and PEM-encoded SPKI public key

if command -v openssl; then
  # -algorithm RSA -pkeyopt rsa_keygen_bits:2048
  # ES256: -algorithm EC -pkeyopt ec_paramgen_curve:P-256
  gen_pkcs8() { openssl genpkey -algorithm ed25519; }
  pkcs8_to_spki() { openssl pkey -pubout; }
else
  printf 'No tools known\n' >&2 && exit 1
fi

private_key=$(gen_pkcs8)
public_key=$(echo "${private_key}" | pkcs8_to_spki)

echo "PRIVATE_KEY=\"${private_key}\"" >> .env
echo "PUBLIC_KEY=\"${public_key}\"" >> .env
