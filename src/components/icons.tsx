import type { SVGProps } from "react";

export function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M20.2 11.7a8.2 8.2 0 0 1-12.3 7.1L3 20l1.3-4.7a8.2 8.2 0 1 1 15.9-3.6Z" />
      <path d="M8.6 7.4c-.3-.2-.9-.2-1.1.1-.5.6-.7 1.3-.4 2.1 1.1 3.1 3.3 5.2 6.4 6 .8.2 1.7-.3 2-1 .2-.5.1-.9-.3-1.1l-1.6-.8c-.3-.1-.5 0-.7.3l-.6.7c-1.7-.7-2.9-1.8-3.5-3.3l.6-.7c.2-.2.3-.5.1-.8l-.9-1.5Z" />
    </svg>
  );
}

export function Botanical({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 180 230"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
      aria-hidden="true"
    >
      <path d="M38 230C59 192 68 145 89 109s37-58 37-100M74 158C33 158 21 134 16 110c31 2 54 17 58 48ZM80 139c35 0 60-22 67-43-32 0-54 16-67 43ZM94 102C57 94 54 69 52 47c29 8 43 23 42 55ZM108 76c37-7 47-32 45-52-24 7-40 25-45 52ZM121 42c-26-12-25-31-20-42 19 10 27 22 20 42ZM60 192c35 2 60-13 74-33-33-5-57 11-74 33Z" />
      <path d="m74 158-44-34m50 15 51-34m-37-3L65 65m43 11 35-39m-83 155 60-26" />
    </svg>
  );
}

export function Diamond({ className = "" }: { className?: string }) {
  return (
    <span className={`diamond ${className}`} aria-hidden="true">
      ✧
    </span>
  );
}
