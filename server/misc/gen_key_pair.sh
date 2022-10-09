#!/bin/sh
set -ex

# Generate PEM-encoded PKCS#8 private key and PEM-encoded SPKI public key

if command -v openssl; then
  # -algorithm RSA -pkeyopt rsa_keygen_bits:2048
  # ES256: -algorithm EC -pkeyopt ec_paramgen_curve:P-256
  gen_pkcs8() { openssl genpkey -algorithm ed25519; }
  pkcs8_to_spki() { openssl pkey -pubout; }
else
  printf 'No tools known\n' >&2 && exit 1
fi

gen_pkcs8 | tee ./privkey.pem | pkcs8_to_spki >./pubkey.pem
