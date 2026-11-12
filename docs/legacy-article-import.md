# Import a preserved blog article

The seven legacy article URLs in `route-migration-checklist.md` are reserved for their original content. Admins can now add that content through the blog editor without changing the URL.

1. Open `/admin/blogs/new/` and enter the original article title. The permalink is suggested from the title; keep the audited slug exactly as listed in the route checklist.
2. Paste the original article body into the editor. Add the excerpt, author, cover image, and SEO fields when available. The editor currently accepts pasted content; it does not import a DOCX file.
3. Check **I am importing the original article content for this URL**, then choose **Save draft**. A reserved legacy URL requires nonempty article content before its draft can be created.
4. Review the saved draft with **Preview saved post**. Drafts remain private and the public legacy URL remains a 404.
5. On the edit page, check the original-content confirmation again and choose **Publish** when the content has been reviewed. Quick publishing from the posts table is disabled for legacy URLs.

The editor still rejects static website routes such as `/contact/`. Existing blog slugs remain unique, so an imported article cannot overwrite another post. This workflow does not supply or publish any original article by itself.
