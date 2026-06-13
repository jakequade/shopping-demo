"use client";

import { ReactNode } from "react";
import { CartView } from "./CartView";
import { CartBadge } from "./CartBadge";

export function CartDrawer({ children }: { children: ReactNode }) {
  return (
    <div className="drawer lg:drawer-open">
      <input id="cart-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <nav className="navbar bg-base-100 border-b border-base-200 px-4">
          <div className="flex-1">
            <h1 className="text-xl font-bold">Pet Circle</h1>
          </div>
          <div className="flex-none lg:hidden">
            <label
              htmlFor="cart-drawer"
              className="btn btn-square btn-ghost relative"
              aria-label="Open cart"
            >
              <CartBadge />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                />
              </svg>
            </label>
          </div>
        </nav>
        <main className="p-6">{children}</main>
      </div>
      <div className="drawer-side z-10">
        <label htmlFor="cart-drawer" className="drawer-overlay" />
        <div className="min-h-full w-80 bg-base-100 p-4">
          <CartView />
        </div>
      </div>
    </div>
  );
}