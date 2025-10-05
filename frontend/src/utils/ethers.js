export async function fetchErc20Balance({ publicClient, tokenAddress, owner }) {
  if (!publicClient || !tokenAddress || !owner) return null;
  try {
    const erc20Abi = [
      { "inputs": [{"name":"","type":"address"}], "name": "balanceOf", "outputs": [{"name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "decimals", "outputs": [{"name":"","type":"uint8"}], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "symbol", "outputs": [{"name":"","type":"string"}], "stateMutability": "view", "type": "function" }
    ];
    const [raw, decimals, symbol] = await Promise.all([
      publicClient.readContract({ address: tokenAddress, abi: erc20Abi, functionName: 'balanceOf', args: [owner] }),
      publicClient.readContract({ address: tokenAddress, abi: erc20Abi, functionName: 'decimals' }),
      publicClient.readContract({ address: tokenAddress, abi: erc20Abi, functionName: 'symbol' }),
    ]);
    const denom = 10n ** BigInt(decimals);
    const whole = raw / denom;
    const frac = raw % denom;
    const formatted = `${whole}${decimals ? '.' + (frac + denom).toString().slice(1).replace(/0+$/,'') : ''}`;
    return { raw, decimals, symbol, formatted };
  } catch {
    return null;
  }
}
