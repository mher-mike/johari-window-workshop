"use client";

type Props = {
  count?: string;
  message?: string;
  actionLabel: string;
  disabled?: boolean;
  onBack?: () => void;
  onAction: () => void;
};

export function BottomBar({ count, message, actionLabel, disabled, onBack, onAction }: Props) {
  return (
    <div className="sticky bottom-0 mt-8 border-t border-line bg-white/95 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-[760px] items-center justify-between gap-3 px-5">
        <div className="min-w-0">
          {count ? <p className="text-sm font-medium text-neutral-900">{count}</p> : null}
          {message ? <p className="text-sm text-neutral-500">{message}</p> : null}
        </div>
        <div className="flex shrink-0 gap-2">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="rounded-md border border-line bg-white px-4 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
            >
              Back
            </button>
          ) : null}
          <button
            type="button"
            disabled={disabled}
            onClick={onAction}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:bg-neutral-300"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
