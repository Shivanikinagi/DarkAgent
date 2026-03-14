export function calculateRisk(simulationResult, transaction) {
  let score = 0.0;
  const flags = [];

  // 1. Unknown Destination Protocol logic
  // Hardcoded Uniswap & Aave routers for hackathon demo
  const knownProtocols = [
      '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD'.toLowerCase(), // Uniswap
      '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9'.toLowerCase()  // Aave
  ];

  if (transaction.to && !knownProtocols.includes(transaction.to.toLowerCase())) {
      score += 0.4;
      flags.push('Unknown destination router');
  }

  // 2. Simulation Failure
  if (!simulationResult || !simulationResult.success) {
      score = 1.0;
      flags.push('Simulation failed on-chain execution');
  }

  // 3. High Gas Usage (Possible Attack Vector)
  if (simulationResult && simulationResult.gasUsed > 500000) {
      score += 0.2;
      flags.push('Unusually high gas consumption');
  }

  // 4. Zero-Value Transfer Anomaly (Token sweeping pattern)
  if (transaction.value === '0' || transaction.value === 0) {
      score += 0.1;
      flags.push('Zero ether value (potential token sweep)');
  }

  const finalScore = Math.min(score, 1.0);

  return {
      score: finalScore,
      flags,
      verdict: finalScore < 0.4 ? 'APPROVED' : (finalScore < 0.7 ? 'CAUTION' : 'BLOCKED'),
      color: finalScore < 0.4 ? 'green' : (finalScore < 0.7 ? 'yellow' : 'red')
  };
}