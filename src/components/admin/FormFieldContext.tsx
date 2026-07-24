import type { ReactNode } from "react";

export function FormFieldContext({
  label,
  hint,
}: {
  label: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <>
      <span className="fieldLabel">{label}</span>
      {hint ? <span className="fieldHint">{hint}</span> : null}
    </>
  );
}
