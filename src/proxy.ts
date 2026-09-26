import { NextResponse, type NextRequest } from "next/server";

const disabledPath = "/work/7d-connect";

function isDisabledPath(pathname: string) {
  const decoded = decodeURIComponent(pathname);
  return decoded === disabledPath || decoded.startsWith(`${disabledPath}/`);
}

export function proxy(request: NextRequest) {
  let blocked = false;
  try {
    blocked = isDisabledPath(request.nextUrl.pathname);

    // Block the optimizer too, including copies cached before unpublishing.
    if (request.nextUrl.pathname === "/_next/image") {
      const source = request.nextUrl.searchParams.get("url");
      if (source) blocked = isDisabledPath(new URL(source, request.url).pathname);
    }
  } catch {
    return new NextResponse("Bad request", { status: 400 });
  }

  if (blocked) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/work/:path*", "/_next/image"],
};
