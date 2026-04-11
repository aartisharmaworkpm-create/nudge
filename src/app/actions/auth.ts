"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logout() {
  const cookieStore = await cookies();

  // Must use .set() with secure:true — .delete() omits Secure attribute
  // which browsers require to clear __Secure- and __Host- prefixed cookies
  cookieStore.set("__Secure-authjs.session-token", "", {
    maxAge: 0, path: "/", secure: true, httpOnly: true, sameSite: "lax",
  });
  cookieStore.set("__Secure-authjs.callback-url", "", {
    maxAge: 0, path: "/", secure: true, httpOnly: true, sameSite: "lax",
  });
  // __Host- prefix: must NOT have domain attribute
  cookieStore.set("__Host-authjs.csrf-token", "", {
    maxAge: 0, path: "/", secure: true, httpOnly: true, sameSite: "lax",
  });

  redirect("/login");
}
