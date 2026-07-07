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
    <div className="sticky bottom-0 mt-8 border-t border-white/70 bg-white/80 py-4 backdrop-blur-xl">
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
              className="rounded-full border border-line bg-white/80 px-4 py-2 text-sm font-medium text-neutral-800 transition duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
            >
              Back
            </button>
          ) : null}
          <button
            type="button"
            disabled={disabled}
            onClick={onAction}
            className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white shadow-button transition duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 active:translate-y-0 disabled:translate-y-0 disabled:bg-neutral-300 disabled:shadow-none"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
