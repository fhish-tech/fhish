# FHISH V2 - REAL FHE VOTING

## Updated: 2026-04-10

---

## Architecture: True FHE Voting

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        FHISH REAL FHE VOTING FLOW                        │
└─────────────────────────────────────────────────────────────────────────┘

    BROWSER                              GATEWAY                          CONTRACT
       │                                    │                                 │
       │  1. Encrypt vote locally           │                                 │
       │     (YES=1 or NO=0)                │                                 │
       │     ▼                               │                                 │
       │  ┌─────────────────────────────────┐│                                 │
       │  │ FhishClient.encryptVote()       ││                                 │
       │  │                                 ││                                 │
       │  │ - Generate keys locally         ││                                 │
       │  │ - publicKey.encrypt(value)      ││                                 │
       │  │ - Returns ~8KB ciphertext       ││                                 │
       │  └─────────────────────────────────┘│                                 │
       │                                    │                                 │
       │  2. Submit ciphertext               │                                 │
       │     POST /submit-vote              │                                 │
       │     {ciphertext: "0x...", vote: "yes"}                                 │
       │    ───────────────────────────────►│                                 │
       │                                    │ 3. Accumulate (FHE addition)    │
       │                                    │    serverKey.add(ct1, ct2)      │
       │                                    │    ← This is REAL FHE!          │
       │                                    │                                 │
       │  4. Response: totalYes, totalNo    │                                 │
       │    ◄───────────────────────────────│                                 │
       │                                    │                                 │
       │  5. Optional: Send hash to contract│                                 │
       │     vote(handleA, handleB)          │                                 │
       │    ────────────────────────────────────────────────────────────────►│
       │                                    │                                 │
       │  6. Request decryption             │                                 │
       │     POST /decrypt-tally            │                                 │
       │    ───────────────────────────────►│                                 │
       │                                    │ 7. Decrypt accumulated          │
       │                                    │    ct.decrypt(clientKey)        │
       │                                    │    ← Reveals total, not votes   │
       │                                    │                                 │
       │  8. Final tally: YES=X, NO=Y       │                                 │
       │    ◄───────────────────────────────│                                 │
       │                                    │                                 │
```

---

## Key Difference: FAKE vs REAL FHE

### FAKE (Before)
```
User encrypts vote → Send HASH to contract → Nothing accumulated
```

### REAL FHE (Now)
```
User encrypts vote → Send CIPHERTEXT to gateway → Gateway ACCUMULATES → Gateway DECRYPTS
```

The critical part: **Gateway does homomorphic addition on ciphertexts**
- YES votes are added: ct_yes1 + ct_yes2 + ct_yes3 = ct_total_yes
- NO votes are added: ct_no1 + ct_no2 = ct_total_no
- Only the FINAL TOTALS are decrypted

---

## Gateway Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/submit-vote` | None | Submit encrypted vote for accumulation |
| GET | `/tally-status` | None | Get current encrypted vote counts |
| POST | `/decrypt-tally` | Relayer secret | Decrypt accumulated votes |
| POST | `/close-voting` | Admin | Close voting |
| POST | `/reset-tally` | Admin | Reset tally |

### Submit Vote Request
```json
{
  "ciphertext": "0x010400000000...",
  "vote": "yes" | "no"
}
```

### Submit Vote Response
```json
{
  "success": true,
  "vote": "yes",
  "totalYes": 5,
  "totalNo": 3,
  "message": "Vote recorded and accumulated"
}
```

### Decrypt Tally Response
```json
{
  "yesVotes": 5,
  "noVotes": 3,
  "encryptedYesVotes": 5,
  "encryptedNoVotes": 3,
  "verified": true,
  "duration": "15.32"
}
```

---

## SDK Methods

```typescript
import { createFhishClient } from './lib/fhish';

const client = createFhishClient(provider, signer);
await client.init();

// Encrypt vote locally
const ciphertext = await client.encryptVote(true); // true = YES

// Submit to gateway for accumulation
const result = await client.submitVote(ciphertext, 'yes');

// Get current tally
const status = await client.getTallyStatus();

// Decrypt tally (requires relayer secret)
const tally = await client.decryptTally(RELAYER_SECRET);
```

---

## Ciphertext Size

Current: ~8KB per vote (V1_1_PARAM_MESSAGE_1_CARRY_1_COMPACT_PK_KS_PBS)

For smaller ciphertexts (2-4KB), would need custom parameters with LWE_dimension ~250-500.

---

## File Structure

```
fhish/
├── packages/fhish-wasm/
│   └── src/shortint_ops.rs
├── fhish-gateway/
│   ├── keys-shortint/
│   └── src/server.ts          # ← Updated with accumulation
└── fhish-demo/
    ├── lib/sdk/FhishClient.ts # ← Added submitVote(), decryptTally()
    ├── components/
    │   ├── VoteButton.tsx     # ← Updated to use gateway
    │   └── RevealButton.tsx   # ← Updated to decrypt via gateway
    └── app/proposal/[id]/page.tsx
```

---

## Testing

```bash
# Terminal 1: Gateway
cd fhish-gateway && npm run dev

# Terminal 2: Demo  
cd fhish-demo && npm run dev

# Open: http://localhost:3000/proposal/1
# 1. Connect wallet
# 2. Click "Vote YES" or "Vote NO"
# 3. Check console - see ciphertext and accumulation
# 4. Click "Reveal Tally"
# 5. See decrypted results
```

---

## Key Takeaways

1. **Vote is encrypted in browser** - No plaintext leaves user's device
2. **Gateway accumulates ciphertexts** - Homomorphic addition (FHE)
3. **Only totals decrypted** - Individual votes remain secret
4. **On-chain is optional** - Just for proof of vote existence

---

## References

- tfhe-rs: `_references/zama/tfhe-rs/`
- Shortint params: `tfhe/src/shortint/parameters/v1_1/classic/compact_pk/`
