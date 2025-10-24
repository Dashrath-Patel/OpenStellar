# Ensure the script exits on any errors
set -e

rm -rf ../frontend/openstellar_module
soroban contract bindings typescript \
	--wasm target/wasm32-unknown-unknown/release/soroban_escrow_smart_contract.wasm \
	--output-dir ../frontend/openstellar_module \
	--contract-id $(cat ../.soroban/contract-id) \
	--rpc-url https://rpc-futurenet.stellar.org \
	--network-passphrase 'Test SDF Future Network ; October 2022'
