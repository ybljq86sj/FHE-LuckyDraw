import { toast } from "sonner";
import { ExternalLink } from "lucide-react";

const SEPOLIA_EXPLORER = "https://sepolia.etherscan.io/tx";

/**
 * Show transaction pending toast with loading spinner
 */
export const toastTxPending = (hash: `0x${string}`) => {
  toast.loading(
    <div className="flex items-center gap-2">
      <span>Transaction submitted...</span>
      <a
        href={`${SEPOLIA_EXPLORER}/${hash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-primary hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        View
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>,
    {
      id: hash,
      duration: Infinity
    }
  );
};

/**
 * Show transaction success toast with Etherscan link
 */
export const toastTxSuccess = (hash: `0x${string}`, message: string) => {
  toast.success(
    <div className="flex flex-col gap-1">
      <div className="font-semibold">{message}</div>
      <a
        href={`${SEPOLIA_EXPLORER}/${hash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        View on Etherscan
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>,
    {
      id: hash,
      duration: 5000
    }
  );
};

/**
 * Show transaction error toast with optional Etherscan link
 */
export const toastTxError = (hash: `0x${string}` | undefined, error: Error | string) => {
  const message = typeof error === 'string' ? error : (error.message || "Transaction failed");

  toast.error(
    <div className="flex flex-col gap-1">
      <div className="font-semibold">Transaction Failed</div>
      <div className="text-sm text-muted-foreground line-clamp-2">{message}</div>
      {hash && (
        <a
          href={`${SEPOLIA_EXPLORER}/${hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          View on Etherscan
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>,
    {
      id: hash || `error-${Date.now()}`,
      duration: 7000
    }
  );
};

/**
 * Show user rejected transaction toast
 */
export const toastUserRejected = () => {
  toast.error("Transaction rejected by user", {
    duration: 3000
  });
};

/**
 * Show encrypting status toast
 */
export const toastEncrypting = () => {
  return toast.loading("Encrypting your lottery numbers with FHE...", {
    id: "encrypting",
    duration: Infinity
  });
};

/**
 * Dismiss encrypting toast
 */
export const dismissEncryptingToast = () => {
  toast.dismiss("encrypting");
};

/**
 * Dismiss transaction toast by hash
 */
export const dismissTxToast = (hash: `0x${string}`) => {
  toast.dismiss(hash);
};
