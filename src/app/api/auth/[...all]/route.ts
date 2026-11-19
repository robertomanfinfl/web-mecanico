import { toNextJsHandler } from "better-auth/next-js";
import { authentication } from "@/lib/auth";

export const GET = (request: Request) => toNextJsHandler(authentication()).GET(request);
export const POST = (request: Request) => toNextJsHandler(authentication()).POST(request);
