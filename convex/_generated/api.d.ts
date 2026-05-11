/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ViktorSpacesEmail from "../ViktorSpacesEmail.js";
import type * as auth from "../auth.js";
import type * as bankroll from "../bankroll.js";
import type * as chat from "../chat.js";
import type * as constants from "../constants.js";
import type * as debug from "../debug.js";
import type * as gameDetail from "../gameDetail.js";
import type * as games from "../games.js";
import type * as http from "../http.js";
import type * as leaderboard from "../leaderboard.js";
import type * as picks from "../picks.js";
import type * as players from "../players.js";
import type * as props from "../props.js";
import type * as seed from "../seed.js";
import type * as seedR5 from "../seedR5.js";
import type * as seedTestUser from "../seedTestUser.js";
import type * as settings from "../settings.js";
import type * as sports from "../sports.js";
import type * as testAuth from "../testAuth.js";
import type * as users from "../users.js";
import type * as viktorTools from "../viktorTools.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ViktorSpacesEmail: typeof ViktorSpacesEmail;
  auth: typeof auth;
  bankroll: typeof bankroll;
  chat: typeof chat;
  constants: typeof constants;
  debug: typeof debug;
  gameDetail: typeof gameDetail;
  games: typeof games;
  http: typeof http;
  leaderboard: typeof leaderboard;
  picks: typeof picks;
  players: typeof players;
  props: typeof props;
  seed: typeof seed;
  seedR5: typeof seedR5;
  seedTestUser: typeof seedTestUser;
  settings: typeof settings;
  sports: typeof sports;
  testAuth: typeof testAuth;
  users: typeof users;
  viktorTools: typeof viktorTools;
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
