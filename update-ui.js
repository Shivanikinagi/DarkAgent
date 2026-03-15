const fs = require('fs');
let content = fs.readFileSync('frontend/src/components/darkagent/Ui.jsx', 'utf8');

if (!content.includes('ConnectWalletButton')) {
  const importAddition = "import { useAccount, useConnect, useDisconnect } from 'wagmi';\n";
  content = content.replace(/(import .*?\n)+/, match => match + importAddition);

  const connectButtonComponent = 
export function ConnectWalletButton() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { connectors, connect } = useConnect()

  if (isConnected) {
    return (
      <button 
        onClick={() => disconnect()}
        className="inline-flex items-center rounded-full border border-vault-green/40 bg-vault-green/10 px-4 py-2 text-sm font-medium text-vault-green transition hover:bg-vault-green/20"
      >
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </button>
    )
  }

  return (
    <button 
      onClick={() => connect({ connector: connectors[0] })}
      className="inline-flex items-center rounded-full bg-vault-green px-4 py-2 text-sm font-medium text-black transition flex-shrink-0 whitespace-nowrap hover:bg-vault-green/90"
    >
      Connect Wallet
    </button>
  )
}
;
  
  content = content.replace(/export function AppShell/, connectButtonComponent + '\nexport function AppShell');
  
  content = content.replace(
    /<Link\s*to=\"\/create\"[\s\S]*?>\s*Try Demo\s*<\/Link>/, 
    <div className="flex items-center gap-3">
            <Link
              to="/create"
              className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.08]"
            >
              Try Demo
            </Link>
            <ConnectWalletButton />
          </div>
  );

  fs.writeFileSync('frontend/src/components/darkagent/Ui.jsx', content);
  console.log('Added Connect Wallet button!');
} else {
  console.log('Already added');
}
