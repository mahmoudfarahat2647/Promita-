/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as bookmarks from "../bookmarks.js";
import type * as categories from "../categories.js";
import type * as likes from "../likes.js";
import type * as prompts from "../prompts.js";
import type * as purchases from "../purchases.js";
import type * as search from "../search.js";
import type * as seed from "../seed.js";
import type * as unlocks from "../unlocks.js";
import type * as webhook from "../webhook.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  bookmarks: typeof bookmarks;
  categories: typeof categories;
  likes: typeof likes;
  prompts: typeof prompts;
  purchases: typeof purchases;
  search: typeof search;
  seed: typeof seed;
  unlocks: typeof unlocks;
  webhook: typeof webhook;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
