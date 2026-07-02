/**
 * RINRO — Cloudflare Web Analytics loader
 * ---------------------------------------
 * プライバシー配慮型（Cookieレス・個人を特定する情報を収集しない）アクセス解析。
 * トークンをこの1ファイルで管理するため、各ページ側の変更は不要です。
 *
 * 【有効化の手順】
 *   1. Cloudflare にログイン（無料アカウントで可。ドメインをCloudflareへ移す必要はありません）
 *   2. Analytics & Logs → Web Analytics → "Add a site" で rinro.jp を追加
 *   3. 発行される JS beacon トークンをコピー
 *   4. 下の CF_BEACON_TOKEN の値をそのトークンに置き換える（変更はここだけ）
 *
 * トークンは公開情報です（ページソースに現れても問題ありません）。
 * 置き換えるまでは計測は無効（ビーコンを読み込みません）。
 */
(function () {
  "use strict";

  var CF_BEACON_TOKEN = "__CF_BEACON_TOKEN__"; // ← Cloudflare のトークンに置き換える

  // 未設定（プレースホルダのまま）なら何も読み込まない
  if (!CF_BEACON_TOKEN || CF_BEACON_TOKEN === "__CF_BEACON_TOKEN__") return;

  var beacon = document.createElement("script");
  beacon.defer = true;
  beacon.src = "https://static.cloudflareinsights.com/beacon.min.js";
  beacon.setAttribute("data-cf-beacon", JSON.stringify({ token: CF_BEACON_TOKEN }));
  document.head.appendChild(beacon);
})();
