# Smart Nurse Lab canonical修正の反映メモ

作成日：2026年7月18日

## 反映内容

- 現行43ページへ自己参照`rel="canonical"`を追加。
- トップページの正規URLを`https://www.smartnurselab.com/`に統一。
- 記事一覧の正規URLを`https://www.smartnurselab.com/articles/`に統一。
- 各記事・固定ページは`https://www.smartnurselab.com/`配下の絶対URLをcanonicalに指定。
- 内部リンクから`index.html`表記を除き、正規URLへ統一。
- `favorite-things.html`をサイトマップへ追加。
- 公開重複の原因になっていた`smart-nurse-lab-pages/`を現行サイトツリーから削除。

## 重要：公開時の削除操作

差分ZIPを既存サイトへ上書きするだけでは、サーバー上の旧フォルダは消えません。GitHubへ反映するときは、リポジトリ上の次のフォルダをディレクトリごと削除してください。

`smart-nurse-lab-pages/`

ローカル作業ツリーでは削除済みです。Gitで公開する場合は、このフォルダ内32ファイルの削除差分もコミット対象に含めます。

削除前の内容は次へバックアップ済みです。

`smart-nurse-lab-legacy-duplicate-pages-backup-20260718.zip`

## 公開後の確認

1. `https://www.smartnurselab.com/smart-nurse-lab-pages/`が404になることを確認。
2. トップ、記事一覧、任意の記事のHTMLソースに正しいcanonicalが1件だけあることを確認。
3. Search Consoleで`https://www.smartnurselab.com/sitemap.xml`を再送信。
4. 対象レポートの「修正を検証」を実行。
5. 再クロールと判定更新には時間がかかるため、即日で警告が消えなくても待つ。

## 別途必要なDNS対応

`https://smartnurselab.com/`（wwwなし）は、確認時点でSSL証明書のホスト名が一致していません。canonical修正とは別に、GitHub Pagesのカスタムドメイン設定とDNSを確認し、wwwなしから`https://www.smartnurselab.com/`へ安全にリダイレクトできる状態にしてください。
