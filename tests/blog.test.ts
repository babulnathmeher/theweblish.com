import assert from "node:assert/strict";
import test from "node:test";
import { canUseBlogSlug, publishedFilter } from "../src/features/blogs/visibility";
import { legacyArticleSlugs, reservedSlugs } from "../src/config/site";
import { slugFromTitle } from "../src/features/blogs/slug";
import { validateBlogInput } from "../src/features/blogs/validation";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

test("static and legacy article slugs cannot be created in the editor", () => {
  assert.equal(canUseBlogSlug("contact", reservedSlugs, legacyArticleSlugs), false);
  assert.equal(canUseBlogSlug("how-to-create-seo-friendly-website", reservedSlugs, legacyArticleSlugs), false);
  assert.equal(canUseBlogSlug("new-article", reservedSlugs, legacyArticleSlugs), true);
  assert.equal(canUseBlogSlug("../admin", reservedSlugs, legacyArticleSlugs), false);
});

test("public filter requires a published status and a release time", () => {
  const now = new Date("2026-09-29T00:00:00Z");
  assert.deepEqual(publishedFilter(now), { status: "PUBLISHED", publishedAt: { lte: now } });
});

test("title suggests a permalink without changing manually edited slugs on the server", () => {
  assert.equal(slugFromTitle("A Better Website, Today!"), "a-better-website-today");
  assert.equal(slugFromTitle("Crème & Design"), "creme-design");
  const data = new FormData();
  data.set("title", "A Better Website");
  data.set("slug", "custom-story");
  data.set("authorId", "staff-user");
  const validated = validateBlogInput(data);
  assert.equal(validated.success, true);
  if (validated.success) assert.equal(validated.data.slug, "custom-story");
});

test("automatic blog permalinks use the current title and manual input is normalized", () => {
  const data = new FormData();
  data.set("title", "A Fresh Website Article");
  data.set("slug", "old-title-that-was-still-in-the-form");
  data.set("slugMode", "auto");
  data.set("authorId", "staff-user");
  const automatic = validateBlogInput(data);
  assert.equal(automatic.success, true);
  if (automatic.success) assert.equal(automatic.data.slug, "a-fresh-website-article");

  data.set("slugMode", "manual");
  data.set("slug", "My Custom URL!");
  const manual = validateBlogInput(data);
  assert.equal(manual.success, true);
  if (manual.success) assert.equal(manual.data.slug, "my-custom-url");
});

test("reserved blog URLs stay blocked while an existing legacy URL can be edited", () => {
  const data = new FormData();
  data.set("title", "A useful article");
  data.set("authorId", "staff-user");
  data.set("slug", "contact");
  const publicPage = validateBlogInput(data);
  assert.equal(publicPage.success, false);
  if (!publicPage.success) assert.match(publicPage.fields.slug, /website page/);

  const legacy = "how-to-create-seo-friendly-website";
  data.set("slug", legacy);
  const newPost = validateBlogInput(data);
  assert.equal(newPost.success, false);
  if (!newPost.success) assert.match(newPost.fields.slug, /original article/);
  const editExisting = validateBlogInput(data, "save", legacy);
  assert.equal(editExisting.success, true);
});

test("original legacy content can be saved privately and requires confirmation again to publish", () => {
  const slug = "ever-wondered-how-websites-work";
  const data = new FormData();
  data.set("title", "Ever Wondered How Websites Work?");
  data.set("slug", slug);
  data.set("authorId", "staff-user");
  data.set("content", "The supplied original article content.");
  const unconfirmed = validateBlogInput(data, "save");
  assert.equal(unconfirmed.success, false);
  data.set("legacyOriginalImport", "yes");
  data.set("slugMode", "auto");
  data.set("slug", "stale-slug");
  const draft = validateBlogInput(data, "save");
  assert.equal(draft.success, true);
  if (draft.success) assert.equal(draft.data.slug, slug);

  data.set("slugMode", "manual");
  data.set("slug", slug);
  data.delete("legacyOriginalImport");
  const publishWithoutReview = validateBlogInput(data, "publish", slug);
  assert.equal(publishWithoutReview.success, false);
  data.set("legacyOriginalImport", "yes");
  const published = validateBlogInput(data, "publish", slug);
  assert.equal(published.success, true);

  data.delete("content");
  const emptyOriginal = validateBlogInput(data, "save");
  assert.equal(emptyOriginal.success, false);
  if (!emptyOriginal.success) assert.match(emptyOriginal.fields.content, /original article content/);
});

test("incomplete posts can be saved as drafts but cannot be published", () => {
  const data = new FormData();
  data.set("title", "An unfinished article");
  data.set("authorId", "staff-user");
  const draft = validateBlogInput(data, "save");
  assert.equal(draft.success, true);
  if (draft.success) {
    assert.equal(draft.data.slug, "an-unfinished-article");
    assert.equal(draft.data.content, "");
  }
  const publish = validateBlogInput(data, "publish");
  assert.equal(publish.success, false);
  if (!publish.success) assert.equal(publish.fields.content, "Add the article body before publishing.");
});

test("blog Markdown renders semantic HTML while ignoring raw script tags", () => {
  const source = "# Title\n\nA paragraph with [a link](https://example.com).\n\n- One\n- Two\n\n1. First\n2. Second\n\n<script>alert(1)</script>";
  const html = renderToStaticMarkup(createElement(Markdown, { skipHtml: true, remarkPlugins: [remarkGfm] }, source));
  assert.match(html, /<h1>Title<\/h1>/);
  assert.match(html, /<p>A paragraph/);
  assert.match(html, /<ul>/);
  assert.match(html, /<ol>/);
  assert.match(html, /<a href="https:\/\/example.com">a link<\/a>/);
  assert.doesNotMatch(html, /<script|alert\(1\)/);
  const unsafeLink = renderToStaticMarkup(createElement(Markdown, { skipHtml: true, remarkPlugins: [remarkGfm] }, "[bad](javascript:alert(1))"));
  assert.doesNotMatch(unsafeLink, /href="javascript:/);
  const headings = renderToStaticMarkup(createElement(Markdown, { skipHtml: true, remarkPlugins: [remarkGfm] },
    [1, 2, 3, 4, 5, 6].map((level) => `${"#".repeat(level)} Level ${level}`).join("\n\n")));
  for (const level of [1, 2, 3, 4, 5, 6]) assert.match(headings, new RegExp(`<h${level}>Level ${level}</h${level}>`));
});
